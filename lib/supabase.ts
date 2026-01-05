import { createClient } from '@supabase/supabase-js'

// We use the Service Role Key to bypass RLS for simplicity in this server-side-only implementation.
// This allows us to strictly control data via our API routes without complex policies.
// CAUTION: Never expose this key to the client (browser).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_key'

export const supabase = createClient(supabaseUrl, supabaseKey)
