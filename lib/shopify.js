let cachedToken = null
let tokenExpiry = 0

export async function getAccessToken() {
  const now = Date.now()
  if (cachedToken && now < tokenExpiry - 60000) return cachedToken

  const domain = process.env.SHOPIFY_STORE_DOMAIN
  const clientId = process.env.SHOPIFY_CLIENT_ID
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET

  const res = await fetch(`https://${domain}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials',
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Token error ${res.status}: ${text}`)
  }

  const data = await res.json()
  cachedToken = data.access_token
  tokenExpiry = now + (data.expires_in || 3600) * 1000
  return cachedToken
}

const MUTATION_UPDATE_METAFIELD = `mutation M($metafields: [MetafieldsSetInput!]!) { metafieldsSet(metafields: $metafields) { metafields { key value } userErrors { field message } } }`

async function shopifyQuery(query, variables) {
  const domain = process.env.SHOPIFY_STORE_DOMAIN
  const version = process.env.SHOPIFY_API_VERSION || '2026-04'
  const token = await getAccessToken()
  const endpoint = `https://${domain}/admin/api/${version}/graphql.json`

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token,
    },
    body: JSON.stringify({ query, variables: variables || {} }),
  })

  if (!res.ok) throw new Error('Shopify API error: ' + res.status)
  const json = await res.json()
  if (json.errors) throw new Error(JSON.stringify(json.errors))
  return json.data
}

// ─── Lecture du catalogue local (ultra-rapide) ───────────────────────────────
// Le fichier public/catalogue.json est mis à jour par le cron à 3h UTC
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

export async function getRaquettes() {
  try {
    const filePath = join(process.cwd(), 'public', 'catalogue.json')
    if (existsSync(filePath)) {
      const data = readFileSync(filePath, 'utf8')
      return JSON.parse(data)
    }
  } catch (e) {
    console.warn('catalogue.json non disponible, fallback API Shopify:', e.message)
  }
  // Fallback : appel API Shopify si le fichier n'existe pas encore
  return getRaquettesFromShopify()
}

// ─── Appel direct API Shopify (utilisé par le cron) ──────────────────────────
export async function getRaquettesFromShopify() {
  const domain = process.env.SHOPIFY_STORE_DOMAIN
  const query = `query getRaquettes($cursor: String) {
    products(first: 250, after: $cursor, query: "product_type:Raquettes status:active") {
      pageInfo { hasNextPage endCursor }
      edges {
        node {
          id title handle
          images(first: 1) { edges { node { url altText } } }
          variants(first: 1) {
            edges {
              node {
                id price compareAtPrice availableForSale
                inventoryQuantity inventoryPolicy
                inventoryItem { unitCost { amount } }
              }
            }
          }
          metafields(namespace: "custom", first: 20) {
            edges { node { key value } }
          }
        }
      }
    }
  }`

  let allRaquettes = []
  let cursor = null
  let hasNextPage = true
  while (hasNextPage) {
    const data = await shopifyQuery(query, { cursor })
    const { edges, pageInfo } = data.products
    allRaquettes = allRaquettes.concat(edges.map(e => e.node))
    hasNextPage = pageInfo.hasNextPage
    cursor = pageInfo.endCursor
  }
  return allRaquettes.map(p => normalizeProduct(p, domain))
}

export async function updateRotation(productId, unitsVendues) {
  await shopifyQuery(MUTATION_UPDATE_METAFIELD, {
    metafields: [{ ownerId: productId, namespace: 'custom', key: 'rotation', value: String(unitsVendues), type: 'number_integer' }]
  })
}

export async function updateCustomerProfile(customerId, profil) {
  await shopifyQuery(MUTATION_UPDATE_METAFIELD, {
    metafields: [{ ownerId: customerId, namespace: 'custom', key: 'profil_selector', value: JSON.stringify(profil), type: 'json' }]
  })
}

export async function getVentesParProduit() {
  const query = `query {
    shopifyqlQuery(query: "FROM sales SELECT product_id, SUM(net_quantity) AS units_sold WHERE product_type = 'Raquettes' SINCE -90d UNTIL today GROUP BY product_id") {
      ... on TableResponse {
        tableData { rowData columns { name dataType } }
      }
    }
  }`
  const data = await shopifyQuery(query)
  const rows = data?.shopifyqlQuery?.tableData?.rowData || []
  const map = {}
  rows.forEach(row => { map[row[0]] = parseInt(row[1]) || 0 })
  return map
}

function normalizeProduct(product, domain) {
  const variant = product.variants.edges[0]?.node || {}
  const image = product.images.edges[0]?.node || {}
  const metaMap = {}
  product.metafields.edges.forEach(edge => {
    if (edge.node) metaMap[edge.node.key] = edge.node.value
  })
  let schema = {}
  try { schema = JSON.parse(metaMap.schema || '{}') } catch (e) {}
  const price = parseFloat(variant.price || 0)
  const compareAtPrice = variant.compareAtPrice ? parseFloat(variant.compareAtPrice) : null
  const cost = parseFloat(variant.inventoryItem?.unitCost?.amount || 0)
  const marge = cost > 0 ? ((price - cost) / price) * 100 : 0
  const inventoryQty = variant.inventoryQuantity || 0
  const precommande = variant.inventoryPolicy === 'CONTINUE' && inventoryQty <= 0
  return {
    id: product.id,
    title: product.title,
    handle: product.handle,
    url: `https://${domain}/products/${product.handle}`,
    image: image.url || '',
    imageAlt: image.altText || product.title,
    price, compareAtPrice, cost, marge,
    stock: variant.availableForSale ? (inventoryQty || 1) : 0,
    precommande,
    rotation: parseInt(metaMap.rotation || '0'),
    genre: metaMap.genre || 'Unisexe',
    poids: metaMap.poids || '',
    schema,
    variantId: variant.id || null,
  }
}
