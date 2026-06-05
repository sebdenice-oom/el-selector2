import { getRaquettes } from '../../../lib/shopify'
import { scoreRaquettesUpgrade } from '../../../lib/scoring-upgrade'

export async function POST(request) {
  try {
    const body = await request.json()
    const { raquetteActuelle, cibles, email } = body

    if (!cibles || Object.keys(cibles).length === 0) {
      return Response.json({ error: 'Cibles manquantes' }, { status: 400 })
    }

    const raquettes = await getRaquettes()

    // Exclure la raquette actuelle des résultats
    const raquettesFiltrees = raquetteActuelle
      ? raquettes.filter(r => r.id !== raquetteActuelle.id)
      : raquettes

    const top = scoreRaquettesUpgrade(raquettesFiltrees, cibles, 12)

    if (top.length === 0) {
      return Response.json({ resultats: [], message: "Aucune raquette ne correspond à tes critères d'évolution." })
    }

    // Klaviyo en arrière-plan si email fourni
    if (email) {
      try {
        const { identifyProfileUpgrade } = await import('../../../lib/klaviyo')
        identifyProfileUpgrade(email, raquetteActuelle, cibles, top).catch(console.error)
      } catch (e) {}
    }

    const resultats = top.map(r => ({
      id: r.id,
      title: r.title,
      handle: r.handle,
      url: r.url,
      image: r.image,
      imageAlt: r.imageAlt,
      price: r.price,
      compareAtPrice: r.compareAtPrice || null,
      stock: r.stock,
      precommande: r.precommande || false,
      genre: r.genre,
      poids: r.poids,
      schema: r.schema,
      scoreFinal: r.scoreFinal,
    }))

    return Response.json({ resultats })

  } catch (err) {
    console.error('Upgrade Score API error:', err)
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
