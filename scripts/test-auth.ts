import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables from .env file
config()

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.error('Error: SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY must be set in .env')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)

async function testAuth() {
  const email = process.argv[2]
  const password = process.argv[3]

  if (!email || !password) {
    console.log('Usage: npx tsx scripts/test-auth.ts <email> <password>')
    process.exit(1)
  }

  console.log(`1. Logging in as ${email}...`)

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('Login Failed:', error.message)
    process.exit(1)
  }

  const token = data.session.access_token
  console.log('Login Successful!')
  console.log('Access Token (truncated):', `${token.substring(0, 20)}...`)

  console.log('\n2. Testing /api/v2/garden/plants endpoint...')

  try {
    const response = await fetch('http://localhost:3000/api/v2/gardens/plants', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    console.log(`Response Status: ${response.status}`)
    const json = await response.json()
    console.log('Response Body:', JSON.stringify(json, null, 2))

    if (response.ok) {
      console.log('\n✅ TEST PASSED: Authentication and API request successful.')
    } else {
      console.log('\n❌ TEST FAILED: API request returned an error.')
    }
  } catch (err) {
    console.error('API Request Failed:', err)
  }
}

testAuth()
