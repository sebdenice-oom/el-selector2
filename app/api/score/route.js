import { getRaquettes, updateCustomerProfile } from '../../../lib/shopify'
import { scoreRaquettes } from '../../../lib/scoring'
import { identifyProfile, trackQuizComplete } from '../../../lib/klaviyo'

export async function POST(request) {
  try {
    const body = await request.json()
    const { quiz, email, customerId } = body
    const { genre, niveau, budget, sensation } = quiz

    if (!genre || !niveau || !budget || !sensation || sensation.length === 0) {
      return Response.json({ error: 'Champs quiz manquants' }, { status: 400 })
    }

    const raquettes = await getRaquettes()
    const top = scoreRaquettes(raquettes, quiz, 10)

    if (top.length === 0) {
      return Response.json({
        resultats: [],
        message: 'Aucune raquette ne correspond à votre profil. Essayez d\'élargir votre budget.'
      })
    }

    const profilData = {
      genre, niveau, budget, sensation,
      date_quiz: new Date().toISOString(),
      top_raquettes: top.slice(0, 3).map(r => ({ id: r.id, titre: r.title })),
    }

    const injections = []
    if (email) {
      injections.push(identifyProfile(email, quiz, top))
      injections.push(trackQuizComplete(email, quiz, top))
    }
    if (customerId) {
      injections.push(updateCustomerProfile(customerId, profilData))
    }
    Promise.allSettled(injections).catch(console.error)

    const resultatsPublics = top.map(r => ({
      id: r.id,
      title: r.title,
      handle: r.handle,
      url: r.url,
      image: r.image,
      imageAlt: r.imageAlt,
      price: r.price,
      stock: r.stock,
      precommande: r.precommande || false,
      genre: r.genre,
      poids: r.poids,
      schema: r.schema,
      scoreFinal: r.scoreFinal,
      scoreTech: Math.round(r.scoreTech),
      compareAtPrice: r.compareAtPrice || null,
      isEPS: r.isEPS || false,
      variantId: r.variantId || null,
    }))

    return Response.json({ resultats: resultatsPublics })

  } catch (err) {
    console.error('Score API error:', err)
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
