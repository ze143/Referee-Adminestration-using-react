// ✅ استخدم SUPABASE_PUBLISHABLE_KEYS (مش SUPABASE_ANON_KEY)
const publishableKeys = JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS') || '{}')
const publishableKey = publishableKeys['default']
if (!publishableKey) throw new Error('Publishable key not found')

const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  publishableKey,
  { global: { headers: { Authorization: `Bearer ${token}` } } }
)

// ✅ استخدم SUPABASE_SECRET_KEYS للإنشاء
const secretKeys = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') || '{}')
const secretKey = secretKeys['default']
if (!secretKey) throw new Error('Secret key not found')

const adminClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', secretKey)