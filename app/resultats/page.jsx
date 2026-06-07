'use client'
import { useEffect, useState } from 'react'

const DIMS = ['Puissance', 'Confort', 'Spin', 'Contrôle', 'Tolérance', 'Maniabilité']
const DIM_ICONS = { Puissance: '⚡', Confort: '🛡️', Spin: '🌀', Contrôle: '🎯', Tolérance: '💪', Maniabilité: '🏃' }
const COULEUR_PROP = '#2B4EE5'
const PAGE_SIZE = 6 // 3 lignes de 2

const LABEL_SENSATION = {
  puissance: '⚡ Puissance', maniabilite: '🏃 Maniabilité',
  controle: '🎯 Contrôle', confort: '🛡️ Confort', spin: '🌀 Spin', tolerance: '💪 Tolérance',
}
const LABEL_NIVEAU = {
  debutant: 'Débutant', intermediaire: 'Intermédiaire', avance: 'Avancé', competition: 'Compétition',
}

// Radar zoomé 50-100 — solo (pas de comparaison)
function radarPoint(valeur, angle, cx, cy, r) {
  const offset = ((valeur - 50) / 50) * r
  return [cx + offset * Math.cos(angle), cy + offset * Math.sin(angle)]
}

function RadarSolo({ schema }) {
  const cx = 110, cy = 115, r = 88
  const angles = DIMS.map((_, i) => (Math.PI / 3) * i - Math.PI / 2)
  const pts = DIMS.map((d, i) => radarPoint(schema[d] ?? 50, angles[i], cx, cy, r))
  const toStr = ps => ps.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const grid100 = angles.map(a => [cx + r * Math.cos(a), cy + r * Math.sin(a)])
  const grid75  = angles.map(a => [cx + (r / 2) * Math.cos(a), cy + (r / 2) * Math.sin(a)])
  const labels  = { Puissance: 'Puissance', Confort: 'Confort', Spin: 'Spin', Contrôle: 'Contrôle', Tolérance: 'Tolérance', Maniabilité: 'Maniab.' }

  return (
    <svg width={220} height={230} viewBox="0 0 220 230" style={{ display: 'block', margin: '0 auto' }}>
      {angles.map((a, i) => <line key={i} x1={cx} y1={cy} x2={grid100[i][0].toFixed(1)} y2={grid100[i][1].toFixed(1)} stroke="#E8EAF0" strokeWidth="0.5" />)}
      <polygon points={toStr(grid100)} fill="none" stroke="#E8EAF0" strokeWidth="0.8" />
      <polygon points={toStr(grid75)}  fill="none" stroke="#E8EAF0" strokeWidth="0.8" />
      <circle cx={cx} cy={cy} r={2} fill="#E8EAF0" />
      <text x={cx} y={cy - 4}        textAnchor="middle" fontSize={8} fill="#aaa" fontFamily="Nunito,sans-serif">50</text>
      <text x={cx} y={cy - r/2 - 3}  textAnchor="middle" fontSize={8} fill="#aaa" fontFamily="Nunito,sans-serif">75</text>
      <text x={cx} y={cy - r - 3}    textAnchor="middle" fontSize={8} fill="#aaa" fontFamily="Nunito,sans-serif">100</text>
      <polygon points={toStr(pts)} fill={COULEUR_PROP + '20'} stroke={COULEUR_PROP} strokeWidth={2.5} strokeLinejoin="round" />
      {DIMS.map((d, i) => {
        const a   = angles[i]
        const lx  = cx + (r + 18) * Math.cos(a)
        const ly  = cy + (r + 18) * Math.sin(a)
        const anc = lx < cx - 5 ? 'end' : lx > cx + 5 ? 'start' : 'middle'
        return <text key={i} x={lx.toFixed(1)} y={(ly + 3).toFixed(1)} textAnchor={anc} fontSize={9} fontWeight="600" fill="#888" fontFamily="Nunito,sans-serif">{labels[d]}</text>
      })}
    </svg>
  )
}

function ModalProfil({ raquette, onClose }) {
  if (!raquette) return null
  const schema = raquette.schema || {}
  const hasPromo = raquette.compareAtPrice && raquette.compareAtPrice > raquette.price
  const remise = hasPromo ? Math.round((1 - raquette.price / raquette.compareAtPrice) * 100) : 0

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 520, maxHeight: '88vh', overflowY: 'auto', padding: '20px 16px 40px', position: 'relative' }}>
        {/* Handle */}
        <div style={{ width: 36, height: 4, background: '#E8EAF0', borderRadius: 2, margin: '0 auto 16px' }} />
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: '#F8F9FB', border: 'none', borderRadius: '50%', width: 30, height: 30, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>✕</button>

        {/* Infos raquette */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'flex-start' }}>
          <div style={{ width: 72, height: 72, background: '#F0F3FF', borderRadius: 12, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {raquette.image ? <img src={raquette.image} alt={raquette.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span style={{ fontSize: 32 }}>🏏</span>}
          </div>
          <div>
            <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, fontWeight: 800, color: '#1A1A2E', marginBottom: 4, lineHeight: 1.3 }}>{raquette.title}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 20, fontWeight: 900, color: hasPromo ? '#D85A30' : COULEUR_PROP }}>{parseFloat(raquette.price).toFixed(2)} €</span>
              {hasPromo && <>
                <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, fontWeight: 700, color: '#aaa', textDecoration: 'line-through' }}>{parseFloat(raquette.compareAtPrice).toFixed(2)} €</span>
                <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, fontWeight: 800, background: '#FEE8E0', color: '#D85A30', padding: '2px 7px', borderRadius: 100 }}>-{remise}%</span>
              </>}
            </div>
          </div>
        </div>

        {/* Score */}
        <div style={{ textAlign: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: '#888', fontFamily: 'Nunito, sans-serif' }}>Score de correspondance</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: COULEUR_PROP, fontFamily: 'Nunito, sans-serif', lineHeight: 1.2 }}>{raquette.scoreFinal}%</div>
        </div>

        {/* Radar */}
        <RadarSolo schema={schema} />

        {/* Tableau */}
        <div style={{ marginTop: 14 }}>
          {DIMS.filter(d => schema[d] !== undefined).map(d => (
            <div key={d} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: '0.5px solid #EEF0F6' }}>
              <span style={{ fontSize: 15, width: 22, textAlign: 'center', flexShrink: 0 }}>{DIM_ICONS[d]}</span>
              <span style={{ fontSize: 13, color: '#888', flex: 1, fontFamily: 'Nunito, sans-serif' }}>{d}</span>
              <span style={{ fontSize: 16, fontWeight: 900, color: COULEUR_PROP, fontFamily: 'Nunito, sans-serif' }}>{schema[d]}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <a href={raquette.url} target="_blank" rel="noopener noreferrer"
          style={{ display: 'block', width: '100%', padding: '14px', background: COULEUR_PROP, color: '#fff', border: 'none', borderRadius: 12, fontFamily: 'Nunito, sans-serif', fontSize: 14, fontWeight: 800, cursor: 'pointer', marginTop: 20, textAlign: 'center', textDecoration: 'none' }}>
          Voir la raquette sur le site →
        </a>
      </div>
    </div>
  )
}

function RaquetteCard({ raquette, rank, onVoirProfil }) {
  const isTop = rank === 1
  const hasPromo = raquette.compareAtPrice && raquette.compareAtPrice > raquette.price
  const remise = hasPromo ? Math.round((1 - raquette.price / raquette.compareAtPrice) * 100) : 0

  return (
    <div style={{ border: `1.5px solid ${isTop ? COULEUR_PROP : '#E8EAF0'}`, borderRadius: 12, overflow: 'hidden', background: '#fff', boxShadow: isTop ? '0 4px 16px rgba(43,78,229,0.12)' : 'none', display: 'flex', flexDirection: 'column' }}>
      {isTop && <div style={{ background: COULEUR_PROP, color: '#fff', fontSize: 9, fontWeight: 800, padding: '3px 10px', fontFamily: 'Nunito, sans-serif', letterSpacing: '0.05em' }}>⭐ TOP MATCH</div>}

      {/* Corps cliquable → site */}
      <a href={raquette.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'flex', gap: 10, padding: '10px', alignItems: 'flex-start', flex: 1 }}
        onMouseEnter={e => e.currentTarget.style.background = '#F8F9FB'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
        <div style={{ width: 56, height: 56, background: '#F0F3FF', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', position: 'relative' }}>
          {raquette.image ? <img src={raquette.image} alt={raquette.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span style={{ fontSize: 28 }}>🏏</span>}
          {!isTop && <div style={{ position: 'absolute', top: 2, left: 2, background: '#F8F9FB', border: '1px solid #E8EAF0', borderRadius: 5, padding: '1px 4px', fontSize: 8, fontWeight: 800, color: '#888', fontFamily: 'Nunito, sans-serif' }}>#{rank}</div>}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, fontWeight: 800, color: '#1A1A2E', lineHeight: 1.3, marginBottom: 4 }}>{raquette.title}</div>
          <div style={{ marginBottom: 4 }}>
            <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 15, fontWeight: 900, color: hasPromo ? '#D85A30' : COULEUR_PROP }}>{parseFloat(raquette.price).toFixed(2)} €</span>
            {hasPromo && <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 10, fontWeight: 700, color: '#aaa', textDecoration: 'line-through', marginLeft: 4 }}>{parseFloat(raquette.compareAtPrice).toFixed(2)} €</span>}
            {hasPromo && <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 9, fontWeight: 800, background: '#FEE8E0', color: '#D85A30', padding: '1px 5px', borderRadius: 100, marginLeft: 3 }}>-{remise}%</span>}
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 10, fontWeight: 800, background: '#EEF2FF', color: COULEUR_PROP, padding: '1px 7px', borderRadius: 100 }}>{raquette.scoreFinal}%</span>
            {raquette.precommande
              ? <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 9, fontWeight: 700, background: '#FEF5E0', color: '#9A6B00', padding: '1px 5px', borderRadius: 6, border: '1px solid #F6BC3E' }}>🔜 Préco.</span>
              : <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 9, fontWeight: 700, background: '#F0FAF4', color: '#1D9E75', padding: '1px 5px', borderRadius: 6 }}>✓ Stock</span>}
          </div>
        </div>
      </a>

      {/* Footer */}
      <div style={{ borderTop: '0.5px solid #EEF0F6', padding: '6px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => onVoirProfil(raquette)} style={{ fontFamily: 'Nunito, sans-serif', fontSize: 10, fontWeight: 700, color: COULEUR_PROP, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          📊 Voir le profil
        </button>
        <a href={raquette.url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'Nunito, sans-serif', fontSize: 10, fontWeight: 700, color: '#aaa', textDecoration: 'none' }}>
          Voir →
        </a>
      </div>
    </div>
  )
}

export default function ResultatsPage() {
  const [resultats, setResultats]   = useState([])
  const [quiz, setQuiz]             = useState(null)
  const [loading, setLoading]       = useState(true)
  const [erreur, setErreur]         = useState(null)
  const [visibles, setVisibles]     = useState(PAGE_SIZE)
  const [modalRaquette, setModalRaquette] = useState(null)
  const [email, setEmail]           = useState('')
  const [emailEnvoye, setEmailEnvoye] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem('quiz_data')
    if (!stored) { setErreur('Quiz introuvable'); setLoading(false); return }
    const quizData = JSON.parse(stored)
    setQuiz(quizData)
    fetch('/api/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quizData),
    })
      .then(r => r.json())
      .then(data => {
        if (data.resultats) setResultats(data.resultats)
        else setErreur(data.error || 'Erreur')
        setLoading(false)
      })
      .catch(() => { setErreur('Erreur réseau'); setLoading(false) })
  }, [])

  async function envoyerEmail() {
    if (!email || !quiz) return
    setEmailEnvoye(true)
    try {
      await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...quiz, email }),
      })
    } catch (e) {}
  }

  const budgetIllimite = quiz?.budget >= 99999

  return (
    <main style={{ minHeight: '100vh', background: 'var(--fond)' }}>
      {/* Header */}
      <header style={{ background: 'var(--blanc)', borderBottom: '1px solid var(--bordure)', padding: '14px 20px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'var(--font)', fontSize: 18, fontWeight: 900, color: 'var(--bleu)' }}>EL <span style={{ color: 'var(--jaune)' }}>SELECTOR</span></span>
          <a href="/" style={{ fontFamily: 'var(--font)', fontSize: 12, fontWeight: 700, color: 'var(--texte-muted)', textDecoration: 'none' }}>← Recommencer</a>
        </div>
      </header>

      <div className="container" style={{ paddingTop: 20, paddingBottom: 80 }}>
        {/* Résumé quiz */}
        {quiz && (
          <div style={{ background: 'var(--blanc)', border: '1px solid var(--bordure)', borderRadius: 12, padding: '12px 14px', marginBottom: 20 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font)', fontSize: 11, fontWeight: 700, color: 'var(--texte-muted)' }}>
                {quiz.genre} · {LABEL_NIVEAU[quiz.niveau] || quiz.niveau} · {budgetIllimite ? 'Budget illimité' : `${quiz.budget} €`}
              </span>
              {(Array.isArray(quiz.sensation) ? quiz.sensation : [quiz.sensation]).map(s => (
                <span key={s} style={{ fontFamily: 'var(--font)', fontSize: 11, fontWeight: 700, background: 'var(--bleu-light)', color: 'var(--bleu)', padding: '2px 8px', borderRadius: 100 }}>
                  {LABEL_SENSATION[s] || s}
                </span>
              ))}
              <a href="/" style={{ fontFamily: 'var(--font)', fontSize: 11, fontWeight: 700, color: 'var(--texte-muted)', textDecoration: 'none', marginLeft: 'auto' }}>Modifier ✏️</a>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div className="spinner" style={{ margin: '0 auto 16px' }} />
            <p style={{ fontFamily: 'var(--font)', fontWeight: 700, color: 'var(--texte-muted)', fontSize: 14 }}>Analyse de ton profil…</p>
          </div>
        ) : erreur ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ fontFamily: 'var(--font)', fontSize: 16, fontWeight: 800, color: '#D85A30', marginBottom: 16 }}>{erreur}</p>
            <a href="/" style={{ fontFamily: 'var(--font)', fontSize: 14, fontWeight: 800, color: '#fff', background: 'var(--bleu)', padding: '12px 24px', borderRadius: 12, textDecoration: 'none' }}>← Recommencer</a>
          </div>
        ) : resultats.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ fontFamily: 'var(--font)', fontSize: 16, fontWeight: 800, marginBottom: 16 }}>Aucune raquette ne correspond à ton profil.</p>
            <a href="/" style={{ fontFamily: 'var(--font)', fontSize: 14, fontWeight: 800, color: '#fff', background: 'var(--bleu)', padding: '12px 24px', borderRadius: 12, textDecoration: 'none' }}>← Modifier mes critères</a>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h1 style={{ fontFamily: 'var(--font)', fontSize: 18, fontWeight: 900, color: 'var(--texte)' }}>
                {budgetIllimite ? '🏆 Nos meilleures raquettes' : 'Tes raquettes idéales'}
              </h1>
              <span style={{ fontFamily: 'var(--font)', fontSize: 12, fontWeight: 700, color: 'var(--texte-muted)' }}>{resultats.length} résultats</span>
            </div>

            {/* Grille 2 colonnes */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              {resultats.slice(0, visibles).map((r, i) => (
                <RaquetteCard key={r.id} raquette={r} rank={i + 1} onVoirProfil={setModalRaquette} />
              ))}
            </div>

            {visibles < resultats.length && (
              <button onClick={() => setVisibles(v => Math.min(v + PAGE_SIZE, resultats.length))}
                style={{ width: '100%', padding: '12px', background: '#fff', border: `1.5px solid ${COULEUR_PROP}`, borderRadius: 12, fontFamily: 'Nunito, sans-serif', fontSize: 13, fontWeight: 800, color: COULEUR_PROP, cursor: 'pointer', marginBottom: 20 }}>
                Voir {Math.min(PAGE_SIZE, resultats.length - visibles)} raquette{Math.min(PAGE_SIZE, resultats.length - visibles) > 1 ? 's' : ''} de plus ↓
              </button>
            )}

            {/* Email après résultats */}
            {!emailEnvoye ? (
              <div style={{ background: '#fff', border: '1.5px solid #E8EAF0', borderRadius: 14, padding: '18px 16px', marginTop: 8, textAlign: 'center' }}>
                <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, fontWeight: 900, color: '#1A1A2E', marginBottom: 4 }}>📧 Reçois ton TOP 3 par email</p>
                <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, fontWeight: 600, color: '#888', marginBottom: 14 }}>Garde une trace de tes recommandations personnalisées</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="email" placeholder="ton@email.com" value={email} onChange={e => setEmail(e.target.value)}
                    style={{ flex: 1, padding: '10px 12px', background: '#F8F9FB', border: '1.5px solid #E8EAF0', borderRadius: 10, fontFamily: 'Nunito, sans-serif', fontSize: 13, fontWeight: 600, outline: 'none', color: '#1A1A2E' }} />
                  <button onClick={envoyerEmail} style={{ padding: '10px 14px', background: COULEUR_PROP, color: '#fff', border: 'none', borderRadius: 10, fontFamily: 'Nunito, sans-serif', fontSize: 12, fontWeight: 800, cursor: 'pointer', flexShrink: 0 }}>Envoyer →</button>
                </div>
                <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 10, color: '#aaa', marginTop: 8 }}>🔒 RGPD · Aucun spam</p>
              </div>
            ) : (
              <div style={{ background: '#F0FAF4', border: '1.5px solid #1D9E75', borderRadius: 14, padding: '14px', marginTop: 8, textAlign: 'center' }}>
                <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, fontWeight: 800, color: '#1D9E75' }}>✓ Recommandations envoyées !</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal profil */}
      {modalRaquette && <ModalProfil raquette={modalRaquette} onClose={() => setModalRaquette(null)} />}
    </main>
  )
}
