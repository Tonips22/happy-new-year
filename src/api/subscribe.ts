import { supabase, supabaseAdmin } from '@/api/supabase.js'

const TABLE_NAME = 'subscribers'

export const subscribeEmail = async (email: string) => {
  const normalizedEmail = email.toLowerCase().trim();

  const { data, error } = await supabaseAdmin
    .from(TABLE_NAME)
    .insert([{ email: normalizedEmail }]);

  if (error) {
    if (error.code === '23505') {
      return { success: true, error: null };
    }
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}