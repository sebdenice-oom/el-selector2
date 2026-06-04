export async function GET() {
  const domain = process.env.SHOPIFY_STORE_DOMAIN || 'NON DÉFINI'
  const version = process.env.SHOPIFY_API_VERSION || 'NON DÉFINI'
  const token = process.env.SHOPIFY_ADMIN_API_TOKEN ? 'PRÉSENT (' + process.env.SHOPIFY_ADMIN_API_TOKEN.substring(0, 8) + '...)' : 'ABSENT'
  const url = 'https://' + domain + '/admin/api/' + version + '/graphql.json'

  let shopifyTest = null
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_API_TOKEN },
      body: JSON.stringify({ query: '{ shop { name } }' }),
    })
    shopifyTest = { status: res.status, ok: res.ok }
    if (res.ok) {
      const json = await res.json()
      shopifyTest.data = json.data
    }
  } catch (e) {
    shopifyTest = { error: e.message }
  }

  return Response.json({ domain, version, token, url, shopifyTest })
}
