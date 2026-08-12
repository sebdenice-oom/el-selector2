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
const BUDGET_ILLIMITE = 99999

// --- Gêne / antécédent physique (donnée éphémère, hors quiz stocké) ---
// Intensité selon la réponse : oriente vers une raquette légère, maniable et confortable.
const GENE_INTENSITE = { aucune: 0, passee: 0.5, importante: 1 }
// Ajustement des seuils (couche 1) — on relâche la Puissance, on remonte un peu Maniabilité/Confort.
const GENE_SEUILS = { Maniabilité: 4, Confort: 3, Puissance: -6 }
// Ajustement des poids de classement (couche 2 tech) — favorise maniabilité/confort/tolérance, pénalise puissance.
const GENE_POIDS  = { Maniabilité: 4, Confort: 3, Tolérance: 2, Puissance: -4 }

// Convertit un champ `poids` en valeur comparable (grammes).
// Format réel du catalogue : fourchette "360-375g" (souvent vide "").
// On prend le MILIEU de la fourchette ; libellés léger/moyen/lourd gérés en secours.
// Renvoie null si inconnu → la raquette n'est jamais exclue sur ce critère.
function poidsComparable(p) {
  if (p == null || p === '') return null
  if (typeof p === 'number') return p
  const s = String(p).toLowerCase()
  const nums = s.match(/\d+([.,]\d+)?/g)
  if (nums && nums.length) {
    const vals = nums.map(n => parseFloat(n.replace(',', '.')))
    return vals.reduce((a, b) => a + b, 0) / vals.length
  }
  if (/lourd|heavy/.test(s)) return 3
  if (/moyen|medium|interm/.test(s)) return 2
  if (/l[ée]ger|light/.test(s)) return 1
  return null
}

// Poids couche 2 — marge réduite dans le scoring principal
const W_TECH     = 0.55
const W_MARGE    = 0.05  // réduit (était 0.10)
const W_STOCK    = 0.15
const W_ROTATION = 0.05
const W_PRIX     = 0.20

// Poids couche 2 — coup de coeur Joffrey (marge forte)
const W_TECH_JF     = 0.45
const W_MARGE_JF    = 0.30  // marge très forte
const W_STOCK_JF    = 0.10
const W_ROTATION_JF = 0.05
const W_PRIX_JF     = 0.10

function coeffGenre(genreJoueur, genreRaquette) {
  if (!genreRaquette || genreRaquette === 'Unisexe') return 1.0
  if (genreRaquette === genreJoueur) return 1.0
  return 0.80
}

function getSeuilsEffectifs(niveau, sensations, kGene = 0) {
  const base = SEUILS_BASE[niveau] || SEUILS_BASE.intermediaire
  const result = {}
  DIMS.forEach(d => {
    let totalBoost = 0
    sensations.forEach((s, i) => {
      const boost = BOOSTS_SENSATION[s] || {}
      totalBoost += (boost[d] || 0) * SENSATION_WEIGHTS[i]
    })
    const gene = (GENE_SEUILS[d] || 0) * kGene
    result[d] = Math.max(0, Math.min(95, base[d] + totalBoost + gene))
  })
  return result
}

function getScoringPoids(sensations, kGene = 0) {
  const combined = {}
  DIMS.forEach(d => { combined[d] = 0 })
  sensations.forEach((s, i) => {
    const poids = POIDS_SCORING[s] || POIDS_SCORING.controle
    DIMS.forEach(d => { combined[d] += poids[d] * SENSATION_WEIGHTS[i] })
  })
  DIMS.forEach(d => { combined[d] = Math.max(0, combined[d] + (GENE_POIDS[d] || 0) * kGene) })
  return combined
}

function normalise(valeur, min, max) {
  if (max === min) return 50
  return Math.max(0, Math.min(100, ((valeur - min) / (max - min)) * 100))
}

function couche1(raquette, quiz) {
  const { genre, niveau, budget, budgetIllimite, sensations, kGene = 0 } = quiz
  const schema = raquette.schema || {}

  if (Object.keys(schema).length === 0) return { ok: false }
  if (raquette.stock <= 0) return { ok: false }
  if (!budgetIllimite && raquette.price > budget) return { ok: false }

  const seuils = getSeuilsEffectifs(niveau, sensations, kGene)
  const echecs = DIMS.filter(d => (schema[d] || 0) < seuils[d])
  if (echecs.length > 0) return { ok: false }

  const poids = getScoringPoids(sensations, kGene)
  let num = 0, den = 0
  DIMS.forEach(d => {
    num += poids[d] * (schema[d] || 0)
    den += poids[d] * 100
  })
  const scoreTech = den > 0 ? (num / den) * 100 : 0
  const coeff = coeffGenre(genre, raquette.genre)

  return { ok: true, scoreTech, coeffGenre: coeff }
}

function calculerScores(pool, budget, budgetIllimite, poidsOverride = null) {
  if (pool.length === 0) return []

  const marges    = pool.map(r => r.marge    || 0)
  const stocks    = pool.map(r => r.stock    || 0)
  const rotations = pool.map(r => r.rotation || 0)
  const prix      = pool.map(r => r.price    || 0)

  const [minM, maxM] = [Math.min(...marges),    Math.max(...marges)]
  const [minS, maxS] = [Math.min(...stocks),    Math.max(...stocks)]
  const [minR, maxR] = [Math.min(...rotations), Math.max(...rotations)]
  const [minP, maxP] = [Math.min(...prix),      Math.max(...prix)]

  const wT = poidsOverride?.tech     ?? W_TECH
  const wM = poidsOverride?.marge    ?? W_MARGE
  const wS = poidsOverride?.stock    ?? W_STOCK
  const wR = poidsOverride?.rotation ?? W_ROTATION
  const wP = poidsOverride?.prix     ?? W_PRIX

  return pool.map(r => {
    const scoreMarge    = normalise(r.marge    || 0, minM, maxM)
    const scoreStock    = normalise(r.stock    || 0, minS, maxS)
    const scoreRotation = normalise(r.rotation || 0, minR, maxR)

    let scorePrix
    if (budgetIllimite) {
      scorePrix = normalise(r.price || 0, minP, maxP)
    } else {
      // Respecte le budget : favorise les raquettes proches du budget max
      scorePrix = Math.min(100, ((r.price || 0) / budget) * 100)
    }

    const scoreBrut =
      r.scoreTech    * wT +
      scoreMarge     * wM +
      scorePrix      * wP +
      scoreStock     * wS +
      scoreRotation  * wR

    return { ...r, scoreFinal: Math.round(scoreBrut * r.coeffGenre), scoreMarge: Math.round(scoreMarge) }
  })
}

function preFiltrer(raquettes, quiz, budgetIllimite) {
  const { genre, budget } = quiz
  return raquettes.filter(r => {
    // 1. Stock
    if (r.stock <= 0 && !r.precommande) return false
    // 2. Budget (pré-filtre rapide avec marge de 10% pour les promos)
    if (!budgetIllimite && r.price > budget * 1.1) return false
    // 3. Genre (éliminer les raquettes clairement incompatibles)
    if (genre === 'Homme' && r.genre === 'Femme') return false
    if (genre === 'Femme' && r.genre === 'Homme') return false
    // 4. Schéma requis
    if (!r.schema || Object.keys(r.schema).length === 0) return false
    return true
  })
}

export function scoreRaquettes(raquettes, quiz, topN = 10, gene = 'aucune') {
  const sensations = Array.isArray(quiz.sensation) ? quiz.sensation : [quiz.sensation].filter(Boolean)
  const budgetIllimite = quiz.budgetIllimite || quiz.budget >= BUDGET_ILLIMITE
  const kGene = GENE_INTENSITE[gene] || 0
  const quizNorm = { ...quiz, sensations, budgetIllimite, kGene }

  // Pré-filtrage rapide avant scoring complet
  const candidats = preFiltrer(raquettes, quiz, budgetIllimite)

  // Couche 1 — filtrage technique (seuils déjà ajustés par la gêne via kGene)
  let pool = []
  candidats.forEach(r => {
    const res = couche1(r, quizNorm)
    if (res.ok) pool.push({ ...r, scoreTech: res.scoreTech, coeffGenre: res.coeffGenre })
  })

  if (pool.length === 0) return []

  // Gêne importante : on écarte le quart le plus lourd — avec repli si ça laisse trop peu de raquettes.
  if (kGene >= 1 && pool.length >= 6) {
    const poids = pool.map(r => poidsComparable(r.poids)).filter(v => v != null).sort((a, b) => a - b)
    if (poids.length >= 4) {
      const seuilLourd = poids[Math.floor(poids.length * 0.75)]
      const allege = pool.filter(r => {
        const w = poidsComparable(r.poids)
        return w == null || w < seuilLourd
      })
      if (allege.length >= 4) pool = allege
    }
  }

  // Scoring principal (marge réduite)
  const scored = calculerScores(pool, quiz.budget, budgetIllimite)
    .sort((a, b) => b.scoreFinal - a.scoreFinal)

  // Coup de coeur Joffrey : meilleur score marge parmi le pool
  const scoredJoffrey = calculerScores(pool, quiz.budget, budgetIllimite, {
    tech: W_TECH_JF, marge: W_MARGE_JF, stock: W_STOCK_JF,
    rotation: W_ROTATION_JF, prix: W_PRIX_JF,
  }).sort((a, b) => b.scoreFinal - a.scoreFinal)

  const joffreyId = scoredJoffrey[0]?.id

  // Top 1 du classement principal
  const top1 = scored[0]
  const top1Id = top1?.id
  const top1Score = top1?.scoreFinal || 0

  // Seuil de marge pour le coup de coeur Team EPS
  const SEUIL_MARGE = 30 // % de marge minimum

  // Chercher le meilleur candidat EPS parmi scoredJoffrey
  // Conditions : différent du top1, match >= 60%, écart <= 20pts avec top1, marge >= 30%, en stock
  const epsRaquetteCandidat = scoredJoffrey.find(r => {
    if (r.id === top1Id) return false
    const scoreBase = scored.find(s => s.id === r.id)
    if (!scoreBase) return false
    if (scoreBase.scoreFinal < 60) return false
    if (top1Score - scoreBase.scoreFinal > 20) return false
    if ((r.scoreMarge || 0) < SEUIL_MARGE) return false
    if (r.stock <= 0 && !r.precommande) return false
    return true
  })

  // Classement final sans le candidat EPS
  const top = scored.filter(r => r.id !== epsRaquetteCandidat?.id).slice(0, topN)

  // Insertion en 2e position uniquement si toutes les conditions sont remplies
  if (epsRaquetteCandidat) {
    const epsAvecFlag = {
      ...scored.find(r => r.id === epsRaquetteCandidat.id) || epsRaquetteCandidat,
      isEPS: true
    }
    top.splice(1, 0, epsAvecFlag)
  }

  return top.slice(0, topN)
}
