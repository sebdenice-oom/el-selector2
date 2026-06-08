const DIMS = ['Puissance', 'Confort', 'Spin', 'Contrôle', 'Tolérance', 'Maniabilité']

const W_TECH     = 0.85
const W_BOUTIQUE = 0.15
const PRIX_TOLERANCE = 30
const FACTEUR_DOMINANTE = 3

// Poids Joffrey pour l'évoluteur
const W_TECH_JF     = 0.60
const W_MARGE_JF    = 0.25
const W_STOCK_JF    = 0.10
const W_PRIX_JF     = 0.05

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

function scoreTolerance(valeurRaquette, cible) {
  const ecart = Math.abs(valeurRaquette - cible)
  if (ecart <= 3)  return 100
  if (ecart <= 6)  return 100 - (ecart - 3) * 5
  if (ecart <= 10) return 85  - (ecart - 6) * 6.25
  if (ecart <= 20) return 60  - (ecart - 10) * 4
  return Math.max(0, 20 - (ecart - 20) * 1)
}

function findDominante(cibles) {
  let maxVal = -1, dominante = null
  DIMS.forEach(d => { const v = cibles[d] ?? 0; if (v > maxVal) { maxVal = v; dominante = d } })
  return dominante
}

function scoreTechPondere(raquette, cibles, ciblesInitiales, dominante) {
  const schema = raquette.schema || {}
  if (Object.keys(schema).length === 0) return null

  let totalScore = 0, totalPoids = 0

  DIMS.forEach(d => {
    const cible = cibles[d]
    const valeurInitiale = ciblesInitiales?.[d] ?? cible
    const valeurRaquette = schema[d]
    if (cible === undefined || cible === null || valeurRaquette === undefined) return

    const score = scoreTolerance(valeurRaquette, cible)
    const amplitude = Math.abs(cible - valeurInitiale)
    let poids = amplitude === 0 ? 1 : 1 + amplitude / 10
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
  const prixList = pool.map(r => r._scorePrix)

  // Scoring principal — marge réduite (5% seulement)
  const scored = pool.map(r => {
    const scoreTechNorm   = normalise(r._scoreTech, minT, maxT)
    const scoreMarge      = normalise(r.marge || 0, minM, maxM)
    const scoreStock      = normalise(r.stock || 0, minS, maxS)
    const scoreBoutique   = scoreMarge * 0.40 + scoreStock * 0.60  // marge réduite dans boutique
    const scoreTechAvecPrix = scoreTechNorm * 0.80 + r._scorePrix * 0.20
    const scoreFinal = Math.round(scoreTechAvecPrix * W_TECH + scoreBoutique * W_BOUTIQUE)
    return { ...r, scoreTech: Math.round(r._scoreTech), scoreFinal, _scoreMarge: scoreMarge }
  }).sort((a, b) => b.scoreFinal - a.scoreFinal)

  // Scoring Joffrey — marge forte + prix proche
  const scoredJoffrey = pool.map(r => {
    const scoreTechNorm = normalise(r._scoreTech, minT, maxT)
    const scoreMarge    = normalise(r.marge || 0, minM, maxM)
    const scoreStock    = normalise(r.stock || 0, minS, maxS)
    const scoreJF = scoreTechNorm * W_TECH_JF + scoreMarge * W_MARGE_JF + scoreStock * W_STOCK_JF + r._scorePrix * W_PRIX_JF
    return { ...r, _scoreJF: scoreJF }
  }).sort((a, b) => b._scoreJF - a._scoreJF)

  const joffreyId = scoredJoffrey[0]?.id

  const top = scored.filter(r => r.id !== joffreyId).slice(0, topN)
  const joffreyRaquette = { ...scored.find(r => r.id === joffreyId), isJoffrey: true }

  if (joffreyRaquette.id) {
    top.splice(1, 0, joffreyRaquette)
  }

  return top.slice(0, topN)
}
