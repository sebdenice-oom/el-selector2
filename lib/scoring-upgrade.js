const DIMS = ['Puissance', 'Confort', 'Spin', 'Contrôle', 'Tolérance', 'Maniabilité']

const W_TECH = 0.85
const W_BOUTIQUE = 0.15
const PRIX_TOLERANCE = 30
const FACTEUR_DOMINANTE = 3

function normalise(val, min, max) {
  if (max === min) return 50
  return Math.max(0, Math.min(100, ((val - min) / (max - min)) * 100))
}

function scorePrix(prixPropose, prixReference) {
  if (!prixReference || prixReference <= 0) return 100
  const ecart = Math.abs(prixPropose - prixReference)
  if (ecart <= PRIX_TOLERANCE) return 100
  return Math.max(0, 100 - (ecart - PRIX_TOLERANCE) * 1.5)
}

// Tolérance symétrique : pénalité progressive selon l'écart absolu à la cible
// ±3 → pas de pénalité
// ±6 → légère (~85%)
// ±10 → modérée (~60%)
// ±20 → forte (~20%)
// au-delà → très forte
function scoreTolerance(valeurRaquette, cible) {
  const ecart = Math.abs(valeurRaquette - cible)
  if (ecart <= 3)  return 100
  if (ecart <= 6)  return 100 - (ecart - 3) * 5        // 85 à 100
  if (ecart <= 10) return 85  - (ecart - 6) * 6.25     // 60 à 85
  if (ecart <= 20) return 60  - (ecart - 10) * 4       // 20 à 60
  return Math.max(0, 20 - (ecart - 20) * 1)            // < 20
}

function findDominante(cibles) {
  let maxVal = -1
  let dominante = null
  DIMS.forEach(d => {
    const v = cibles[d] ?? 0
    if (v > maxVal) { maxVal = v; dominante = d }
  })
  return dominante
}

function scoreTechPondere(raquette, cibles, ciblesInitiales, dominante) {
  const schema = raquette.schema || {}
  if (Object.keys(schema).length === 0) return null

  let totalScore = 0
  let totalPoids = 0

  DIMS.forEach(d => {
    const cible = cibles[d]
    const valeurInitiale = ciblesInitiales?.[d] ?? cible
    const valeurRaquette = schema[d]
    if (cible === undefined || cible === null || valeurRaquette === undefined) return

    // Score : tolérance symétrique par rapport à la cible slider
    const score = scoreTolerance(valeurRaquette, cible)

    // Poids 1 : amplitude du changement demandé via slider
    const amplitude = Math.abs(cible - valeurInitiale)
    let poids = amplitude === 0 ? 1 : 1 + amplitude / 10

    // Poids 2 : surpondération de la caractéristique dominante
    if (d === dominante) poids *= FACTEUR_DOMINANTE

    totalScore += score * poids
    totalPoids += poids
  })

  if (totalPoids === 0) return null
  return totalScore / totalPoids
}

export function scoreRaquettesUpgrade(raquettes, cibles, ciblesInitiales, prixReference, raquetteExclueId = null, topN = 12) {
  const dominante = findDominante(cibles)

  const pool = raquettes
    .filter(r => r.id !== raquetteExclueId)
    .filter(r => r.stock > 0 || r.precommande)
    .map(r => {
      const tech = scoreTechPondere(r, cibles, ciblesInitiales, dominante)
      if (tech === null) return null
      const prixNonReduit = r.compareAtPrice && r.compareAtPrice > r.price ? r.compareAtPrice : r.price
      const scorePx = scorePrix(prixNonReduit, prixReference)
      return { ...r, _scoreTech: tech, _scorePrix: scorePx }
    })
    .filter(Boolean)

  if (pool.length === 0) return []

  const techs = pool.map(r => r._scoreTech)
  const [minT, maxT] = [Math.min(...techs), Math.max(...techs)]
  const marges = pool.map(r => r.marge || 0)
  const stocks = pool.map(r => r.stock || 0)
  const [minM, maxM] = [Math.min(...marges), Math.max(...marges)]
  const [minS, maxS] = [Math.min(...stocks), Math.max(...stocks)]

  const scored = pool.map(r => {
    const scoreTechNorm   = normalise(r._scoreTech, minT, maxT)
    const scoreMarge      = normalise(r.marge || 0, minM, maxM)
    const scoreStock      = normalise(r.stock || 0, minS, maxS)
    const scoreBoutique   = scoreMarge * 0.5 + scoreStock * 0.5
    const scoreTechAvecPrix = scoreTechNorm * 0.80 + r._scorePrix * 0.20
    const scoreFinal = Math.round(scoreTechAvecPrix * W_TECH + scoreBoutique * W_BOUTIQUE)
    return { ...r, scoreTech: Math.round(r._scoreTech), scoreFinal, dominante }
  })

  return scored.sort((a, b) => b.scoreFinal - a.scoreFinal).slice(0, topN)
}
