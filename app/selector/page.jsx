'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const BUDGET_ILLIMITE = 99999

const ETAPES = [
  {
    id: 'genre',
    titre: 'Pour qui cherches-tu une raquette ?',
    sous_titre: 'On adapte les recommandations au gabarit et au jeu.',
    type: 'level_cards',
    options: [
      { value: 'Homme', label: 'Homme', image: 'https://cdn.shopify.com/s/files/1/0430/1861/6996/files/Homme.png?v=1780521845' },
      { value: 'Femme', label: 'Femme', image: 'https://cdn.shopify.com/s/files/1/0430/1861/6996/files/image_2026-06-03_232351053.png?v=1780521834' },
      { value: 'Junior', label: 'Junior', illustration: 'junior' },
    ],
  },
  {
    id: 'niveau',
    titre: 'Quel est ton niveau ?',
    sous_titre: "Sois honnête : c'est le critère qui pèse le plus sur la reco.",
    type: 'gauge',
    options: [
      { value: 'debutant',      label: 'Débutant',      def: 'tu débutes ou tu joues de temps en temps ; tu cherches surtout du confort et de la tolérance.' },
      { value: 'intermediaire', label: 'Intermédiaire', def: 'tu joues régulièrement, tu maîtrises la sortie de vitre et tu commences à smasher.' },
      { value: 'avance',        label: 'Confirmé',      def: 'tu joues souvent, tu places tes coups et tu cherches plus de puissance et de contrôle.' },
      { value: 'competition',   label: 'Expert',        def: 'tu joues en compétition ou à haut niveau ; tu veux une raquette exigeante et performante.' },
    ],
  },
  {
    id: 'budget',
    titre: 'Ton budget maximum',
    type: 'slider',
  },
  {
    id: 'sensation',
    titre: 'Tes critères importants',
    sous_titre: "Choisis jusqu'à 3 sensations par ordre d'importance",
    type: 'ranked_chips',
    options: [
      { value: 'puissance',   label: '⚡ Puissance' },
      { value: 'maniabilite', label: '🏃 Maniabilité' },
      { value: 'controle',    label: '🎯 Contrôle' },
      { value: 'confort',     label: '🛡️ Confort' },
      { value: 'spin',        label: '🌀 Spin' },
      { value: 'tolerance',   label: '💪 Tolérance' },
    ],
  },
]

const RANG_LABEL = ['1er', '2e', '3e']

// Illustration Junior — provisoire (dessin à refaire), aux couleurs de la marque.
function JuniorIllus() {
  return (
    <svg viewBox="0 0 120 120" width="82" height="82" role="img" aria-label="Junior">
      <g transform="rotate(18 90 46)">
        <ellipse cx="90" cy="42" rx="15" ry="18" fill="#F6BC3E" stroke="#1A1A2E" strokeWidth="3" />
        <circle cx="86" cy="38" r="1.5" fill="#1A1A2E" />
        <circle cx="94" cy="38" r="1.5" fill="#1A1A2E" />
        <circle cx="90" cy="46" r="1.5" fill="#1A1A2E" />
        <line x1="90" y1="60" x2="90" y2="80" stroke="#1A1A2E" strokeWidth="4" strokeLinecap="round" />
      </g>
      <path d="M38 114 v-22 a20 20 0 0 1 40 0 v22 z" fill="#2B4EE5" />
      <circle cx="58" cy="52" r="18" fill="#FFD9A8" stroke="#1A1A2E" strokeWidth="2.5" />
      <path d="M40 50 a18 18 0 0 1 36 0 q-8 -6 -18 -6 t-18 6 z" fill="#1A1A2E" />
      <circle cx="52" cy="53" r="2" fill="#1A1A2E" />
      <circle cx="64" cy="53" r="2" fill="#1A1A2E" />
      <path d="M53 61 q5 4 10 0" stroke="#1A1A2E" strokeWidth="2" fill="none" strokeLinecap="round" />
      <line x1="72" y1="90" x2="86" y2="68" stroke="#2B4EE5" strokeWidth="7" strokeLinecap="round" />
    </svg>
  )
}

export default function QuizPage() {
  const router = useRouter()
  const [etape, setEtape] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('selector_etape')
      if (stored !== null) { sessionStorage.removeItem('selector_etape'); return parseInt(stored) }
    }
    return 0
  })
  const [reponses, setReponses] = useState(() => {
    // Recharger les réponses précédentes si on revient modifier un critère
    if (typeof window !== 'undefined') {
      const storedQuiz = sessionStorage.getItem('selector_quiz')
      if (storedQuiz) {
        try {
          const q = JSON.parse(storedQuiz)
          return {
            genre: q.genre || '',
            niveau: q.niveau || '',
            budget: q.budget >= 99999 ? 150 : (q.budget || 150),
            budgetIllimite: q.budget >= 99999 || q.budgetIllimite || false,
            sensation: q.sensation || [],
          }
        } catch(e) {}
      }
    }
    return { budget: 150, sensation: [], budgetIllimite: false }
  })
  const [loading, setLoading] = useState(false)
  const [erreur, setErreur] = useState('')

  const etapeIndex = Math.min(etape, ETAPES.length - 1)
  const etapeActuelle = ETAPES[etapeIndex]
  const progression = (etapeIndex / ETAPES.length) * 100

  // Jauge : sélectionne un palier par défaut (Intermédiaire) à l'entrée de l'étape
  useEffect(function() {
    if (etapeActuelle.type === 'gauge' && !reponses[etapeActuelle.id]) {
      var parDefaut = etapeActuelle.options[1] || etapeActuelle.options[0]
      if (parDefaut) setReponses(function(prev) { return Object.assign({}, prev, { [etapeActuelle.id]: parDefaut.value }) })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [etapeActuelle.id])

  function selectionner(valeur) {
    setReponses(function(prev) { return Object.assign({}, prev, { [etapeActuelle.id]: valeur }) })
  }

  function toggleSensation(valeur) {
    setReponses(function(prev) {
      var current = prev.sensation || []
      if (current.includes(valeur)) {
        return Object.assign({}, prev, { sensation: current.filter(function(v) { return v !== valeur }) })
      }
      if (current.length >= 3) return prev
      return Object.assign({}, prev, { sensation: current.concat([valeur]) })
    })
  }

  function valeurActuelle() { return reponses[etapeActuelle.id] }

  function peutContinuer() {
    if (etapeActuelle.type === 'slider') return true
    if (etapeActuelle.type === 'gauge') return !!valeurActuelle()
    if (etapeActuelle.type === 'ranked_chips') return (reponses.sensation || []).length >= 1
    return !!valeurActuelle()
  }

  function avancer() {
    const prochaine = etapeIndex + 1
    if (prochaine >= ETAPES.length) return
    // Si Junior, on saute l'étape niveau (index 1)
    if (ETAPES[prochaine]?.id === 'niveau' && reponses.genre === 'Junior') {
      setReponses(prev => ({ ...prev, niveau: 'debutant' })) // niveau par défaut pour junior
      setEtape(prochaine + 1)
    } else {
      setEtape(prochaine)
    }
  }

  async function suivant() {
    if (etapeIndex < ETAPES.length - 1) {
      setEtape(etapeIndex + 1)
      return
    }
    await soumettre()
  }

  async function soumettre() {
    setLoading(true)
    setErreur('')
    try {
      var quiz = {
        genre: reponses.genre,
        niveau: reponses.niveau,
        budget: reponses.budgetIllimite ? BUDGET_ILLIMITE : reponses.budget,
        budgetIllimite: reponses.budgetIllimite || false,
        sensation: reponses.sensation || [],
      }
      var res = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quiz: quiz, email: null, customerId: null }),
      })
      var data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur serveur')
      sessionStorage.setItem('selector_resultats', JSON.stringify(data.resultats))
      sessionStorage.setItem('selector_quiz', JSON.stringify(quiz))
      router.push('/resultats')
    } catch (e) {
      setErreur('Une erreur est survenue. Veuillez réessayer.')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--fond)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 20px' }} />
          <p style={{ color: 'var(--texte-muted)', fontFamily: 'var(--font)', fontWeight: 700 }}>Ne bouge pas, ta future raquette est bientôt là ! 🎾</p>
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--fond)' }}>

      <header style={{ background: 'var(--blanc)', borderBottom: '1px solid var(--bordure)', padding: '14px 20px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <span style={{ fontFamily: 'var(--font)', fontSize: 18, fontWeight: 900, color: 'var(--bleu)' }}>
            EL <span style={{ color: 'var(--jaune)' }}>SELECTOR</span>
          </span>
        </div>
      </header>

      <div style={{ background: 'var(--blanc)', padding: '10px 20px 14px', borderBottom: '1px solid var(--bordure)' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: progression + '%' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--texte-muted)', fontWeight: 700 }}>{etapeIndex + 1} / {ETAPES.length}</span>
            {etapeIndex > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <button
                  onClick={function() {
                    try {
                      sessionStorage.removeItem('selector_quiz')
                      sessionStorage.removeItem('selector_etape')
                      sessionStorage.removeItem('selector_resultats')
                    } catch (e) {}
                    setReponses({ budget: 150, sensation: [], budgetIllimite: false })
                    setEtape(0)
                  }}
                  style={{ fontSize: 13, color: 'var(--bleu)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)', fontWeight: 800 }}>
                  ↻ Recommencer
                </button>
                <button onClick={function() { setEtape(etapeIndex - 1) }}
                  style={{ fontSize: 13, color: 'var(--texte-muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)', fontWeight: 700 }}>
                  ← Retour
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container fade-up" style={{ flex: 1, paddingTop: 40, paddingBottom: 32 }} key={etapeIndex}>
        <h1 style={{ fontFamily: 'var(--font)', fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 900, color: 'var(--texte)', textAlign: 'center', lineHeight: 1.2, marginBottom: etapeActuelle.sous_titre ? 8 : 32 }}>
          {etapeActuelle.titre}
        </h1>

        {etapeActuelle.sous_titre && (
          <p style={{ color: 'var(--texte-muted)', marginBottom: 28, fontSize: 14, textAlign: 'center', fontWeight: 600 }}>
            {etapeActuelle.sous_titre}
          </p>
        )}

        {etapeActuelle.type === 'level_cards' && etapeActuelle.id === 'genre' && (
          <div className="genre-grid">
            {etapeActuelle.options.map(function(opt) {
              return (
                <button key={opt.value}
                  className={'genre-card' + (valeurActuelle() === opt.value ? ' active' : '')}
                  onClick={function() { selectionner(opt.value); setTimeout(avancer, 200) }}>
                  <div className="genre-illus">
                    {opt.image
                      ? <img src={opt.image} alt={opt.label} />
                      : <JuniorIllus />}
                  </div>
                  <div className="genre-card-label">{opt.label}</div>
                </button>
              )
            })}
          </div>
        )}

        {etapeActuelle.type === 'level_cards' && etapeActuelle.id !== 'genre' && (
          <div className="level-grid">
            {etapeActuelle.options.map(function(opt) {
              return (
                <button key={opt.value}
                  className={'level-card' + (valeurActuelle() === opt.value ? ' active' : '')}
                  onClick={function() { selectionner(opt.value); setTimeout(avancer, 200) }}>
                  {opt.image
                    ? <img src={opt.image} alt={opt.label} style={{ width: 90, height: 90, objectFit: 'contain', marginBottom: 4 }} />
                    : <div className="level-card-icon">{opt.icon}</div>}
                  <div className="level-card-label">{opt.label}</div>
                </button>
              )
            })}
          </div>
        )}

        {etapeActuelle.type === 'gauge' && (function() {
          var opts = etapeActuelle.options
          var idx = opts.findIndex(function(o) { return o.value === valeurActuelle() })
          if (idx < 0) idx = 1
          var courant = opts[idx] || opts[0]
          var pct = opts.length > 1 ? (idx / (opts.length - 1)) * 100 : 0
          return (
            <div className="gauge-box">
              <div className="gauge-label">Niveau de jeu</div>
              <input type="range" className="gauge-range" min={0} max={opts.length - 1} step={1}
                value={idx}
                onChange={function(e) { selectionner(opts[parseInt(e.target.value, 10)].value) }}
                style={{ background: 'linear-gradient(to right, var(--bleu) 0%, var(--bleu) ' + pct + '%, var(--bordure) ' + pct + '%, var(--bordure) 100%)' }} />
              <div className="gauge-ticks">
                {opts.map(function(o, i) {
                  return (
                    <button key={o.value} type="button"
                      className={'gauge-tick' + (i === idx ? ' active' : '')}
                      onClick={function() { selectionner(o.value) }}>
                      {o.label}
                    </button>
                  )
                })}
              </div>
              <p className="gauge-def"><strong>{courant.label}</strong> — {courant.def}</p>
            </div>
          )
        })()}

        {etapeActuelle.type === 'slider' && (() => {
          var budgetAffiche = reponses.budget >= BUDGET_ILLIMITE ? 500 : reponses.budget
          return (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <span style={{ fontFamily: 'var(--font)', fontSize: 56, fontWeight: 900, color: 'var(--bleu)' }}>
                {budgetAffiche}€
              </span>
            </div>
            <input type="range" min={0} max={500} step={10}
              value={budgetAffiche}
              onChange={function(e) {
                var v = parseInt(e.target.value, 10)
                setReponses(function(prev) { return Object.assign({}, prev, { budget: v, budgetIllimite: false }) })
              }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
              <span style={{ fontSize: 12, color: 'var(--texte-muted)', fontWeight: 700 }}>0€</span>
              <span style={{ fontSize: 12, color: 'var(--texte-muted)', fontWeight: 700 }}>500€</span>
            </div>
            <button
              onClick={function() {
                setReponses(function(prev) { return Object.assign({}, prev, { budgetIllimite: true, budget: BUDGET_ILLIMITE }) })
                if (etapeIndex < ETAPES.length - 1) setEtape(etapeIndex + 1)
              }}
              style={{
                display: 'block', width: '100%', marginTop: 20,
                padding: '12px', borderRadius: 12, cursor: 'pointer',
                fontFamily: 'var(--font)', fontSize: 14, fontWeight: 700,
                border: '2px solid var(--bordure)', background: 'transparent', color: 'var(--texte-muted)',
                transition: 'all .15s',
              }}>
              Pas de limite de budget →
            </button>
          </div>
          )
        })()}

        {etapeActuelle.type === 'ranked_chips' && (
          <div>
            {/* Grille fixe 3×2 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
              {etapeActuelle.options.map(function(opt) {
                var rang = (reponses.sensation || []).indexOf(opt.value)
                var selected = rang !== -1
                var disabled = !selected && (reponses.sensation || []).length >= 3
                return (
                  <button key={opt.value} disabled={disabled}
                    onClick={function() { toggleSensation(opt.value) }}
                    style={{
                      position: 'relative',
                      padding: '14px 10px',
                      borderRadius: 12,
                      border: '2px solid ' + (selected ? 'var(--bleu)' : 'var(--bordure)'),
                      background: selected ? 'var(--bleu)' : 'var(--blanc)',
                      color: selected ? '#fff' : 'var(--texte-muted)',
                      fontFamily: 'var(--font)', fontSize: 13, fontWeight: 700,
                      cursor: disabled ? 'not-allowed' : 'pointer',
                      opacity: disabled ? 0.4 : 1,
                      textAlign: 'center',
                      transition: 'all .15s',
                    }}>
                    {selected && (
                      <span style={{
                        position: 'absolute', top: 6, right: 6,
                        width: 18, height: 18, borderRadius: '50%',
                        background: 'var(--jaune)', color: '#1A1A2E',
                        fontSize: 10, fontWeight: 900,
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {rang + 1}
                      </span>
                    )}
                    {opt.label}
                  </button>
                )
              })}
            </div>

            {/* Récap ordre de sélection */}
            {(reponses.sensation || []).length > 0 && (
              <div style={{ background: 'var(--blanc)', border: '1px solid var(--bordure)', borderRadius: 12, padding: '12px 16px', marginBottom: 24 }}>
                {(reponses.sensation || []).map(function(s, i) {
                  var opt = etapeActuelle.options.find(function(o) { return o.value === s })
                  return (
                    <div key={s} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      paddingBottom: i < reponses.sensation.length - 1 ? 10 : 0,
                      marginBottom: i < reponses.sensation.length - 1 ? 10 : 0,
                      borderBottom: i < reponses.sensation.length - 1 ? '1px solid var(--bordure)' : 'none',
                    }}>
                      <span style={{ fontSize: 11, color: 'var(--texte-muted)', fontWeight: 800, width: 28 }}>{RANG_LABEL[i]}</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--texte)', flex: 1 }}>{opt ? opt.label : s}</span>
                      <button onClick={function() { toggleSensation(s) }}
                        style={{ fontSize: 12, color: 'var(--texte-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {erreur && (
          <p style={{ color: '#D32F2F', fontSize: 14, marginTop: 12, textAlign: 'center', fontWeight: 700 }}>{erreur}</p>
        )}

        {(etapeActuelle.type === 'slider' || etapeActuelle.type === 'ranked_chips' || etapeActuelle.type === 'gauge') && (
          <div style={{ maxWidth: 520, margin: '28px auto 0' }}>
            <button className="btn btn-primary" onClick={suivant} disabled={!peutContinuer()}>
              {etapeIndex === ETAPES.length - 1 ? 'Voir mes raquettes →' : 'Continuer →'}
            </button>
          </div>
        )}
      </div>

    </main>
  )
}
