// app/api/cron-rotation/route.js
// Job nightly — calcule les ventes 90j et met à jour le métachamp rotation
// À appeler via un cron Vercel ou un service externe toutes les nuits

export async function GET(request) {
  // Sécurité : vérification d'un token secret pour empêcher les appels non autorisés
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const { getVentesParProduit, getRaquettes, updateRotation } = require('../../../lib/shopify')

    // Récupère les ventes des 90 derniers jours via ShopifyQL
    const ventesMap = await getVentesParProduit()

    // Récupère toutes les raquettes pour avoir leurs IDs Shopify
    const raquettes = await getRaquettes()

    let updated = 0
    const errors = []

    for (const raquette of raquettes) {
      // L'ID Shopify est de la forme "gid://shopify/Product/12345"
      const numericId = raquette.id.split('/').pop()
      const ventes = ventesMap[numericId] || 0

      try {
        await updateRotation(raquette.id, ventes)
        updated++
      } catch (e) {
        errors.push({ id: raquette.id, error: e.message })
      }
    }

    return Response.json({
      success: true,
      updated,
      errors: errors.length,
      timestamp: new Date().toISOString(),
    })

  } catch (err) {
    console.error('Cron rotation error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
