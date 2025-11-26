import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

interface Subscriber {
  email: string
  unsubscribe_token: string
}

Deno.serve(async (req) => {
  console.log('🚀 Iniciando envío masivo de emails de Año Nuevo...')

  try {
    // Verificar que la petición viene de un cron autorizado
    const authHeader = req.headers.get('Authorization')
    
    // Permitir peticiones sin auth solo si vienen del cron interno de Supabase
    // O si tienen la service role key
    const isFromCron = req.headers.get('user-agent')?.includes('pg_net')
    const hasValidAuth = authHeader?.includes(Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '')
    
    if (!isFromCron && !hasValidAuth) {
      console.error('❌ Acceso no autorizado')
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    // Obtener todos los suscriptores
    const { data: subscribers, error: dbError } = await supabaseAdmin
      .from('subscribers')
      .select('email, unsubscribe_token')

    if (dbError) {
      console.error('❌ Error al obtener suscriptores:', dbError)
      throw dbError
    }

    if (!subscribers || subscribers.length === 0) {
      console.log('⚠️ No hay suscriptores')
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: 'Sin suscriptores' }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log(`📧 Enviando emails a ${subscribers.length} suscriptores... `)

    // Enviar emails en lotes de 10 para evitar rate limits
    const BATCH_SIZE = 10
    let successful = 0
    let failed = 0

    for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
      const batch = subscribers.slice(i, i + BATCH_SIZE)
      
      const promises = batch.map(async (subscriber: Subscriber) => {
        try {
          const unsubUrl = `https://happynewyear.es/cancelar?token=${subscriber.unsubscribe_token}`
          
          const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: 'Feliz Año Nuevo <happy@happynewyear.es>',
              to: subscriber.email,
              subject: 'Un pasito más cerca - Feliz Año Nuevo 2026',
              html: `
                <!DOCTYPE html>
                <html lang="es">
                  <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                  </head>
                  <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background: #0a0a0a; color: white; max-width: 600px; font-size: 14px; line-height: 155%;">
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
                    <a href="${unsubUrl}" style="color: #FFF; margin-left: 8px; font-size: 10px; font-style: italic;">Cancelar subscripción</a>
                    
                  </body>
                </html>
              `,
            }),
          })

          if (response.ok) {
            successful++
            console.log(`✅ Email enviado a ${subscriber.email}`)
          } else {
            const error = await response.text()
            failed++
            console.error(`❌ Error enviando a ${subscriber.email}:`, error)
          }
        } catch (error) {
          failed++
          console.error(`❌ Error enviando a ${subscriber.email}:`, error)
        }
      })

      await Promise.all(promises)
      
      // Esperar 1 segundo entre lotes para respetar rate limits
      if (i + BATCH_SIZE < subscribers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    console.log(`✅ Enviados: ${successful} | ❌ Fallidos: ${failed}`)

    return new Response(
      JSON.stringify({
        success: true,
        sent: successful,
        failed,
        total: subscribers.length,
        timestamp: new Date().toISOString(),
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('💥 Error crítico:', error)
    return new Response(
      JSON.stringify({
        error: 'Error en envío masivo',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})