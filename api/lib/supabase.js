import { createClient } from '@supabase/supabase-js'
import { debug } from 'console'

console.log('▶️ SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('▶️ SUPABASE_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase     = createClient(supabaseUrl, supabaseKey,{auth:{debug:true}})

export default supabase
