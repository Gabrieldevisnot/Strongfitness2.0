import { createClient } from '@supabase/supabase-js';

// Verificação de segurança para garantir que as chaves existem
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Faltam as variáveis de ambiente do Supabase (.env.local)");
}

export const supabase = createClient(supabaseUrl, supabaseKey);