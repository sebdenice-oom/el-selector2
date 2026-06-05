const DIMS = ['Puissance', 'Confort', 'Spin', 'Contrôle', 'Tolérance', 'Maniabilité']

// Couche 1 : score technique basé sur le delta entre cibles et profil raquette
function scoreTech(raquette, cibles) {
  const schema = raquette.schema || {}
  if (Object.keys(schema).length === 0) return null
  if (raquette.stock <= 0) return null

  let total = 0
  let poids = 0

  DIMS.forEach(d => {
    const cible = cibles[d]
    const valeur = schema[d] ?? 0
    if (cible === undefined || cible === null) return

    const delta = valeur - cible
    let score
    if (delta >= 0) {
      score = Math.min(100, 100 + delta * 0.3)
    } else {
      score = Math.max(0, 100 + delta * 2)
    }
    total += score
    poids += 1
  })

  if (poids === 0) return null
  return total / poids
}

function normalise(valeur, min, max) {
  if (max === min) return 50
  return Math.max(0, Math.min(100, ((valeur - min) / (max - min)) * 100))
}

// Couche 2 : intérêt Esprit Padel Shop (marge, stock, rotation)
// Ratio : 60% tech / 40% intérêt boutique
const W_TECH     = 0.60
const W_MARGE    = 0.15
const W_STOCK    = 0.15
const W_ROTATION = 0.10

export function scoreRaquettesUpgrade(raquettes, cibles, raquetteExclueId = null, topN = 12) {
  // Couche 1 — filtrage et scoring technique
  const pool = raquettes
    .filter(r => r.id !== raquetteExclueId)
    .map(r => {
      const tech = scoreTech(r, cibles)
      if (tech === null) return null
      if (tech < 40) return null // seuil minimum
      return { ...r, _scoreTech: tech }
    })
    .filter(Boolean)

  if (pool.length === 0) return []

  // Couche 2 — normalisation et score final
  const marges    = pool.map(r => r.marge)
  const stocks    = pool.map(r => r.stock)
  const rotations = pool.map(r => r.rotation)

  const [minM, maxM] = [Math.min(...marges),    Math.max(...marges)]
  const [minS, maxS] = [Math.min(...stocks),    Math.max(...stocks)]
  const [minR, maxR] = [Math.min(...rotations), Math.max(...rotations)]

  const scored = pool.map(r => {
    const scoreMarge    = normalise(r.marge,    minM, maxM)
    const scoreStock    = normalise(r.stock,    minS, maxS)
    const scoreRotation = normalise(r.rotation, minR, maxR)

    const scoreFinal = Math.round(
      r._scoreTech  * W_TECH +
      scoreMarge    * W_MARGE +
      scoreStock    * W_STOCK +
      scoreRotation * W_ROTATION
    )

    return { ...r, scoreTech: Math.round(r._scoreTech), scoreFinal }
  })

  return scored
    .sort((a, b) => b.scoreFinal - a.scoreFinal)
    .slice(0, topN)
}
