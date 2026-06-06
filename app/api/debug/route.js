export async function GET() {
  const domain = process.env.SHOPIFY_STORE_DOMAIN || 'NON DÉFINI'
  const version = process.env.SHOPIFY_API_VERSION || 'NON DÉFINI'
  const clientId = process.env.SHOPIFY_CLIENT_ID ? 'PRÉSENT (' + process.env.SHOPIFY_CLIENT_ID.substring(0, 8) + '...)' : 'ABSENT'
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET ? 'PRÉSENT' : 'ABSENT'

  let tokenTest = null
  let shopifyTest = null

  try {
    // Étape 1 — obtenir un token via client credentials
    const tokenRes = await fetch(`https://${domain}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.SHOPIFY_CLIENT_ID,
        client_secret: process.env.SHOPIFY_CLIENT_SECRET,
        grant_type: 'client_credentials',
      }),
    })
    tokenTest = { status: tokenRes.status, ok: tokenRes.ok }

    if (tokenRes.ok) {
      const tokenData = await tokenRes.json()
      const accessToken = tokenData.access_token
      tokenTest.token_prefix = accessToken ? accessToken.substring(0, 10) + '...' : 'VIDE'

      // Étape 2 — tester l'API GraphQL avec ce token
      const apiRes = await fetch(`https://${domain}/admin/api/${version}/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': accessToken,
        },
        body: JSON.stringify({ query: '{ shop { name } }' }),
      })
      shopifyTest = { status: apiRes.status, ok: apiRes.ok }
      if (apiRes.ok) {
        const json = await apiRes.json()
        shopifyTest.data = json.data
      }
    }
  } catch (e) {
    tokenTest = { error: e.message }
  }

  return Response.json({ domain, version, clientId, clientSecret, tokenTest, shopifyTest })
}
