'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

const DIMS = ['Puissance', 'Confort', 'Spin', 'Contrôle', 'Tolérance', 'Maniabilité']
const DIM_COLORS = {
  Puissance: '#2B4EE5', Confort: '#1D9E75', Spin: '#7F77DD',
  Contrôle: '#F6BC3E', Tolérance: '#D85A30', Maniabilité: '#D4537E',
}
const LABEL_SENSATION = {
  puissance: '⚡ Puissance', maniabilite: '🏃 Maniabilité',
  controle: '🎯 Contrôle', confort: '🛡️ Confort', spin: '🌀 Spin',
}
const LABEL_NIVEAU = {
  debutant: 'Débutant', intermediaire: 'Intermédiaire',
  avance: 'Avancé', competition: 'Compétition',
}
// Mapping tag → index d'étape dans le quiz (pour navigation retour)
const TAG_TO_ETAPE = {
  genre: 0,
  niveau: 1,
  budget: 2,
  sensation: 3,
}

const PAGE_SIZE = 4

function ScoreBar({ label, value, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
      <div style={{ flex: 1, height: 5, background: '#EEF0F6', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.4s ease' }} />
      </div>
      <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, fontWeight: 800, color: '#1A1A2E', width: 22, textAlign: 'right', flexShrink: 0 }}>
        {value}
      </span>
    </div>
  )
}

function RaquetteCard({ raquette, rank }) {
  const [expanded, setExpanded] = useState(false)
  const isTop = rank === 1
  const hasPromo = raquette.compareAtPrice && raquette.compareAtPrice > raquette.price
  const remise = hasPromo ? Math.round((1 - raquette.price / raquette.compareAtPrice) * 100) : 0

  return (
    <div style={{
      background: '#fff',
      border: `1.5px solid ${isTop ? '#2B4EE5' : '#E8EAF0'}`,
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 14,
      boxShadow: isTop ? '0 4px 20px rgba(43,78,229,0.10)' : 'none',
    }}>

      {/* Badge top */}
      {isTop && (
        <div style={{ background: '#2B4EE5', color: '#fff', padding: '6px 16px', fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', fontFamily: 'Nunito, sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}>
          ⭐ Notre recommandation
          <span style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.2)', borderRadius: 100, padding: '2px 10px', fontSize: 12, fontWeight: 900 }}>
            {raquette.scoreFinal}% match
          </span>
        </div>
      )}

      {/* Corps principal */}
      <div style={{ display: 'flex', gap: 14, padding: '16px 16px 12px' }}>

        {/* Image */}
        <div style={{ width: 88, height: 88, flexShrink: 0, background: '#F0F3FF', borderRadius: 12, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          {raquette.image
            ? <img src={raquette.image} alt={raquette.imageAlt} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            : <span style={{ fontSize: 32 }}>🏏</span>}
          {!isTop && (
            <div style={{ position: 'absolute', top: 4, left: 4, background: '#F8F9FB', border: '1px solid #E8EAF0', borderRadius: 8, padding: '2px 7px', fontSize: 10, fontWeight: 800, color: '#888', fontFamily: 'Nunito, sans-serif' }}>
              #{rank}
            </div>
          )}
        </div>

        {/* Infos */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, fontWeight: 800, color: '#1A1A2E', lineHeight: 1.3, marginBottom: 6 }}>
            {raquette.title}
          </h3>

          {/* Prix */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 22, fontWeight: 900, color: hasPromo ? '#D85A30' : '#2B4EE5' }}>
              {parseFloat(raquette.price).toFixed(2)} €
            </span>
            {hasPromo && (
              <>
                <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, fontWeight: 700, color: '#aaa', textDecoration: 'line-through' }}>
                  {parseFloat(raquette.compareAtPrice).toFixed(2)} €
                </span>
                <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, fontWeight: 800, background: '#FEE8E0', color: '#D85A30', padding: '2px 8px', borderRadius: 100 }}>
                  -{remise}%
                </span>
              </>
            )}
          </div>

          {/* Tags */}
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
            {!isTop && (
              <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, fontWeight: 800, background: '#EEF2FF', color: '#2B4EE5', padding: '2px 9px', borderRadius: 100 }}>
                {raquette.scoreFinal}% match
              </span>
            )}
            <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, fontWeight: 700, background: '#F0F3FF', color: '#2B4EE5', padding: '2px 9px', borderRadius: 8 }}>
              {raquette.genre}
            </span>
            {raquette.poids && (
              <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, fontWeight: 700, background: '#F8F9FB', color: '#888', padding: '2px 9px', borderRadius: 8, border: '1px solid #E8EAF0' }}>
                {raquette.poids}
              </span>
            )}
            {raquette.precommande ? (
              <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, fontWeight: 700, background: '#FEF5E0', color: '#9A6B00', padding: '2px 9px', borderRadius: 8, border: '1px solid #F6BC3E' }}>
                🔜 Précommande
              </span>
            ) : (
              <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, fontWeight: 700, background: '#F0FAF4', color: '#1D9E75', padding: '2px 9px', borderRadius: 8 }}>
                ✓ En stock
              </span>
            )}
          </div>

          <a href={raquette.url} target="_blank" rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: isTop ? '#2B4EE5' : 'transparent',
              color: isTop ? '#fff' : '#2B4EE5',
              border: isTop ? 'none' : '1.5px solid #2B4EE5',
              fontFamily: 'Nunito, sans-serif', fontSize: 13, fontWeight: 800,
              padding: '8px 14px', borderRadius: 10, textDecoration: 'none',
            }}>
            Voir la raquette →
          </a>
        </div>
      </div>

      {/* Toggle caractéristiques */}
      {Object.keys(raquette.schema).length > 0 && (
        <>
          <button
            onClick={() => setExpanded(e => !e)}
            style={{
              width: '100%', background: 'none', border: 'none',
              borderTop: '1px solid #EEF0F6', padding: '9px 16px',
              fontFamily: 'Nunito, sans-serif', fontSize: 12, fontWeight: 700,
              color: '#888', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
            {expanded ? 'Masquer le profil' : 'Voir le profil technique'}
            <span style={{ display: 'inline-block', transition: 'transform .2s', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', fontSize: 10 }}>▼</span>
          </button>

          {expanded && (
            <div style={{ padding: '12px 16px 14px', borderTop: '1px solid #EEF0F6', background: '#FAFBFF' }}>
              {DIMS.filter(d => raquette.schema[d] !== undefined).map(d => (
                <ScoreBar key={d} label={d} value={raquette.schema[d]} color={DIM_COLORS[d]} />
              ))}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                {DIMS.filter(d => raquette.schema[d] !== undefined).map(d => (
                  <span key={d} style={{ fontFamily: 'Nunito, sans-serif', fontSize: 10, fontWeight: 700, color: DIM_COLORS[d], background: DIM_COLORS[d] + '18', padding: '2px 8px', borderRadius: 100 }}>
                    {d} {raquette.schema[d]}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function TagModifiable({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      title="Modifier ce critère"
      style={{
        fontFamily: 'Nunito, sans-serif', fontSize: 12, fontWeight: 700,
        padding: '5px 12px', borderRadius: 100,
        background: '#fff', color: '#2B4EE5',
        border: '1.5px solid #C8D3F9',
        cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5,
        transition: 'all .15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = '#EEF2FF'; e.currentTarget.style.borderColor = '#2B4EE5' }}
      onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#C8D3F9' }}
    >
      {label}
      <span style={{ fontSize: 10, opacity: 0.6 }}>✎</span>
    </button>
  )
}

export default function ResultatsPage() {
  const router = useRouter()
  const [resultats, setResultats] = useState(null)
  const [quiz, setQuiz] = useState(null)
  const [visibles, setVisibles] = useState(PAGE_SIZE)

  useEffect(() => {
    const r = sessionStorage.getItem('selector_resultats')
    const q = sessionStorage.getItem('selector_quiz')
    if (r) setResultats(JSON.parse(r))
    if (q) setQuiz(JSON.parse(q))
  }, [])

  const retourEtape = useCallback((etapeIndex) => {
    sessionStorage.setItem('selector_retour_etape', String(etapeIndex))
    router.push('/')
  }, [router])

  if (!resultats) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8F9FB' }}>
        <div className="spinner" />
      </main>
    )
  }

  const sensations = Array.isArray(quiz?.sensation) ? quiz.sensation : (quiz?.sensation ? [quiz.sensation] : [])
  const raquettesVisibles = resultats.slice(0, visibles)
  const peutVoirPlus = visibles < resultats.length

  return (
    <main style={{ minHeight: '100vh', background: '#F8F9FB', paddingBottom: 60 }}>

      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E8EAF0', padding: '14px 20px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 18, fontWeight: 900, color: '#2B4EE5' }}>
            EL <span style={{ color: '#F6BC3E' }}>SELECTOR</span>
          </span>
        </div>
      </div>

      {/* Hero + tags modifiables */}
      <div style={{ background: '#EEF2FF', padding: '24px 20px 20px', borderBottom: '1px solid #D8E0FA' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'Nunito, sans-serif', fontSize: 'clamp(20px, 5vw, 28px)', fontWeight: 900, color: '#1A1A2E', marginBottom: 6 }}>
            Tes raquettes idéales 🏏
          </h1>
          <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, color: '#2B4EE5', fontWeight: 700, marginBottom: 14, opacity: 0.8 }}>
            Clique sur un critère pour le modifier
          </p>
          {quiz && (
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
              {quiz.genre && (
                <TagModifiable
                  label={quiz.genre}
                  onClick={() => retourEtape(TAG_TO_ETAPE.genre)}
                />
              )}
              {quiz.niveau && (
                <TagModifiable
                  label={LABEL_NIVEAU[quiz.niveau] || quiz.niveau}
                  onClick={() => retourEtape(TAG_TO_ETAPE.niveau)}
                />
              )}
              <TagModifiable
                label={`${quiz.budget} € max`}
                onClick={() => retourEtape(TAG_TO_ETAPE.budget)}
              />
              {sensations.map((s, i) => (
                <TagModifiable
                  key={s}
                  label={`${i + 1}. ${LABEL_SENSATION[s] || s}`}
                  onClick={() => retourEtape(TAG_TO_ETAPE.sensation)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Résultats */}
      <div className="container" style={{ paddingTop: 24 }}>
        {resultats.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ fontSize: 18, fontWeight: 800, marginBottom: 12, fontFamily: 'Nunito, sans-serif' }}>
              Aucune raquette ne correspond à tes critères.
            </p>
            <p style={{ color: '#888899', marginBottom: 32, fontFamily: 'Nunito, sans-serif', fontWeight: 600 }}>
              Essaie d'augmenter ton budget ou de modifier tes sensations.
            </p>
            <button onClick={() => retourEtape(2)} className="btn btn-primary" style={{ width: 'auto', display: 'inline-flex', marginBottom: 12 }}>
              Augmenter mon budget
            </button>
            <br />
            <button onClick={() => retourEtape(0)} className="btn btn-secondary" style={{ display: 'inline-flex' }}>
              ← Refaire le quiz
            </button>
          </div>
        ) : (
          <>
            <p style={{ color: '#888899', fontSize: 13, fontWeight: 700, marginBottom: 20, fontFamily: 'Nunito, sans-serif' }}>
              {resultats.length} raquette{resultats.length > 1 ? 's' : ''} sélectionnée{resultats.length > 1 ? 's' : ''} pour toi
            </p>

            {raquettesVisibles.map((r, i) => (
              <RaquetteCard key={r.id} raquette={r} rank={i + 1} />
            ))}

            {peutVoirPlus && (
              <button
                onClick={() => setVisibles(v => Math.min(v + PAGE_SIZE, resultats.length))}
                style={{
                  width: '100%', padding: '14px', background: '#fff',
                  border: '1.5px solid #2B4EE5', borderRadius: 12,
                  fontFamily: 'Nunito, sans-serif', fontSize: 14, fontWeight: 800,
                  color: '#2B4EE5', cursor: 'pointer', marginTop: 4, marginBottom: 20,
                  transition: 'all .15s',
                }}>
                Voir {Math.min(PAGE_SIZE, resultats.length - visibles)} raquette{Math.min(PAGE_SIZE, resultats.length - visibles) > 1 ? 's' : ''} de plus ↓
              </button>
            )}

            <div style={{ textAlign: 'center', marginTop: 16, paddingTop: 16, borderTop: '1px solid #E8EAF0' }}>
              <button onClick={() => retourEtape(0)} className="btn btn-secondary" style={{ display: 'inline-flex', width: 'auto' }}>
                ← Refaire le quiz
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
