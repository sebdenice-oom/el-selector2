'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const ETAPES = [
  {
    id: 'genre',
    titre: 'Tu es ?',
    type: 'player_cards',
    options: [
      { value: 'Homme',  label: 'Homme',  image: 'https://cdn.shopify.com/s/files/1/0430/1861/6996/files/Homme.png?v=1780521845',  couleur: '#1A3A8F', gradient: 'linear-gradient(160deg, #1A3A8F 0%, #2B4EE5 100%)' },
      { value: 'Femme',  label: 'Femme',  image: 'https://cdn.shopify.com/s/files/1/0430/1861/6996/files/image_2026-06-03_232351053.png?v=1780521834', couleur: '#8B1A6B', gradient: 'linear-gradient(160deg, #8B1A6B 0%, #D4537E 100%)' },
      { value: 'Junior', label: 'Junior', emoji: '🧒', couleur: '#1A7A4A', gradient: 'linear-gradient(160deg, #1A7A4A 0%, #1D9E75 100%)' },
    ],
  },
  {
    id: 'niveau',
    titre: 'Quel est ton niveau ?',
    type: 'level_cards',
    options: [
      { value: 'debutant',      label: 'Débutant',      icon: '🎾', desc: 'Je commence le padel' },
      { value: 'intermediaire', label: 'Intermédiaire', icon: '🏆', desc: 'Je joue régulièrement' },
      { value: 'avance',        label: 'Avancé',        icon: '⚡', desc: 'Je compétis en club' },
      { value: 'competition',   label: 'Compétition',   icon: '🥇', desc: 'Je joue en tournoi' },
    ],
  },
  {
    id: 'budget',
    titre: 'Ton budget maximum',
    type: 'slider_budget',
    min: 50,
    max: 360,
    step: 10,
  },
  {
    id: 'sensation',
    titre: 'Tes critères importants',
    sous_titre: "Choisis jusqu'à 3 critères par ordre d'importance",
    type: 'ranked_chips',
    options: [
      { value: 'puissance',   label: 'Puissance',   icon: '⚡' },
      { value: 'maniabilite', label: 'Maniabilité', icon: '🏃' },
      { value: 'controle',    label: 'Contrôle',    icon: '🎯' },
      { value: 'confort',     label: 'Confort',     icon: '🛡️' },
      { value: 'spin',        label: 'Spin',        icon: '🌀' },
      { value: 'tolerance',   label: 'Tolérance',   icon: '💪' },
    ],
  },
  {
    id: 'email',
    titre: 'Reçois tes recommandations',
    sous_titre: 'Optionnel — reçois ton TOP 3 par email',
    type: 'email',
  },
]

const RANG_LABEL = ['1er', '2e', '3e']

// --- Modale d'entrée ---
function ModaleEntree({ onChoix }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { setTimeout(() => setVisible(true), 50) }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(26,26,46,0.55)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      opacity: visible ? 1 : 0, transition: 'opacity 0.3s ease',
    }}>
      <div style={{
        background: '#fff', borderRadius: 24, padding: '36px 28px 32px',
        maxWidth: 480, width: '100%',
        boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'transform 0.35s ease, opacity 0.35s ease',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <span style={{ fontFamily: 'var(--font)', fontSize: 22, fontWeight: 900, color: 'var(--bleu)' }}>
            EL <span style={{ color: 'var(--jaune)' }}>SELECTOR</span>
          </span>
        </div>
        <h2 style={{ fontFamily: 'var(--font)', fontSize: 'clamp(20px, 5vw, 26px)', fontWeight: 900, color: 'var(--texte)', textAlign: 'center', lineHeight: 1.2, marginBottom: 8 }}>
          Tu as déjà une raquette ?
        </h2>
        <p style={{ fontFamily: 'var(--font)', fontSize: 13, fontWeight: 600, color: 'var(--texte-muted)', textAlign: 'center', marginBottom: 28 }}>
          Choisis ton parcours pour trouver la raquette idéale
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
          <button
            onClick={() => onChoix('nouveau')}
            style={{ background: 'var(--bleu-light)', border: '2px solid var(--bleu)', borderRadius: 18, padding: '22px 14px', cursor: 'pointer', textAlign: 'center', transition: 'all .18s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}
            onMouseEnter={e => { e.currentTarget.style.background = '#dce6ff'; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--bleu-light)'; e.currentTarget.style.transform = 'translateY(0)' }}>
            <span style={{ fontSize: 38 }}>🎾</span>
            <div>
              <div style={{ fontFamily: 'var(--font)', fontSize: 15, fontWeight: 900, color: 'var(--bleu)', marginBottom: 4 }}>Non, premier achat</div>
              <div style={{ fontFamily: 'var(--font)', fontSize: 11, fontWeight: 600, color: 'var(--texte-muted)', lineHeight: 1.4 }}>Je cherche ma première raquette</div>
            </div>
            <span style={{ fontFamily: 'var(--font)', fontSize: 12, fontWeight: 800, background: 'var(--bleu)', color: '#fff', padding: '5px 14px', borderRadius: 100 }}>El Selector →</span>
          </button>
          <button
            onClick={() => onChoix('upgrade')}
            style={{ background: 'var(--jaune-light)', border: '2px solid var(--jaune)', borderRadius: 18, padding: '22px 14px', cursor: 'pointer', textAlign: 'center', transition: 'all .18s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}
            onMouseEnter={e => { e.currentTarget.style.background = '#fdedc0'; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--jaune-light)'; e.currentTarget.style.transform = 'translateY(0)' }}>
            <span style={{ fontSize: 38 }}>🚀</span>
            <div>
              <div style={{ fontFamily: 'var(--font)', fontSize: 15, fontWeight: 900, color: '#9A6B00', marginBottom: 4 }}>Oui, je veux évoluer</div>
              <div style={{ fontFamily: 'var(--font)', fontSize: 11, fontWeight: 600, color: 'var(--texte-muted)', lineHeight: 1.4 }}>J'ai une raquette et je veux progresser</div>
            </div>
            <span style={{ fontFamily: 'var(--font)', fontSize: 12, fontWeight: 800, background: 'var(--jaune)', color: '#1A1A2E', padding: '5px 14px', borderRadius: 100 }}>El Evoluteur →</span>
          </button>
        </div>
        <p style={{ fontFamily: 'var(--font)', fontSize: 11, fontWeight: 600, color: 'var(--texte-muted)', textAlign: 'center' }}>
          🚀 Propulsé par Esprit Padel Shop
        </p>
      </div>
    </div>
  )
}

export default function QuizPage() {
  const router = useRouter()
  const [modaleVisible, setModaleVisible] = useState(true)
  const [etape, setEtape] = useState(0)
  const [reponses, setReponses] = useState({ budget: 150, budgetSansLimite: false, sensation: [] })
  const [loading, setLoading] = useState(false)
  const [erreur, setErreur] = useState('')

  useEffect(() => {
    const retourEtape = sessionStorage.getItem('selector_retour_etape')
    const quizSauvegarde = sessionStorage.getItem('selector_quiz')
    if (retourEtape !== null) {
      sessionStorage.removeItem('selector_retour_etape')
      setModaleVisible(false)
      if (quizSauvegarde) {
        try {
          const q = JSON.parse(quizSauvegarde)
          setReponses({ budget: q.budget || 150, budgetSansLimite: q.budgetSansLimite || false, sensation: q.sensation || [], genre: q.genre, niveau: q.niveau })
        } catch (e) {}
      }
      setEtape(parseInt(retourEtape))
    }
  }, [])

  function handleChoix(choix) {
    if (choix === 'upgrade') router.push('/upgrade')
    else setModaleVisible(false)
  }

  const etapeIndex = Math.min(etape, ETAPES.length - 1)
  const etapeActuelle = ETAPES[etapeIndex]
  const progression = ((etapeIndex + 1) / ETAPES.length) * 100

  function selectionner(valeur) {
    setReponses(prev => ({ ...prev, [etapeActuelle.id]: valeur }))
  }

  function toggleSensation(valeur) {
    setReponses(prev => {
      const current = prev.sensation || []
      if (current.includes(valeur)) return { ...prev, sensation: current.filter(v => v !== valeur) }
      if (current.length >= 3) return prev
      return { ...prev, sensation: [...current, valeur] }
    })
  }

  function valeurActuelle() { return reponses[etapeActuelle.id] }

  function peutContinuer() {
    if (etapeActuelle.type === 'email') return true
    if (etapeActuelle.type === 'slider_budget') return true
    if (etapeActuelle.type === 'ranked_chips') return (reponses.sensation || []).length >= 1
    return !!valeurActuelle()
  }

  function avancer() {
    if (etapeIndex < ETAPES.length - 1) setEtape(etapeIndex + 1)
  }

  async function suivant() {
    if (etapeIndex < ETAPES.length - 1) { setEtape(etapeIndex + 1); return }
    await soumettre()
  }

  async function soumettre() {
    setLoading(true)
    setErreur('')
    try {
      const quiz = {
        genre: reponses.genre,
        niveau: reponses.niveau,
        budget: reponses.budgetSansLimite ? 99999 : reponses.budget,
        budgetSansLimite: reponses.budgetSansLimite || false,
        sensation: reponses.sensation || [],
      }
      const res = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quiz, email: reponses.email || null, customerId: null }),
      })
      const data = await res.json()
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
          <p style={{ color: 'var(--texte-muted)', fontFamily: 'var(--font)', fontWeight: 700 }}>Analyse de ton profil…</p>
        </div>
      </main>
    )
  }

  return (
    <>
      {modaleVisible && <ModaleEntree onChoix={handleChoix} />}
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
            <div className="progress-bar"><div className="progress-fill" style={{ width: progression + '%' }} /></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--texte-muted)', fontWeight: 700 }}>{etapeIndex + 1} / {ETAPES.length}</span>
              {etapeIndex > 0 && (
                <button onClick={() => setEtape(etapeIndex - 1)} style={{ fontSize: 13, color: 'var(--texte-muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)', fontWeight: 700 }}>
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

          {/* CARTES FIFA — Genre */}
          {etapeActuelle.type === 'player_cards' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
              {etapeActuelle.options.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { selectionner(opt.value); setTimeout(avancer, 220) }}
                  style={{
                    position: 'relative', overflow: 'hidden',
                    borderRadius: 18, border: `2.5px solid ${valeurActuelle() === opt.value ? '#fff' : 'transparent'}`,
                    background: opt.gradient, cursor: 'pointer',
                    padding: 0, aspectRatio: '2/3',
                    boxShadow: valeurActuelle() === opt.value ? `0 0 0 3px ${opt.couleur}, 0 8px 24px rgba(0,0,0,0.25)` : '0 4px 16px rgba(0,0,0,0.15)',
                    transform: valeurActuelle() === opt.value ? 'translateY(-4px) scale(1.03)' : 'none',
                    transition: 'all .2s ease',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end',
                  }}
                  onMouseEnter={e => { if (valeurActuelle() !== opt.value) e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { if (valeurActuelle() !== opt.value) e.currentTarget.style.transform = 'none' }}
                >
                  {/* Photo ou emoji */}
                  {opt.image ? (
                    <img src={opt.image} alt={opt.label} style={{
                      position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
                      height: '70%', objectFit: 'contain', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
                    }} />
                  ) : (
                    <span style={{ position: 'absolute', bottom: 40, fontSize: 52, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>
                      {opt.emoji}
                    </span>
                  )}
                  {/* Label bas */}
                  <div style={{
                    width: '100%', padding: '10px 8px',
                    background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)',
                    textAlign: 'center', position: 'relative', zIndex: 1,
                  }}>
                    <span style={{ fontFamily: 'var(--font)', fontSize: 14, fontWeight: 900, color: '#fff', letterSpacing: '0.03em' }}>
                      {opt.label}
                    </span>
                  </div>
                  {/* Check sélectionné */}
                  {valeurActuelle() === opt.value && (
                    <div style={{
                      position: 'absolute', top: 8, right: 8,
                      width: 22, height: 22, borderRadius: '50%',
                      background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, color: opt.couleur, fontWeight: 900,
                    }}>✓</div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* CARTES NIVEAU */}
          {etapeActuelle.type === 'level_cards' && (
            <div className="level-grid">
              {etapeActuelle.options.map(opt => (
                <button
                  key={opt.value}
                  className={'level-card' + (valeurActuelle() === opt.value ? ' active' : '')}
                  onClick={() => { selectionner(opt.value); setTimeout(avancer, 200) }}>
                  <div className="level-card-icon">{opt.icon}</div>
                  <div className="level-card-label">{opt.label}</div>
                  {opt.desc && <div style={{ fontSize: 11, color: 'var(--texte-muted)', marginTop: 4, fontWeight: 600 }}>{opt.desc}</div>}
                </button>
              ))}
            </div>
          )}

          {/* SLIDER BUDGET */}
          {etapeActuelle.type === 'slider_budget' && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                {reponses.budgetSansLimite ? (
                  <span style={{ fontFamily: 'var(--font)', fontSize: 48, fontWeight: 900, color: 'var(--jaune)' }}>
                    Sans limite 🚀
                  </span>
                ) : (
                  <span style={{ fontFamily: 'var(--font)', fontSize: 56, fontWeight: 900, color: 'var(--bleu)' }}>
                    {reponses.budget}€
                  </span>
                )}
              </div>

              <input
                type="range" min={50} max={360} step={10}
                value={reponses.budget}
                disabled={reponses.budgetSansLimite}
                onChange={e => setReponses(prev => ({ ...prev, budget: parseInt(e.target.value) }))}
                style={{ opacity: reponses.budgetSansLimite ? 0.3 : 1 }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, marginBottom: 24 }}>
                <span style={{ fontSize: 12, color: 'var(--texte-muted)', fontWeight: 700 }}>50€</span>
                <span style={{ fontSize: 12, color: 'var(--texte-muted)', fontWeight: 700 }}>360€</span>
              </div>

              {/* Bouton sans limite */}
              <button
                onClick={() => setReponses(prev => ({ ...prev, budgetSansLimite: !prev.budgetSansLimite }))}
                style={{
                  width: '100%', padding: '14px',
                  background: reponses.budgetSansLimite ? 'var(--jaune)' : 'var(--blanc)',
                  border: `2px solid ${reponses.budgetSansLimite ? 'var(--jaune)' : 'var(--bordure)'}`,
                  borderRadius: 12, fontFamily: 'var(--font)', fontSize: 14, fontWeight: 800,
                  color: reponses.budgetSansLimite ? '#1A1A2E' : 'var(--texte-muted)',
                  cursor: 'pointer', transition: 'all .2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                🚀 Pas de limite de budget
                {reponses.budgetSansLimite && <span style={{ fontSize: 12, fontWeight: 900 }}>✓</span>}
              </button>
              <p style={{ fontSize: 12, color: 'var(--texte-muted)', fontWeight: 600, textAlign: 'center', marginTop: 10 }}>
                Pour accéder aux raquettes premium jusqu'à 750€
              </p>
            </div>
          )}

          {/* CHIPS CRITÈRES — 2 lignes fixes de 3 */}
          {etapeActuelle.type === 'ranked_chips' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 20 }}>
                {etapeActuelle.options.map(opt => {
                  const rang = (reponses.sensation || []).indexOf(opt.value)
                  const selected = rang !== -1
                  const disabled = !selected && (reponses.sensation || []).length >= 3
                  return (
                    <button
                      key={opt.value}
                      disabled={disabled}
                      onClick={() => toggleSensation(opt.value)}
                      style={{
                        position: 'relative',
                        padding: '12px 8px',
                        borderRadius: 12,
                        border: `2px solid ${selected ? 'var(--bleu)' : 'var(--bordure)'}`,
                        background: selected ? 'var(--bleu)' : 'var(--blanc)',
                        color: selected ? '#fff' : 'var(--texte-muted)',
                        fontFamily: 'var(--font)', fontSize: 13, fontWeight: 700,
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        opacity: disabled ? 0.4 : 1,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                        transition: 'all .15s',
                      }}>
                      {selected && (
                        <div style={{
                          position: 'absolute', top: -8, right: -8,
                          width: 20, height: 20, borderRadius: '50%',
                          background: 'var(--jaune)', color: '#1A1A2E',
                          fontSize: 10, fontWeight: 900,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                        }}>
                          {rang + 1}
                        </div>
                      )}
                      <span style={{ fontSize: 20 }}>{opt.icon}</span>
                      <span>{opt.label}</span>
                    </button>
                  )
                })}
              </div>

              {(reponses.sensation || []).length > 0 && (
                <div style={{ background: 'var(--blanc)', border: '1px solid var(--bordure)', borderRadius: 12, padding: '12px 16px', marginBottom: 24 }}>
                  {(reponses.sensation || []).map((s, i) => {
                    const opt = etapeActuelle.options.find(o => o.value === s)
                    return (
                      <div key={s} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        paddingBottom: i < reponses.sensation.length - 1 ? 10 : 0,
                        marginBottom: i < reponses.sensation.length - 1 ? 10 : 0,
                        borderBottom: i < reponses.sensation.length - 1 ? '1px solid var(--bordure)' : 'none',
                      }}>
                        <span style={{ fontSize: 11, color: 'var(--texte-muted)', fontWeight: 800, width: 28 }}>{RANG_LABEL[i]}</span>
                        <span style={{ fontSize: 16 }}>{opt?.icon}</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--texte)', flex: 1 }}>{opt?.label || s}</span>
                        <button onClick={() => toggleSensation(s)} style={{ fontSize: 12, color: 'var(--texte-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* EMAIL */}
          {etapeActuelle.type === 'email' && (
            <div>
              <input
                type="email" placeholder="ton@email.com"
                value={reponses.email || ''}
                onChange={e => selectionner(e.target.value)}
                style={{
                  width: '100%', padding: '16px',
                  background: 'var(--blanc)', border: '2px solid var(--bordure)',
                  borderRadius: 12, color: 'var(--texte)',
                  fontFamily: 'var(--font)', fontSize: 15, fontWeight: 600,
                  outline: 'none', marginBottom: 12,
                }}
              />
              <p style={{ fontSize: 12, color: 'var(--texte-muted)', fontWeight: 600, textAlign: 'center' }}>
                🔒 Données traitées conformément au RGPD. Aucun spam.
              </p>
            </div>
          )}

          {erreur && (
            <p style={{ color: '#D32F2F', fontSize: 14, marginTop: 12, textAlign: 'center', fontWeight: 700 }}>{erreur}</p>
          )}
        </div>

        <div className="container" style={{ paddingBottom: 40 }}>
          {(etapeActuelle.type === 'slider_budget' || etapeActuelle.type === 'email' || etapeActuelle.type === 'ranked_chips') && (
            <button className="btn btn-primary" onClick={suivant} disabled={!peutContinuer()}>
              {etapeIndex === ETAPES.length - 1 ? 'Voir mes raquettes →' : 'Continuer →'}
            </button>
          )}
        </div>
      </main>
    </>
  )
}
