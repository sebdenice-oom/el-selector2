import { getAccessToken } from '../../../lib/shopify'

export async function POST(request) {
  try {
    const { handle, variantId } = await request.json()
    const domain = process.env.SHOPIFY_STORE_DOMAIN
    const version = process.env.SHOPIFY_API_VERSION || '2026-04'

    // Si on a déjà le variantId, on l'utilise directement
    // Sinon on le récupère via le handle
    let finalVariantId = variantId

    if (!finalVariantId && handle) {
      const token = await getAccessToken()
      const res = await fetch(`https://${domain}/admin/api/${version}/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': token,
        },
        body: JSON.stringify({
          query: `query getVariant($handle: String!) {
            productByHandle(handle: $handle) {
              variants(first: 1) {
                edges { node { id } }
              }
            }
          }`,
          variables: { handle }
        }),
      })
      const data = await res.json()
      finalVariantId = data?.data?.productByHandle?.variants?.edges?.[0]?.node?.id
    }

    if (!finalVariantId) {
      // Fallback : redirection vers la page produit
      return Response.json({
        url: `https://${domain}/products/${handle}`
      })
    }

    // Extraire le numéro de variante depuis le GID
    // "gid://shopify/ProductVariant/12345678" → "12345678"
    const variantNumericId = finalVariantId.split('/').pop()

    // URL de checkout direct Shopify
    const checkoutUrl = `https://${domain}/cart/${variantNumericId}:1`

    return Response.json({ url: checkoutUrl })

  } catch (err) {
    console.error('Cart API error:', err)
    const domain = process.env.SHOPIFY_STORE_DOMAIN
    return Response.json({ url: `https://${domain}/cart` })
  }
}
