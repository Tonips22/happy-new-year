import { supabase, supabaseAdmin } from '@/api/supabase.js'

const TABLE_NAME = 'subscribers'

export const subscribeEmail = async (email: string) => {

  const { data, error } = await supabaseAdmin
    .from(TABLE_NAME)
    .insert([{ email }]);

  if (error) {
    return {
      success: false,
      error: error.message
    };
  }
  return {
    success: true,
    error: null
  };
}