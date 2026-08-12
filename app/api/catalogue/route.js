import { getRaquettesAvecArchives } from '../../../lib/shopify'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Catalogue complet incluant les raquettes archivées
    // Utilisé pour l'autocomplete de l'Evolutor
    const raquettes = await getRaquettesAvecArchives()

    const catalogue = raquettes.map(r => ({
      id: r.id,
      title: r.title,
      handle: r.handle,
      image: r.image,
      price: r.price,
      compareAtPrice: r.compareAtPrice,
      genre: r.genre,
      poids: r.poids,
      schema: r.schema,
      stock: r.stock,
      precommande: r.precommande,
    }))

    return Response.json({ raquettes: catalogue })
  } catch (err) {
    console.error('Catalogue API error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
