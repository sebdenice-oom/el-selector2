import { getRaquettes } from '../../../lib/shopify'

export async function GET() {
  try {
    const raquettes = await getRaquettes()
    const catalogue = raquettes.map(r => ({
      id: r.id,
      title: r.title,
      handle: r.handle,
      image: r.image,
      price: r.price,
      genre: r.genre,
      schema: r.schema,
    }))
    return Response.json({ raquettes: catalogue }, {
      headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=600' }
    })
  } catch (err) {
    console.error('Catalogue API error:', err)
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
