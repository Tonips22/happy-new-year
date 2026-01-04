import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const CRON_SECRET = Deno.env.get('CRON_SECRET');
// El nombre de la tabla debe coincidir exactamente (case-sensitive)
const TABLE_NAME = 'subscribers';
const handler = async (req)=>{
  // Comprobación de variables de entorno para evitar fallos de null/undefined
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response('Environment keys missing.', {
      status: 500
    });
  }
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    // Intento de actualización masiva
    const { error, count } = await supabase.from(TABLE_NAME).update({
      newsletter_sent: false
    }).is('newsletter_sent', true) // Solo actualizamos los que están en TRUE (optimización)
    .select('*', {
      count: 'exact'
    }); // Usamos select con count para obtener la cuenta de actualizados
    if (error) {
      console.error('❌ Error de Supabase al resetear:', error.message);
      // Devolvemos el error de la base de datos al cliente para que lo veas
      return new Response(JSON.stringify({
        error: `DB Error: ${error.message}`
      }), {
        status: 500
      });
    }
    console.log(`✅ Reseteados ${count} registros.`);
    return new Response(JSON.stringify({
      success: true,
      message: `Estatus de envío reseteado a false para ${count} registros.`
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    // Fallo de red, inicialización, o cualquier excepción no manejada.
    return new Response(JSON.stringify({
      error: 'Error crítico de ejecución',
      details: error instanceof Error ? error.message : 'Unknown exception'
    }), {
      status: 500
    });
  }
};
Deno.serve(handler);
