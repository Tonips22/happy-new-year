import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const CRON_SECRET = Deno.env.get('CRON_SECRET');
// CONFIGURACIÓN DE LÍMITES
const BATCH_SIZE = 10; // Enviaremos solo 10 emails por ejecución
const DELAY_MS = 1000; // 1 segundo de espera entre emails (Resend permite 2/seg, así vamos sobrados)
const handler = async (_request)=>{
  // --- SEGURIDAD ---
  const url = new URL(_request.url);
  const secretParam = url.searchParams.get('secret');
  if (secretParam !== CRON_SECRET) {
    return new Response('Unauthorized', {
      status: 401
    });
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  // 1. OBTENER LOTE PENDIENTE
  // Solo traemos usuarios que NO hayan recibido el correo aún
  const { data: subscribers, error } = await supabase.from('subscribers').select('id, email, unsubscribe_token') // Importante traer el ID para actualizar luego
  .eq('newsletter_sent', false) // Solo los pendientes
  .limit(BATCH_SIZE); // Solo procesamos un lote pequeño
  if (error) return new Response(JSON.stringify({
    error: error.message
  }), {
    status: 500
  });
  if (!subscribers || subscribers.length === 0) {
    return new Response(JSON.stringify({
      message: 'Todos los correos han sido enviados. Misión cumplida.'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
  console.log(`Procesando lote de ${subscribers.length} correos...`);
  let sentCount = 0;
  let errorCount = 0;
  // 2. PROCESO SECUENCIAL (Bucle for...of)
  // Usamos for...of para poder usar "await" dentro y pausar la ejecución
  for (const user of subscribers){
    // --- Preparar HTML (abreviado para el ejemplo) ---
    const unsubUrl = `https://happynewyear.es/cancelar?token=${user.unsubscribe_token}`;
    // ... Tu HTML completo aquí ...
    const emailHtml = `
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 600px; font-size: 14px; line-height: 155%; color:0a0a0a">
        <p>Hola,</p>

        <p>Espero que hayas empezado el año como los de resacón, bueno... con todos tus dientes y sin tatuajes nuevos.</p>

        <p>Simplemente deseo que este 2026 te propongas menos cosas… pero las cumplas de verdad. No hace falta una lista gigante de objetivos: con que mejores un poco lo que ya haces, vas por buen camino.</p>
        
        <p>Prioriza lo que te hace bien. Atrévete a hacer eso que llevas tiempo posponiendo por miedo a fracasar, si no lo intentas, nada cambia.</p>

        <p style=" font-weight: bold;">No tiene que ser un año perfecto, solo un año mejor.</p>
        
        <p>Brindo por que este año te atrevas un poco más, avances aunque sea despacio y confíes un poco más en ti.</p>

        <p>Feliz Año Nuevo.</p>

        <p>
          Un abrazo,<br>
          Toni
        </p>

        <a href="https://www.happynewyear.es/" style="color: #FFD700; font-size: 10px; font-style: italic;">happynewyear.es</a>
        <a href="${unsubUrl}" style="color: #FFD700; margin-left: 8px; font-size: 10px; font-style: italic;">Cancelar subscripción</a>
      </body>
    `;
    try {
      // Enviar con Resend
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: 'Feliz Año Nuevo <happy@happynewyear.es>',
          to: user.email,
          subject: 'Un pasito más cerca - Feliz Año Nuevo 2026',
          html: emailHtml
        })
      });
      if (!res.ok) {
        const errData = await res.text();
        console.error(`Error enviando a ${user.email}:`, errData);
        errorCount++;
        continue; // Pasamos al siguiente sin marcar este como enviado
      }
      // 3. ACTUALIZAR BASE DE DATOS
      // Si llegamos aquí, Resend aceptó el correo. Lo marcamos como enviado.
      const { error: updateError } = await supabase.from('subscribers').update({
        newsletter_sent: true
      }).eq('id', user.id);
      if (updateError) {
        console.error(`Error actualizando DB para ${user.email}`, updateError);
      } else {
        sentCount++;
        console.log(`✅ Enviado a ${user.email}`);
      }
    } catch (err) {
      console.error(`Excepción con ${user.email}`, err);
      errorCount++;
    }
    // 4. PAUSA OBLIGATORIA (Rate Limiting)
    // Esperamos 1000ms antes de la siguiente iteración
    await new Promise((resolve)=>setTimeout(resolve, DELAY_MS));
  }
  return new Response(JSON.stringify({
    success: true,
    processed: subscribers.length,
    sent: sentCount,
    errors: errorCount,
    remaining_in_batch: 0
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
};
Deno.serve(handler);
