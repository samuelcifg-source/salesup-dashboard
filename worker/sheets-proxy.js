// Cloudflare Worker — Google Sheets API Proxy
// Deploy as separate Worker, add env vars: GOOGLE_SERVICE_ACCOUNT_KEY, SHEET_ID

const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';

async function getAccessToken(serviceAccountKey) {
  const key = JSON.parse(serviceAccountKey);
  const now = Math.floor(Date.now() / 1000);
  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = btoa(JSON.stringify({
    iss: key.client_email,
    scope: SCOPES,
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  }));

  const encoder = new TextEncoder();
  const signingInput = `${header}.${claim}`;

  // Import private key
  const pemContents = key.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\n/g, '');
  const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8', binaryKey, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']
  );
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', cryptoKey, encoder.encode(signingInput));
  const sig = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  const jwt = `${header}.${claim}.${sig}`;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });
  const tokenData = await tokenRes.json();
  return tokenData.access_token;
}

export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      const token = await getAccessToken(env.GOOGLE_SERVICE_ACCOUNT_KEY);
      const url = new URL(request.url);
      const sheet = url.searchParams.get('sheet') || 'Nombres';
      const action = url.searchParams.get('action') || 'read';

      const SHEET_ID = env.SHEET_ID;
      const baseUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}`;

      if (action === 'read') {
        const range = url.searchParams.get('range') || `${sheet}!A:Z`;
        const res = await fetch(`${baseUrl}/values/${encodeURIComponent(range)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (action === 'append' && request.method === 'POST') {
        const body = await request.json();
        const range = `${sheet}!A:Z`;
        const res = await fetch(
          `${baseUrl}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ values: body.values }),
          }
        );
        const data = await res.json();
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (action === 'update' && request.method === 'PUT') {
        const body = await request.json();
        const range = body.range || `${sheet}!A1`;
        const res = await fetch(
          `${baseUrl}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,
          {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ values: body.values }),
          }
        );
        const data = await res.json();
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ error: 'Invalid action' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};
