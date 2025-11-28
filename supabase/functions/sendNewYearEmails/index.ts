import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
// Importante: Usa la Service Role Key para saltarte las reglas RLS si es necesario
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const CRON_SECRET = Deno.env.get('CRON_SECRET');
const handler = async (_request)=>{
  // --- LÓGICA DE SEGURIDAD (EL PORTERO) ---
  const url = new URL(_request.url);
  const secretParam = url.searchParams.get('secret');
  if (secretParam !== CRON_SECRET) {
    console.error('⛔ Intento de acceso no autorizado');
    return new Response('Unauthorized: Invalid Secret', {
      status: 401
    });
  }
  // 1. Inicializamos Supabase
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  // 2. Obtenemos los suscriptores (email y token)
  const { data: subscribers, error } = await supabase.from('subscribers').select('email, unsubscribe_token');
  if (error) {
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500
    });
  }
  // Si no hay nadie, terminamos rápido
  if (!subscribers || subscribers.length === 0) {
    return new Response(JSON.stringify({
      message: 'No subscribers found'
    }), {
      status: 200
    });
  }
  // 3. Preparamos los envíos (Array de promesas)
  // Usamos Promise.all para lanzarlos en paralelo, es más rápido que un bucle for
  const emailPromises = subscribers.map((user)=>{
    const unsubUrl = `https://happynewyear.es/cancelar?token=${user.unsubscribe_token}`;
    // El HTML lo puedes poner aquí o en una variable aparte
    const emailHtml = `
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 600px; font-size: 14px; line-height: 155%; color:0a0a0a">
          <p>Hola,</p>

          <p>Espero no pillarte de resaca.</p>

          <p>Solo quiero desearte un 2026 lleno de metas cumplidas y sueños que por fin se hacen realidad. Ojalá este año te encuentres con la <span style="color: #FFD700; font-weight: bold;">fuerza</span>, la <span style="color: #FFD700; font-weight: bold;">constancia</span> y la <span style="color: #FFD700; font-weight: bold;">paciencia</span> para construir aquello que más deseas en este mundo.</p>

          <p>Al final, nada grande llega por casualidad: llega por <span style="color: #FFD700; font-weight: bold;">insistir, insistir, insistir... e insistir incluso cuando nos den por muerto/a.</span></p>

          <p>Brindo porque este año te atrevas un poco más, avances un poco más y creas en ti mucho más.</p>

          <p>Feliz Año Nuevo.</p>
          <p>Que venga cargado de verdad.</p>

          <p>Un abrazo,</p>
          <p>Toni</p>

          <a href="https://www.happynewyear.es/" style="color: #FFD700; font-size: 10px; font-style: italic;">happynewyear.es</a>
          <a href="${unsubUrl}" style="color: 0a0a0a; margin-left: 8px; font-size: 10px; font-style: italic;">Cancelar subscripción</a>
                    
      </body>
    `;
    return fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'Feliz Año Nuevo <happy@happynewyear.es>',
        to: user.email,
        subject: 'Un pasito más cerca - Feliz Año Nuevo 2026',
        html: emailHtml
      })
    });
  });
  // Ejecutamos todos los envíos
  await Promise.all(emailPromises);
  return new Response(JSON.stringify({
    success: true,
    sent_count: subscribers.length
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
};
Deno.serve(handler);
