export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  if (!code) return new Response('Code manquant', { status: 400 })

  const res = await fetch(
    `https://esprit-padel-shop.myshopify.com/admin/oauth/access_token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.SHOPIFY_CLIENT_ID,
        client_secret: process.env.SHOPIFY_CLIENT_SECRET,
        code,
      }),
    }
  )

  const text = await res.text()

  return new Response(`
    <p>Status: ${res.status}</p>
    <p>Réponse Shopify :</p>
    <pre>${text}</pre>
  `, { headers: { 'Content-Type': 'text/html' } })
}
