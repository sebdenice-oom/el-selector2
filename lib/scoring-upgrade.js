const DIMS = ['Puissance', 'Confort', 'Spin', 'Contrôle', 'Tolérance', 'Maniabilité']

const W_TECH = 0.85
const W_BOUTIQUE = 0.15
const PRIX_TOLERANCE = 30

function normalise(val, min, max) {
  if (max === min) return 50
  return Math.max(0, Math.min(100, ((val - min) / (max - min)) * 100))
}

function scorePrix(prixPropose, prixReference) {
  if (!prixReference || prixReference <= 0) return 100
  const ecart = Math.abs(prixPropose - prixReference)
  if (ecart <= PRIX_TOLERANCE) return 100
  const depassement = ecart - PRIX_TOLERANCE
  return Math.max(0, 100 - depassement * 1.5)
}

function scoreTechPondere(raquette, cibles, ciblesInitiales) {
  const schema = raquette.schema || {}
  if (Object.keys(schema).length === 0) return null

  let totalScore = 0
  let totalPoids = 0

  DIMS.forEach(d => {
    const cible = cibles[d]
    const valeurInitiale = ciblesInitiales?.[d] ?? cible
    const valeurRaquette = schema[d]
    if (cible === undefined || cible === null || valeurRaquette === undefined) return

    const amplitude = Math.abs(cible - valeurInitiale)
    const poids = amplitude === 0 ? 1 : 1 + amplitude / 10

    const delta = valeurRaquette - cible
    let score
    if (delta >= 0) {
      score = Math.min(100, 100 + delta * 0.2)
    } else {
      const penalite = amplitude > 0 ? 3 : 1.5
      score = Math.max(0, 100 + delta * penalite)
    }

    totalScore += score * poids
    totalPoids += poids
  })

  if (totalPoids === 0) return null
  return totalScore / totalPoids
}

export function scoreRaquettesUpgrade(raquettes, cibles, ciblesInitiales, prixReference, raquetteExclueId = null, topN = 12) {
  const pool = raquettes
    .filter(r => r.id !== raquetteExclueId)
    .filter(r => r.stock > 0 || r.precommande)
    .map(r => {
      const tech = scoreTechPondere(r, cibles, ciblesInitiales)
      if (tech === null) return null
      // Prix non réduit = compareAtPrice si dispo, sinon price
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
    const scoreTechNorm = normalise(r._scoreTech, minT, maxT)
    const scoreMarge    = normalise(r.marge || 0, minM, maxM)
    const scoreStock    = normalise(r.stock || 0, minS, maxS)
    const scoreBoutique = scoreMarge * 0.5 + scoreStock * 0.5

    // Prix intégré dans la couche tech (pondéré à 20% de la couche tech)
    const scoreTechAvecPrix = scoreTechNorm * 0.80 + r._scorePrix * 0.20

    const scoreFinal = Math.round(scoreTechAvecPrix * W_TECH + scoreBoutique * W_BOUTIQUE)

    return { ...r, scoreTech: Math.round(r._scoreTech), scoreFinal }
  })

  return scored.sort((a, b) => b.scoreFinal - a.scoreFinal).slice(0, topN)
}
