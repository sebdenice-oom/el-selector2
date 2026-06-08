import { getRaquettes } from '../../../lib/shopify'
import { scoreRaquettesUpgrade } from '../../../lib/scoring-upgrade'

export async function POST(request) {
  try {
    const body = await request.json()
    const { raquetteActuelle, cibles, ciblesInitiales, email } = body

    if (!cibles || Object.keys(cibles).length === 0) {
      return Response.json({ error: 'Cibles manquantes' }, { status: 400 })
    }

    const raquettes = await getRaquettes()

    // Prix de référence = prix non réduit de la raquette actuelle
    const prixReference = raquetteActuelle?.compareAtPrice && raquetteActuelle.compareAtPrice > raquetteActuelle.price
      ? raquetteActuelle.compareAtPrice
      : raquetteActuelle?.price || null

    const top = scoreRaquettesUpgrade(
      raquettes,
      cibles,
      ciblesInitiales || cibles,
      prixReference,
      raquetteActuelle?.id,
      12
    )

    if (top.length === 0) {
      return Response.json({ resultats: [], message: "Aucune raquette ne correspond." })
    }

    if (email) {
      try {
        const { identifyProfileUpgrade } = await import('../../../lib/klaviyo')
        identifyProfileUpgrade(email, raquetteActuelle, cibles, top).catch(console.error)
      } catch (e) {}
    }

    const resultats = top.map(r => ({
      id: r.id, title: r.title, handle: r.handle, url: r.url,
      image: r.image, imageAlt: r.imageAlt,
      price: r.price, compareAtPrice: r.compareAtPrice || null,
      stock: r.stock, precommande: r.precommande || false,
      genre: r.genre, poids: r.poids, schema: r.schema,
      scoreFinal: r.scoreFinal, scoreTech: r.scoreTech,
      isJoffrey: r.isJoffrey || false,
    }))

    return Response.json({ resultats })
  } catch (err) {
    console.error('Upgrade Score API error:', err)
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
