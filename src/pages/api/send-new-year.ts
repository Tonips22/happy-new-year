// src/pages/api/send-new-year.ts
import type { APIRoute } from 'astro';
import { supabaseAdmin } from '@api/supabase';
import { Resend } from 'resend';

// Validar variables de entorno
const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;
const CRON_SECRET = import.meta.env.CRON_SECRET;

if (!RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY no configurada');
}
if (!CRON_SECRET) {
  throw new Error('CRON_SECRET no configurada');
}

const resend = new Resend(RESEND_API_KEY);

export const GET: APIRoute = async ({ request }) => {
  // Seguridad: Solo Vercel Cron puede llamar
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    console.error('❌ Intento de acceso no autorizado');
    return new Response('Unauthorized', { status: 401 });
  }

  console.log('🚀 Iniciando envío masivo de emails...');

  try {
    // Obtener TODOS los suscriptores
    const { data: subscribers, error } = await supabaseAdmin
      .from('subscribers')
      .select('email, unsubscribe_token');

    if (error) {
      console.error('❌ Error al obtener suscriptores:', error);
      throw error;
    }

    if (!subscribers || subscribers.length === 0) {
      console.log('⚠️ No hay suscriptores');
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: 'Sin suscriptores' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📧 Enviando a ${subscribers.length} suscriptores...`);

    // Preparar emails
    const emailPromises = subscribers.map(sub => {
      const unsubUrl = `https://happynewyear.es/cancelar?token=${sub.unsubscribe_token}`;
      
      return resend.emails.send({
        from: 'Feliz Año Nuevo <happy@happynewyear.es>',
        to: sub.email,
        subject: '🎉 ¡FELIZ AÑO NUEVO 2026!',
        html: `
          <!DOCTYPE html>
          <html lang="es">
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background: #0a0a0a; color: white;">
              
              <!-- Contenedor principal -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #0a0a0a;">
                
                <!-- Header con gradiente -->
                <tr>
                  <td style="padding: 60px 20px; text-align: center; background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);">
                    <h1 style="margin: 0; font-size: 48px; color: #0a0a0a; font-weight: bold;">
                      🎊 ¡FELIZ 2026! 🎊
                    </h1>
                  </td>
                </tr>
                
                <!-- Contenido -->
                <tr>
                  <td style="padding: 40px 30px; background: #1a1a1a; border-radius: 10px;">
                    <p style="font-size: 24px; margin: 0 0 20px; text-align: center; color: #FFD700;">
                      ¡Ha llegado el momento! 🥳
                    </p>
                    
                    <p style="font-size: 18px; line-height: 1.8; color: #cccccc; text-align: center; margin: 0 0 30px;">
                      Gracias por celebrar con nosotros el inicio de este nuevo año.<br>
                      Te deseamos un <strong>2026 lleno de alegría, salud y éxitos</strong>. 🍾✨
                    </p>
                    
                    <!-- Imagen/GIF -->
                    <div style="text-align: center; margin: 40px 0;">
                      <img src="https://media.giphy.com/media/26tOZ42Mg6pbTUPHW/giphy.gif" 
                           alt="Fuegos artificiales" 
                           style="max-width: 100%; height: auto; border-radius: 10px; border: 3px solid #FFD700;">
                    </div>
                    
                    <p style="font-size: 16px; color: #999999; text-align: center; margin: 30px 0 0;">
                      ¿Te gustó? Comparte la cuenta atrás:<br>
                      <a href="https://happynewyear.es" 
                         style="color: #FFD700; text-decoration: none; font-weight: bold; font-size: 18px;">
                        happynewyear.es
                      </a>
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 30px 20px; text-align: center; border-top: 1px solid #333333;">
                    <p style="margin: 0 0 10px; font-size: 14px; color: #666666;">
                      happynewyear.es | España 🇪🇸
                    </p>
                    <p style="margin: 0; font-size: 12px; color: #555555;">
                      <a href="${unsubUrl}" 
                         style="color: #888888; text-decoration: underline;">
                        Cancelar suscripción
                      </a>
                    </p>
                  </td>
                </tr>
                
              </table>
              
            </body>
          </html>
        `
      });
    });

    // Enviar en paralelo (Resend permite 100 req/s en plan gratuito)
    const results = await Promise.allSettled(emailPromises);
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    // Log de errores específicos
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`❌ Error enviando a ${subscribers[index].email}:`, result.reason);
      }
    });

    console.log(`✅ Enviados: ${successful} | ❌ Fallidos: ${failed}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: successful, 
        failed,
        total: subscribers.length,
        timestamp: new Date().toISOString()
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('💥 Error crítico enviando emails:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Error en envío masivo',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
