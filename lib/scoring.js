const SEUILS_BASE = {
  debutant:      { Puissance: 45, Confort: 50, Spin: 45, Contrôle: 50, Tolérance: 50, Maniabilité: 50 },
  intermediaire: { Puissance: 55, Confort: 55, Spin: 55, Contrôle: 58, Tolérance: 55, Maniabilité: 58 },
  avance:        { Puissance: 62, Confort: 52, Spin: 62, Contrôle: 65, Tolérance: 52, Maniabilité: 62 },
  competition:   { Puissance: 70, Confort: 48, Spin: 68, Contrôle: 70, Tolérance: 48, Maniabilité: 68 },
}

const BOOSTS_SENSATION = {
  puissance:   { Puissance: +10, Confort:  -5, Spin:  +3, Contrôle:   0, Tolérance:  -5, Maniabilité:  -5 },
  maniabilite: { Puissance:  -5, Confort:  +3, Spin:   0, Contrôle:  +5, Tolérance:  +3, Maniabilité:  +8 },
  controle:    { Puissance:  -5, Confort:   0, Spin:   0, Contrôle: +10, Tolérance:  +5, Maniabilité:  +3 },
  confort:     { Puissance:  -5, Confort: +10, Spin:  -5, Contrôle:  +3, Tolérance:  +8, Maniabilité:  +3 },
  spin:        { Puissance:  +5, Confort:  -5, Spin: +10, Contrôle:   0, Tolérance:  -5, Maniabilité:   0 },
  tolerance:   { Puissance:  -5, Confort:  +5, Spin:  -5, Contrôle:  +5, Tolérance: +10, Maniabilité:  +3 },
}

const POIDS_SCORING = {
  puissance:   { Puissance: 10, Confort: 1, Spin: 3, Contrôle: 2, Tolérance: 1, Maniabilité: 1 },
  maniabilite: { Puissance: 1, Confort: 3, Spin: 2, Contrôle: 5, Tolérance: 3, Maniabilité: 10 },
  controle:    { Puissance: 1, Confort: 2, Spin: 2, Contrôle: 10, Tolérance: 5, Maniabilité: 4 },
  confort:     { Puissance: 1, Confort: 10, Spin: 1, Contrôle: 3, Tolérance: 7, Maniabilité: 3 },
  spin:        { Puissance: 4, Confort: 1, Spin: 10, Contrôle: 2, Tolérance: 1, Maniabilité: 2 },
  tolerance:   { Puissance: 1, Confort: 5, Spin: 1, Contrôle: 5, Tolérance: 10, Maniabilité: 4 },
}

const DIMS = ['Puissance', 'Confort', 'Spin', 'Contrôle', 'Tolérance', 'Maniabilité']
const SENSATION_WEIGHTS = [1.0, 0.5, 0.25]

const W_TECH     = 0.50
const W_MARGE    = 0.10
const W_STOCK    = 0.15
const W_ROTATION = 0.05
const W_PRIX     = 0.20

const BUDGET_ILLIMITE = 99999

function coeffGenre(genreJoueur, genreRaquette) {
  if (!genreRaquette || genreRaquette === 'Unisexe') return 1.0
  if (genreRaquette === genreJoueur) return 1.0
  return 0.80
}

function getSeuilsEffectifs(niveau, sensations) {
  const base = SEUILS_BASE[niveau] || SEUILS_BASE.intermediaire
  const result = {}
  DIMS.forEach(d => {
    let totalBoost = 0
    sensations.forEach((s, i) => {
      const boost = BOOSTS_SENSATION[s] || {}
      totalBoost += (boost[d] || 0) * SENSATION_WEIGHTS[i]
    })
    result[d] = Math.max(0, Math.min(95, base[d] + totalBoost))
  })
  return result
}

function getScoringPoids(sensations) {
  const combined = {}
  DIMS.forEach(d => { combined[d] = 0 })
  sensations.forEach((s, i) => {
    const poids = POIDS_SCORING[s] || POIDS_SCORING.controle
    DIMS.forEach(d => { combined[d] += poids[d] * SENSATION_WEIGHTS[i] })
  })
  return combined
}

function normalise(valeur, min, max) {
  if (max === min) return 50
  return Math.max(0, Math.min(100, ((valeur - min) / (max - min)) * 100))
}

function couche1(raquette, quiz) {
  const { genre, niveau, budget, budgetIllimite, sensations } = quiz
  const schema = raquette.schema || {}

  if (Object.keys(schema).length === 0) return { ok: false }
  if (raquette.stock <= 0) return { ok: false }
  if (!budgetIllimite && raquette.price > budget) return { ok: false }

  const seuils = getSeuilsEffectifs(niveau, sensations)
  const echecs = DIMS.filter(d => (schema[d] || 0) < seuils[d])
  if (echecs.length > 0) return { ok: false }

  const poids = getScoringPoids(sensations)
  let num = 0, den = 0
  DIMS.forEach(d => {
    num += poids[d] * (schema[d] || 0)
    den += poids[d] * 100
  })
  const scoreTech = den > 0 ? (num / den) * 100 : 0
  const coeff = coeffGenre(genre, raquette.genre)

  return { ok: true, scoreTech, coeffGenre: coeff }
}

function couche2(pool, budget, budgetIllimite) {
  if (pool.length === 0) return []

  const marges    = pool.map(r => r.marge    || 0)
  const stocks    = pool.map(r => r.stock    || 0)
  const rotations = pool.map(r => r.rotation || 0)
  const prix      = pool.map(r => r.price    || 0)

  const [minM, maxM] = [Math.min(...marges),    Math.max(...marges)]
  const [minS, maxS] = [Math.min(...stocks),    Math.max(...stocks)]
  const [minR, maxR] = [Math.min(...rotations), Math.max(...rotations)]
  const [minP, maxP] = [Math.min(...prix),      Math.max(...prix)]

  return pool.map(r => {
    const scoreMarge    = normalise(r.marge    || 0, minM, maxM)
    const scoreStock    = normalise(r.stock    || 0, minS, maxS)
    const scoreRotation = normalise(r.rotation || 0, minR, maxR)

    let scorePrix
    if (budgetIllimite) {
      // Budget illimité : les raquettes les plus chères sont favorisées (premium)
      scorePrix = normalise(r.price || 0, minP, maxP)
    } else {
      // Budget défini : favorise les raquettes proches du budget max
      scorePrix = Math.min(100, ((r.price || 0) / budget) * 100)
    }

    const scoreBrut =
      r.scoreTech    * W_TECH     +
      scoreMarge     * W_MARGE    +
      scorePrix      * W_PRIX     +
      scoreStock     * W_STOCK    +
      scoreRotation  * W_ROTATION

    const scoreFinal = Math.round(scoreBrut * r.coeffGenre)

    return { ...r, scoreFinal }
  })
}

export function scoreRaquettes(raquettes, quiz, topN = 12) {
  const sensations = Array.isArray(quiz.sensation) ? quiz.sensation : [quiz.sensation].filter(Boolean)
  const budgetIllimite = quiz.budgetIllimite || quiz.budget >= BUDGET_ILLIMITE
  const quizNorm = { ...quiz, sensations, budgetIllimite }

  const pool = []
  raquettes.forEach(r => {
    const res = couche1(r, quizNorm)
    if (res.ok) pool.push({ ...r, scoreTech: res.scoreTech, coeffGenre: res.coeffGenre })
  })

  return couche2(pool, quiz.budget, budgetIllimite)
    .sort((a, b) => b.scoreFinal - a.scoreFinal)
    .slice(0, topN)
}
