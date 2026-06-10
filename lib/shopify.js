const MUTATION_UPDATE_METAFIELD = 'mutation M($metafields: [MetafieldsSetInput!]!) { metafieldsSet(metafields: $metafields) { metafields { key value } userErrors { field message } } }'

async function shopifyQuery(query, variables) {
  const domain = process.env.SHOPIFY_STORE_DOMAIN
  const token = process.env.SHOPIFY_ADMIN_API_TOKEN
  const version = process.env.SHOPIFY_API_VERSION || '2026-04'
  const endpoint = 'https://' + domain + '/admin/api/' + version + '/graphql.json'
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({ query, variables: variables || {} }),
  })
  if (!res.ok) throw new Error('Shopify API error: ' + res.status)
  const json = await res.json()
  if (json.errors) throw new Error(JSON.stringify(json.errors))
  return json.data
}

export async function getRaquettes() {
  const domain = process.env.SHOPIFY_STORE_DOMAIN
  const query = 'query getRaquettes($cursor: String) { products(first: 250, after: $cursor, query: "product_type:Raquettes status:active") { pageInfo { hasNextPage endCursor } edges { node { id title handle images(first: 1) { edges { node { url altText } } } variants(first: 1) { edges { node { id price availableForSale inventoryQuantity inventoryPolicy inventoryItem { unitCost { amount } } } } } metafields(namespace: "custom", first: 20) { edges { node { key value } } } } } } }'
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
  const query = 'query { shopifyqlQuery(query: "FROM sales SELECT product_id, SUM(net_quantity) AS units_sold WHERE product_type = \'Raquettes\' SINCE -90d UNTIL today GROUP BY product_id") { ... on TableResponse { tableData { rowData columns { name dataType } } } } }'
  const data = await shopifyQuery(query)
  const rows = data && data.shopifyqlQuery && data.shopifyqlQuery.tableData ? data.shopifyqlQuery.tableData.rowData : []
  const map = {}
  rows.forEach(function(row) { map[row[0]] = parseInt(row[1]) || 0 })
  return map
}

function normalizeProduct(product, domain) {
  const variant = product.variants.edges[0] ? product.variants.edges[0].node : {}
  const image = product.images.edges[0] ? product.images.edges[0].node : {}
  const metaMap = {}
  product.metafields.edges.forEach(function(edge) {
    if (edge.node) metaMap[edge.node.key] = edge.node.value
  })
  let schema = {}
  try { schema = JSON.parse(metaMap.schema || '{}') } catch (e) {}
  const price = parseFloat(variant.price || 0)
  const cost = parseFloat(variant.inventoryItem && variant.inventoryItem.unitCost ? variant.inventoryItem.unitCost.amount : 0)
  const marge = cost > 0 ? ((price - cost) / price) * 100 : 0
  const inventoryQty = variant.inventoryQuantity || 0
  const precommande = variant.inventoryPolicy === 'CONTINUE' && inventoryQty <= 0
  return {
    id: product.id,
    title: product.title,
    handle: product.handle,
    url: 'https://' + domain + '/products/' + product.handle,
    image: image.url || '',
    imageAlt: image.altText || product.title,
    price, cost, marge,
    stock: variant.availableForSale ? (inventoryQty || 1) : 0,
    precommande,
    rotation: parseInt(metaMap.rotation || '0'),
    genre: metaMap.genre || 'Unisexe',
    poids: metaMap.poids || '',
    schema,
  }
}
