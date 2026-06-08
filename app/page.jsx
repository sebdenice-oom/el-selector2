'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const BUDGET_ILLIMITE = 99999

const ETAPES = [
  {
    id: 'genre',
    titre: 'Tu es ?',
    type: 'level_cards',
    options: [
      { value: 'Homme', label: 'Homme', image: 'https://cdn.shopify.com/s/files/1/0430/1861/6996/files/Homme.png?v=1780521845' },
      { value: 'Femme', label: 'Femme', image: 'https://cdn.shopify.com/s/files/1/0430/1861/6996/files/image_2026-06-03_232351053.png?v=1780521834' },
      { value: 'Junior', label: 'Enfant', icon: '🧒' },
    ],
  },
  {
    id: 'niveau',
    titre: 'Quel est ton niveau de jeu ?',
    type: 'level_cards',
    options: [
      { value: 'debutant',      label: 'Débutant',      icon: '🎾' },
      { value: 'intermediaire', label: 'Intermédiaire', icon: '🏆' },
      { value: 'avance',        label: 'Avancé',        icon: '⚡' },
      { value: 'competition',   label: 'Compétition',   icon: '🥇' },
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

export default function QuizPage() {
  const router = useRouter()
  const [modaleVisible, setModaleVisible] = useState(() => {
    if (typeof window !== 'undefined') {
      return !sessionStorage.getItem('selector_quiz_started')
    }
    return true
  })
  const [etape, setEtape] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('selector_etape')
      if (stored !== null) { sessionStorage.removeItem('selector_etape'); return parseInt(stored) }
    }
    return 0
  })
  const [reponses, setReponses] = useState({ budget: 150, sensation: [], budgetIllimite: false })
  const [loading, setLoading] = useState(false)
  const [erreur, setErreur] = useState('')

  const etapeIndex = Math.min(etape, ETAPES.length - 1)
  const etapeActuelle = ETAPES[etapeIndex]
  const progression = (etapeIndex / ETAPES.length) * 100

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

  function toggleBudgetIllimite() {
    setReponses(function(prev) {
      return Object.assign({}, prev, {
        budgetIllimite: !prev.budgetIllimite,
        budget: !prev.budgetIllimite ? BUDGET_ILLIMITE : 150,
      })
    })
  }

  function valeurActuelle() { return reponses[etapeActuelle.id] }

  function peutContinuer() {
    if (etapeActuelle.type === 'slider') return true
    if (etapeActuelle.type === 'ranked_chips') return (reponses.sensation || []).length >= 1
    return !!valeurActuelle()
  }

  function avancer() {
    if (etapeIndex < ETAPES.length - 1) setEtape(etapeIndex + 1)
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
      sessionStorage.removeItem('selector_quiz_started')
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
          <p style={{ color: 'var(--texte-muted)', fontFamily: 'var(--font)', fontWeight: 700 }}>Analyse de ton profil…</p>
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--fond)' }}>

      {/* MODALE D'ENTRÉE */}
      {modaleVisible && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: '32px 24px', maxWidth: 480, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <span style={{ fontFamily: 'var(--font)', fontSize: 22, fontWeight: 900, color: 'var(--bleu)' }}>
                EL <span style={{ color: 'var(--jaune)' }}>SELECTOR</span>
              </span>
              <p style={{ fontFamily: 'var(--font)', fontSize: 16, fontWeight: 800, color: '#1A1A2E', marginTop: 16, marginBottom: 6 }}>
                Tu as déjà une raquette de padel ?
              </p>
              <p style={{ fontFamily: 'var(--font)', fontSize: 13, fontWeight: 600, color: '#888' }}>
                On t'oriente vers le bon outil
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button
                onClick={() => { sessionStorage.setItem('selector_quiz_started', '1'); setModaleVisible(false) }}
                style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', background: '#F8F9FB', border: '2px solid #E8EAF0', borderRadius: 14, cursor: 'pointer', textAlign: 'left', transition: 'border-color .15s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--bleu)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#E8EAF0'}>
                <span style={{ fontSize: 28 }}>🏏</span>
                <div>
                  <div style={{ fontFamily: 'var(--font)', fontSize: 14, fontWeight: 800, color: '#1A1A2E', marginBottom: 2 }}>Non, je cherche ma première raquette</div>
                  <div style={{ fontFamily: 'var(--font)', fontSize: 12, fontWeight: 600, color: '#888' }}>El Selector — quiz en 4 étapes</div>
                </div>
              </button>
              <button
                onClick={() => router.push('/upgrade')}
                style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', background: '#F0F3FF', border: '2px solid #C8D3F9', borderRadius: 14, cursor: 'pointer', textAlign: 'left', transition: 'border-color .15s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--bleu)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#C8D3F9'}>
                <span style={{ fontSize: 28 }}>🚀</span>
                <div>
                  <div style={{ fontFamily: 'var(--font)', fontSize: 14, fontWeight: 800, color: '#1A1A2E', marginBottom: 2 }}>Oui, je veux évoluer</div>
                  <div style={{ fontFamily: 'var(--font)', fontSize: 12, fontWeight: 600, color: '#888' }}>El Evoluteur — trouve ta prochaine raquette</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

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
              <button onClick={function() { setEtape(etapeIndex - 1) }}
                style={{ fontSize: 13, color: 'var(--texte-muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)', fontWeight: 700 }}>
                ← Retour
              </button>
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

        {etapeActuelle.type === 'level_cards' && (
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

        {etapeActuelle.type === 'slider' && (
          <div>
            {reponses.budgetIllimite ? (
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <span style={{ fontFamily: 'var(--font)', fontSize: 42, fontWeight: 900, color: 'var(--bleu)' }}>
                  Budget illimité
                </span>
              </div>
            ) : (
              <div>
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                  <span style={{ fontFamily: 'var(--font)', fontSize: 56, fontWeight: 900, color: 'var(--bleu)' }}>
                    {reponses.budget}€
                  </span>
                </div>
                <input type="range" min={50} max={360} step={10}
                  value={reponses.budget}
                  onChange={function(e) { selectionner(parseInt(e.target.value)) }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                  <span style={{ fontSize: 12, color: 'var(--texte-muted)', fontWeight: 700 }}>50€</span>
                  <span style={{ fontSize: 12, color: 'var(--texte-muted)', fontWeight: 700 }}>360€</span>
                </div>
              </div>
            )}
            <button
              onClick={toggleBudgetIllimite}
              style={{
                display: 'block', width: '100%', marginTop: 20,
                padding: '12px', borderRadius: 12, cursor: 'pointer',
                fontFamily: 'var(--font)', fontSize: 14, fontWeight: 700,
                border: reponses.budgetIllimite ? '2px solid var(--bleu)' : '2px solid var(--bordure)',
                background: reponses.budgetIllimite ? 'var(--bleu-light)' : 'transparent',
                color: reponses.budgetIllimite ? 'var(--bleu)' : 'var(--texte-muted)',
                transition: 'all .15s',
              }}>
              {reponses.budgetIllimite ? '✓ Budget illimité activé' : 'Pas de limite de budget'}
            </button>
          </div>
        )}

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
      </div>

      <div className="container" style={{ paddingBottom: 40 }}>
        {(etapeActuelle.type === 'slider' || etapeActuelle.type === 'ranked_chips') && (
          <button className="btn btn-primary" onClick={suivant} disabled={!peutContinuer()}>
            {etapeIndex === ETAPES.length - 1 ? 'Voir mes raquettes →' : 'Continuer →'}
          </button>
        )}
      </div>

    </main>
  )
}
