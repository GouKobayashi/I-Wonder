import 'server-only'

import { createClient } from '@supabase/supabase-js'

function getSupabaseAdminEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY

  if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error('Missing server-side Supabase environment variables')
  }

  return {
    supabaseUrl,
    supabaseSecretKey,
  }
}

export function getSupabaseAdmin() {
  const { supabaseUrl, supabaseSecretKey } = getSupabaseAdminEnv()

  return createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
