import { getRaquettes } from '../../../lib/shopify'

export const dynamic = 'force-dynamic'

const DIMS = ['Puissance', 'Confort', 'Spin', 'Contrôle', 'Tolérance', 'Maniabilité']

function calculerCorrelations(raquettes) {
  // Filtrer les raquettes avec schéma complet
  const valides = raquettes.filter(r =>
    r.schema && DIMS.every(d => r.schema[d] !== undefined)
  )

  if (valides.length < 10) return null

  const n = valides.length

  // Calculer moyennes
  const moyennes = {}
  DIMS.forEach(d => {
    moyennes[d] = valides.reduce((sum, r) => sum + r.schema[d], 0) / n
  })

  // Calculer écarts-types
  const ecartTypes = {}
  DIMS.forEach(d => {
    const variance = valides.reduce((sum, r) =>
      sum + Math.pow(r.schema[d] - moyennes[d], 2), 0) / n
    ecartTypes[d] = Math.sqrt(variance)
  })

  // Calculer matrice de corrélation de Pearson
  const matrice = {}
  DIMS.forEach(d1 => {
    matrice[d1] = {}
    DIMS.forEach(d2 => {
      if (d1 === d2) { matrice[d1][d2] = 1; return }
      const cov = valides.reduce((sum, r) =>
        sum + (r.schema[d1] - moyennes[d1]) * (r.schema[d2] - moyennes[d2]), 0) / n
      const corr = ecartTypes[d1] > 0 && ecartTypes[d2] > 0
        ? cov / (ecartTypes[d1] * ecartTypes[d2])
        : 0
      // Arrondir à 2 décimales
      matrice[d1][d2] = Math.round(corr * 100) / 100
    })
  })

  return { matrice, n: valides.length, moyennes, ecartTypes }
}

export async function GET() {
  try {
    const raquettes = await getRaquettes()
    const result = calculerCorrelations(raquettes)
    if (!result) return Response.json({ error: 'Pas assez de données' }, { status: 500 })
    return Response.json(result)
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
