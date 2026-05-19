const SUPABASE_URL = 'YOUR_SUPABASE_URL'
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY'
const USER_ID      = 'YOUR_TEST_USER_ID' // replace after auth flow

document.getElementById('capture').addEventListener('click', async () => {
  const status      = document.getElementById('status')
  const senderName  = document.getElementById('sender').value
  const description = document.getElementById('description').value

  status.textContent = 'Capturing...'

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

  const metadata = {
    url:         tab.url,
    platform:    new URL(tab.url).hostname,
    timestamp:   new Date().toISOString(),
    sender_name: senderName,
    description: description,
    user_id:     USER_ID,
  }

  // SHA-256 hash of URL + timestamp
  const raw     = metadata.url + metadata.timestamp
  const encoded = new TextEncoder().encode(raw)
  const hashBuf = await crypto.subtle.digest('SHA-256', encoded)
  const hashArr = Array.from(new Uint8Array(hashBuf))
  const hash    = hashArr.map(b => b.toString(16).padStart(2, '0')).join('')

  metadata.sha256_hash = hash

  // Save to Supabase
  const res = await fetch(`${SUPABASE_URL}/rest/v1/incidents`, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'apikey':        SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Prefer':        'return=representation',
    },
    body: JSON.stringify(metadata),
  })

  if (res.ok) {
    status.textContent = '✅ Evidence captured & secured!'
  } else {
    status.textContent = '❌ Failed. Check console.'
    console.error(await res.text())
  }
})