'use client'
import { useState, useEffect, useCallback, useRef } from 'react'

const DIMS = ['Puissance', 'Confort', 'Spin', 'Contrôle', 'Tolérance', 'Maniabilité']
const DIM_ICONS = { Puissance: '⚡', Confort: '🛡️', Spin: '🌀', Contrôle: '🎯', Tolérance: '💪', Maniabilité: '🏃' }
const COULEUR_REF = '#D4537E'
const COULEUR_PROP = '#2B4EE5'
const PAGE_SIZE = 4

// Calcul des points du radar hexagonal (6 axes)
function hexPoints(valeurs, cx, cy, r) {
  return DIMS.map((d, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 2
    const v = (valeurs[d] ?? 0) / 100
    return [cx + r * v * Math.cos(angle), cy + r * v * Math.sin(angle)]
  }).map(([x, y]) => `${x},${y}`).join(' ')
}

function hexGridPoints(cx, cy, r) {
  return DIMS.map((_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 2
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)]
  })
}

function RadarComparaison({ schemaRef, schemaPropose, cibles }) {
  const cx = 90, cy = 90, r = 72
  const gridPts = hexGridPoints(cx, cy, r)
  const ptsRef = hexPoints(schemaRef, cx, cy, r)
  const ptsProp = hexPoints(schemaPropose, cx, cy, r)

  return (
    <svg width={180} height={180} viewBox="0 0 180 180" style={{ flexShrink: 0 }}>
      {[0.33, 0.66, 1].map(f => (
        <polygon key={f}
          points={gridPts.map(([x, y]) => `${cx + (x - cx) * f},${cy + (y - cy) * f}`).join(' ')}
          fill="none" stroke="var(--color-border-tertiary)" strokeWidth="0.8" />
      ))}
      {gridPts.map(([x, y], i) => (
        <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--color-border-tertiary)" strokeWidth="0.5" />
      ))}
      <polygon points={ptsRef} fill={COULEUR_REF + '18'} stroke={COULEUR_REF} strokeWidth="2" strokeDasharray="5,2.5" strokeLinejoin="round" />
      <polygon points={ptsProp} fill={COULEUR_PROP + '18'} stroke={COULEUR_PROP} strokeWidth="2" strokeLinejoin="round" />
      {gridPts.map(([x, y], i) => {
        const angle = (Math.PI / 3) * i - Math.PI / 2
        const lx = cx + (r + 14) * Math.cos(angle)
        const ly = cy + (r + 14) * Math.sin(angle)
        const anchor = lx < cx - 5 ? 'end' : lx > cx + 5 ? 'start' : 'middle'
        return (
          <text key={i} x={lx} y={ly + 3} textAnchor={anchor} fontSize="8" fill="var(--color-text-secondary)" fontFamily="Nunito, sans-serif">
            {DIMS[i]}
          </text>
        )
      })}
    </svg>
  )
}

function ComparaisonCard({ raquette, raquetteActuelle, cibles }) {
  const schemaRef = raquetteActuelle?.schema || {}
  const schemaPropose = raquette.schema || {}

  return (
    <div style={{ padding: '14px 0 4px' }}>
      {/* Score */}
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', fontFamily: 'Nunito, sans-serif' }}>Score de correspondance</div>
        <div style={{ fontSize: 26, fontWeight: 900, color: COULEUR_PROP, fontFamily: 'Nunito, sans-serif', lineHeight: 1.2 }}>{raquette.scoreFinal}%</div>
      </div>

      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <RadarComparaison schemaRef={schemaRef} schemaPropose={schemaPropose} cibles={cibles} />

        <div style={{ flex: 1, minWidth: 160 }}>
          {/* Légende */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--color-text-secondary)', fontFamily: 'Nunito, sans-serif' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: COULEUR_REF, opacity: 0.8 }} />
              Ta raquette
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--color-text-secondary)', fontFamily: 'Nunito, sans-serif' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: COULEUR_PROP }} />
              Proposée
            </div>
          </div>

          {/* Tableau comparatif */}
          {DIMS.filter(d => schemaPropose[d] !== undefined).map(d => {
            const valRef = schemaRef[d] ?? '–'
            const valProp = schemaPropose[d]
            const delta = typeof valRef === 'number' ? valProp - valRef : null
            const positif = delta !== null && delta >= 0
            return (
              <div key={d} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
                <span style={{ fontSize: 14, width: 20, textAlign: 'center', flexShrink: 0 }}>{DIM_ICONS[d]}</span>
                <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', width: 76, flexShrink: 0, fontFamily: 'Nunito, sans-serif' }}>{d}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: COULEUR_REF, width: 28, textAlign: 'right', fontFamily: 'Nunito, sans-serif' }}>{valRef}</span>
                  <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>→</span>
                  <span style={{ fontSize: 15, fontWeight: 800, color: COULEUR_PROP, width: 28, textAlign: 'right', fontFamily: 'Nunito, sans-serif' }}>{valProp}</span>
                  {delta !== null && (
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 10, minWidth: 36, textAlign: 'center', fontFamily: 'Nunito, sans-serif', background: positif ? '#EAF3DE' : '#FAECE7', color: positif ? '#3B6D11' : '#993C1D' }}>
                      {positif ? '+' : ''}{delta}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function RaquetteCard({ raquette, rank, raquetteActuelle, cibles }) {
  const [expanded, setExpanded] = useState(false)
  const isTop = rank === 1
  const hasPromo = raquette.compareAtPrice && raquette.compareAtPrice > raquette.price
  const remise = hasPromo ? Math.round((1 - raquette.price / raquette.compareAtPrice) * 100) : 0

  return (
    <div style={{ background: '#fff', border: `1.5px solid ${isTop ? COULEUR_PROP : '#E8EAF0'}`, borderRadius: 14, overflow: 'hidden', marginBottom: 10, boxShadow: isTop ? '0 4px 20px rgba(43,78,229,0.10)' : 'none' }}>
      {isTop && (
        <div style={{ background: COULEUR_PROP, color: '#fff', padding: '5px 14px', fontSize: 11, fontWeight: 800, letterSpacing: '0.05em', fontFamily: 'Nunito, sans-serif' }}>
          🚀 Meilleure évolution
        </div>
      )}

      {/* Tuile cliquable */}
      <a href={raquette.url} target="_blank" rel="noopener noreferrer"
        style={{ display: 'flex', gap: 12, padding: '12px 14px', textDecoration: 'none', cursor: 'pointer', transition: 'background .1s' }}
        onMouseEnter={e => e.currentTarget.style.background = '#F8F9FB'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

        <div style={{ width: 64, height: 64, flexShrink: 0, background: '#F0F3FF', borderRadius: 10, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          {raquette.image ? <img src={raquette.image} alt={raquette.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span style={{ fontSize: 28 }}>🏏</span>}
          {!isTop && <div style={{ position: 'absolute', top: 3, left: 3, background: '#F8F9FB', border: '1px solid #E8EAF0', borderRadius: 6, padding: '1px 5px', fontSize: 9, fontWeight: 800, color: '#888', fontFamily: 'Nunito, sans-serif' }}>#{rank}</div>}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, fontWeight: 800, color: '#1A1A2E', lineHeight: 1.3, marginBottom: 4 }}>{raquette.title}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 18, fontWeight: 900, color: hasPromo ? '#D85A30' : COULEUR_PROP }}>{parseFloat(raquette.price).toFixed(2)} €</span>
            {hasPromo && <>
              <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, fontWeight: 700, color: '#aaa', textDecoration: 'line-through' }}>{parseFloat(raquette.compareAtPrice).toFixed(2)} €</span>
              <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 10, fontWeight: 800, background: '#FEE8E0', color: '#D85A30', padding: '1px 6px', borderRadius: 100 }}>-{remise}%</span>
            </>}
          </div>
          <div style={{ display: 'flex', gap: 5, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, fontWeight: 800, background: '#EEF2FF', color: COULEUR_PROP, padding: '2px 8px', borderRadius: 100 }}>{raquette.scoreFinal}% match</span>
            {raquette.precommande
              ? <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 10, fontWeight: 700, background: '#FEF5E0', color: '#9A6B00', padding: '1px 7px', borderRadius: 7, border: '1px solid #F6BC3E' }}>🔜 Précommande</span>
              : <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 10, fontWeight: 700, background: '#F0FAF4', color: '#1D9E75', padding: '1px 7px', borderRadius: 7 }}>✓ En stock</span>}
            <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 10, fontWeight: 700, color: '#aaa', marginLeft: 'auto' }}>Voir →</span>
          </div>
        </div>
      </a>

      {/* Toggle comparaison */}
      <button onClick={() => setExpanded(e => !e)} style={{ width: '100%', background: 'none', border: 'none', borderTop: '0.5px solid #EEF0F6', padding: '8px 14px', fontFamily: 'Nunito, sans-serif', fontSize: 11, fontWeight: 700, color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
        {expanded ? 'Masquer la comparaison' : 'Voir la comparaison'}
        <span style={{ display: 'inline-block', transition: 'transform .2s', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', fontSize: 9 }}>▼</span>
      </button>

      {expanded && (
        <div style={{ padding: '0 14px 14px', borderTop: '0.5px solid #EEF0F6', background: '#FAFBFF' }}>
          <ComparaisonCard raquette={raquette} raquetteActuelle={raquetteActuelle} cibles={cibles} />
        </div>
      )}
    </div>
  )
}

function RaquetteReference({ raquette }) {
  if (!raquette) return null
  const hasPromo = raquette.compareAtPrice && raquette.compareAtPrice > raquette.price
  const prixRef = hasPromo ? raquette.compareAtPrice : raquette.price

  return (
    <div style={{ background: '#fff', border: `1.5px solid #E8EAF0`, borderRadius: 14, overflow: 'hidden', marginBottom: 20 }}>
      <div style={{ background: '#F8F9FB', padding: '6px 14px', fontSize: 10, fontWeight: 800, letterSpacing: '0.05em', color: '#888', fontFamily: 'Nunito, sans-serif' }}>
        TA RAQUETTE ACTUELLE
      </div>
      <div style={{ display: 'flex', gap: 12, padding: '12px 14px' }}>
        <div style={{ width: 64, height: 64, flexShrink: 0, background: '#F0F3FF', borderRadius: 10, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {raquette.image ? <img src={raquette.image} alt={raquette.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span style={{ fontSize: 28 }}>🏏</span>}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, fontWeight: 800, color: '#1A1A2E', marginBottom: 4 }}>{raquette.title}</div>
          <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 16, fontWeight: 900, color: COULEUR_REF, marginBottom: 6 }}>{parseFloat(prixRef).toFixed(2)} €</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px' }}>
            {Object.entries(raquette.schema || {}).map(([k, v]) => (
              <span key={k} style={{ fontFamily: 'Nunito, sans-serif', fontSize: 10, fontWeight: 700, color: COULEUR_REF }}>
                {DIM_ICONS[k]} {k} <strong>{v}</strong>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function PanneauSliders({ cibles, ciblesInitiales, raquetteActuelle, onChangeCible, ouvert, onToggle, loading }) {
  return (
    <>
      <button onClick={onToggle} style={{ position: 'fixed', right: 0, top: '50%', transform: 'translateY(-50%)', background: COULEUR_PROP, color: '#fff', border: 'none', borderRadius: '12px 0 0 12px', padding: '14px 10px', cursor: 'pointer', zIndex: 200, fontFamily: 'Nunito, sans-serif', fontSize: 11, fontWeight: 800, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, boxShadow: '-2px 0 12px rgba(43,78,229,0.2)' }}>
        <span style={{ fontSize: 16 }}>{loading ? '⏳' : '🎚️'}</span>
        <span style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', transform: 'rotate(180deg)', letterSpacing: '0.05em' }}>{ouvert ? 'Fermer' : 'Ajuster'}</span>
      </button>
      <div style={{ position: 'fixed', right: ouvert ? 0 : '-320px', top: 0, bottom: 0, width: 300, background: '#fff', boxShadow: '-4px 0 24px rgba(0,0,0,0.10)', zIndex: 199, transition: 'right 0.3s ease', overflowY: 'auto', padding: '24px 16px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 15, fontWeight: 900, color: '#1A1A2E' }}>Ajuster mes critères</span>
          <button onClick={onToggle} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#888' }}>✕</button>
        </div>
        <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, fontWeight: 600, color: '#888', marginBottom: 20 }}>
          {loading ? '⏳ Recalcul...' : 'Résultats mis à jour automatiquement'}
        </p>
        {DIMS.map(d => {
          const valeurActuelle = raquetteActuelle?.schema?.[d] ?? 50
          const valeurCible = cibles[d] ?? valeurActuelle
          const delta = valeurCible - valeurActuelle
          return (
            <div key={d} style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, fontWeight: 800, color: '#1A1A2E' }}>{DIM_ICONS[d]} {d}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {delta !== 0 && <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 10, fontWeight: 800, color: delta > 0 ? '#3B6D11' : '#993C1D', background: delta > 0 ? '#EAF3DE' : '#FAECE7', padding: '1px 6px', borderRadius: 100 }}>{delta > 0 ? '+' : ''}{delta}</span>}
                  <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 15, fontWeight: 900, color: COULEUR_PROP }}>{valeurCible}</span>
                </div>
              </div>
              <div style={{ position: 'relative' }}>
                <input type="range" min={0} max={100} step={1} value={valeurCible} onChange={e => onChangeCible(d, parseInt(e.target.value))} style={{ width: '100%' }} />
                <div style={{ position: 'absolute', left: `calc(${valeurActuelle}% - 1px)`, top: 0, bottom: 0, width: 2, background: '#C8D3F9', borderRadius: 1, pointerEvents: 'none' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 9, color: '#ccc' }}>Moins</span>
                <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 9, color: '#aaa' }}>Actuel : {valeurActuelle}</span>
                <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 9, color: '#ccc' }}>Plus</span>
              </div>
            </div>
          )
        })}
        <button onClick={() => DIMS.forEach(d => onChangeCible(d, raquetteActuelle?.schema?.[d] ?? 50))}
          style={{ width: '100%', padding: '10px', background: '#F8F9FB', border: '1.5px solid #E8EAF0', borderRadius: 10, fontFamily: 'Nunito, sans-serif', fontSize: 13, fontWeight: 700, color: '#888', cursor: 'pointer' }}>
          Réinitialiser
        </button>
      </div>
      {ouvert && <div onClick={onToggle} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.15)', zIndex: 198, cursor: 'pointer' }} />}
    </>
  )
}

export default function UpgradePage() {
  const [etape, setEtape] = useState('recherche')
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [catalogue, setCatalogue] = useState([])
  const [raquetteChoisie, setRaquetteChoisie] = useState(null)
  const [cibles, setCibles] = useState({})
  const [ciblesInitiales, setCiblesInitiales] = useState({})
  const [resultats, setResultats] = useState([])
  const [visibles, setVisibles] = useState(PAGE_SIZE)
  const [panneauOuvert, setPanneauOuvert] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingCatalogue, setLoadingCatalogue] = useState(true)
  const [email, setEmail] = useState('')
  const [emailEnvoye, setEmailEnvoye] = useState(false)
  const debounceRef = useRef(null)

  useEffect(() => {
    fetch('/api/catalogue').then(r => r.json()).then(data => { setCatalogue(data.raquettes || []); setLoadingCatalogue(false) }).catch(() => setLoadingCatalogue(false))
  }, [])

  useEffect(() => {
    if (!query.trim() || query.length < 2) { setSuggestions([]); return }
    const q = query.toLowerCase()
    setSuggestions(catalogue.filter(r => r.title.toLowerCase().includes(q)).slice(0, 6))
  }, [query, catalogue])

  const appelAPI = useCallback(async (raquette, nouvellesCibles, initiales) => {
    if (!raquette) return
    setLoading(true)
    try {
      const res = await fetch('/api/upgrade-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raquetteActuelle: raquette, cibles: nouvellesCibles, ciblesInitiales: initiales || nouvellesCibles, email: null }),
      })
      const data = await res.json()
      if (res.ok && data.resultats) { setResultats(data.resultats); setVisibles(PAGE_SIZE) }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [])

  function choisirRaquette(raquette) {
    setRaquetteChoisie(raquette)
    setQuery(raquette.title)
    setSuggestions([])
    const init = {}
    DIMS.forEach(d => { init[d] = raquette.schema?.[d] ?? 50 })
    setCibles(init)
    setCiblesInitiales(init)
    setEtape('resultats')
    appelAPI(raquette, init, init)
  }

  const handleChangeCible = useCallback((dim, valeur) => {
    setCibles(prev => {
      const newCibles = { ...prev, [dim]: valeur }
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => { appelAPI(raquetteChoisie, newCibles, ciblesInitiales) }, 600)
      return newCibles
    })
  }, [raquetteChoisie, ciblesInitiales, appelAPI])

  async function envoyerEmail() {
    if (!email) return
    setEmailEnvoye(true)
    try {
      await fetch('/api/upgrade-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raquetteActuelle: raquetteChoisie, cibles, ciblesInitiales, email }),
      })
    } catch (e) {}
  }

  if (etape === 'recherche') {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--fond)' }}>
        <header style={{ background: 'var(--blanc)', borderBottom: '1px solid var(--bordure)', padding: '14px 20px' }}>
          <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font)', fontSize: 18, fontWeight: 900, color: 'var(--bleu)' }}>EL <span style={{ color: 'var(--jaune)' }}>SELECTOR</span></span>
            <a href="/" style={{ fontFamily: 'var(--font)', fontSize: 12, fontWeight: 700, color: 'var(--texte-muted)', textDecoration: 'none' }}>← Nouveau joueur</a>
          </div>
        </header>
        <div style={{ background: 'var(--blanc)', padding: '8px 20px 12px', borderBottom: '1px solid var(--bordure)' }}>
          <div style={{ maxWidth: 680, margin: '0 auto' }}>
            <div className="progress-bar"><div className="progress-fill" style={{ width: '33%' }} /></div>
            <span style={{ fontSize: 12, color: 'var(--texte-muted)', fontWeight: 700, marginTop: 6, display: 'block' }}>1 / 2</span>
          </div>
        </div>
        <div className="container fade-up" style={{ flex: 1, paddingTop: 40, paddingBottom: 32 }}>
          <h1 style={{ fontFamily: 'var(--font)', fontSize: 'clamp(22px, 5vw, 30px)', fontWeight: 900, color: 'var(--texte)', textAlign: 'center', marginBottom: 8 }}>Quelle est ta raquette actuelle ?</h1>
          <p style={{ color: 'var(--texte-muted)', fontSize: 14, fontWeight: 600, textAlign: 'center', marginBottom: 32 }}>Tape le nom pour la trouver dans notre catalogue</p>
          <div style={{ position: 'relative' }}>
            <input type="text" placeholder="Ex: Bullpadel Hack 04..." value={query} onChange={e => setQuery(e.target.value)} autoFocus
              style={{ width: '100%', padding: '16px 16px 16px 44px', background: 'var(--blanc)', border: '2px solid var(--bordure)', borderRadius: 14, color: 'var(--texte)', fontFamily: 'var(--font)', fontSize: 15, fontWeight: 600, outline: 'none' }}
              onFocus={e => e.target.style.borderColor = 'var(--bleu)'}
              onBlur={e => e.target.style.borderColor = 'var(--bordure)'} />
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 18, pointerEvents: 'none' }}>🔍</span>
            {suggestions.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, background: 'var(--blanc)', border: '1.5px solid var(--bordure)', borderRadius: 14, marginTop: 6, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
                {suggestions.map(r => (
                  <button key={r.id} onClick={() => choisirRaquette(r)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'none', border: 'none', borderBottom: '1px solid var(--bordure)', cursor: 'pointer', textAlign: 'left' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bleu-light)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                    {r.image && <img src={r.image} alt={r.title} style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 8, background: '#F0F3FF', flexShrink: 0 }} />}
                    <div>
                      <div style={{ fontFamily: 'var(--font)', fontSize: 13, fontWeight: 800, color: 'var(--texte)' }}>{r.title}</div>
                      <div style={{ fontFamily: 'var(--font)', fontSize: 11, fontWeight: 600, color: 'var(--texte-muted)' }}>{parseFloat(r.price).toFixed(2)} € · {r.genre}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {query.length >= 2 && suggestions.length === 0 && !loadingCatalogue && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, background: 'var(--blanc)', border: '1.5px solid var(--bordure)', borderRadius: 14, marginTop: 6, padding: '20px 16px', textAlign: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
                <p style={{ fontFamily: 'var(--font)', fontSize: 13, fontWeight: 700, color: 'var(--texte-muted)', marginBottom: 12 }}>Raquette introuvable dans notre catalogue</p>
                <a href="/" style={{ fontFamily: 'var(--font)', fontSize: 13, fontWeight: 800, color: 'var(--blanc)', background: 'var(--bleu)', padding: '8px 16px', borderRadius: 10, textDecoration: 'none', display: 'inline-block' }}>Utiliser El Selector →</a>
              </div>
            )}
          </div>
          {loadingCatalogue && <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--texte-muted)', fontFamily: 'var(--font)', fontWeight: 600, fontSize: 13 }}>Chargement du catalogue…</p>}
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', background: '#F8F9FB', paddingBottom: 80 }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #E8EAF0', padding: '14px 20px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 18, fontWeight: 900, color: COULEUR_PROP }}>EL <span style={{ color: '#F6BC3E' }}>SELECTOR</span></span>
          <button onClick={() => setEtape('recherche')} style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, fontWeight: 700, color: '#888', background: 'none', border: 'none', cursor: 'pointer' }}>← Changer de raquette</button>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 20, paddingRight: 52 }}>
        {/* Raquette initiale fixe */}
        <RaquetteReference raquette={raquetteChoisie} />

        <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, color: '#888', fontWeight: 600, marginBottom: 16 }}>
          🎚️ Panneau latéral pour ajuster tes critères — les résultats se mettent à jour automatiquement
        </p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div className="spinner" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, color: '#888', fontSize: 13 }}>Calcul en cours…</p>
          </div>
        ) : resultats.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p style={{ fontSize: 16, fontWeight: 800, marginBottom: 12, fontFamily: 'Nunito, sans-serif' }}>Aucune raquette ne correspond.</p>
            <button onClick={() => setPanneauOuvert(true)} style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, fontWeight: 800, background: COULEUR_PROP, color: '#fff', border: 'none', borderRadius: 10, padding: '10px 18px', cursor: 'pointer' }}>🎚️ Ajuster mes critères</button>
          </div>
        ) : (
          <>
            <p style={{ color: '#888899', fontSize: 12, fontWeight: 700, marginBottom: 14, fontFamily: 'Nunito, sans-serif' }}>{resultats.length} raquette{resultats.length > 1 ? 's' : ''} trouvée{resultats.length > 1 ? 's' : ''}</p>

            {resultats.slice(0, visibles).map((r, i) => (
              <RaquetteCard key={r.id} raquette={r} rank={i + 1} raquetteActuelle={raquetteChoisie} cibles={cibles} />
            ))}

            {visibles < resultats.length && (
              <button onClick={() => setVisibles(v => Math.min(v + PAGE_SIZE, resultats.length))}
                style={{ width: '100%', padding: '12px', background: '#fff', border: `1.5px solid ${COULEUR_PROP}`, borderRadius: 12, fontFamily: 'Nunito, sans-serif', fontSize: 13, fontWeight: 800, color: COULEUR_PROP, cursor: 'pointer', marginBottom: 16 }}>
                Voir {Math.min(PAGE_SIZE, resultats.length - visibles)} raquette{Math.min(PAGE_SIZE, resultats.length - visibles) > 1 ? 's' : ''} de plus ↓
              </button>
            )}

            {/* Email après résultats */}
            {!emailEnvoye ? (
              <div style={{ background: '#fff', border: '1.5px solid #E8EAF0', borderRadius: 14, padding: '18px 16px', marginTop: 6, textAlign: 'center' }}>
                <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, fontWeight: 900, color: '#1A1A2E', marginBottom: 4 }}>📧 Reçois ton TOP 3 par email</p>
                <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, fontWeight: 600, color: '#888', marginBottom: 12 }}>Garde une trace de tes recommandations</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="email" placeholder="ton@email.com" value={email} onChange={e => setEmail(e.target.value)}
                    style={{ flex: 1, padding: '10px 12px', background: '#F8F9FB', border: '1.5px solid #E8EAF0', borderRadius: 10, fontFamily: 'Nunito, sans-serif', fontSize: 13, fontWeight: 600, outline: 'none', color: '#1A1A2E' }} />
                  <button onClick={envoyerEmail} style={{ padding: '10px 14px', background: COULEUR_PROP, color: '#fff', border: 'none', borderRadius: 10, fontFamily: 'Nunito, sans-serif', fontSize: 12, fontWeight: 800, cursor: 'pointer', flexShrink: 0 }}>Envoyer →</button>
                </div>
                <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 10, color: '#aaa', marginTop: 6 }}>🔒 RGPD · Aucun spam</p>
              </div>
            ) : (
              <div style={{ background: '#F0FAF4', border: '1.5px solid #1D9E75', borderRadius: 14, padding: '14px', marginTop: 6, textAlign: 'center' }}>
                <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, fontWeight: 800, color: '#1D9E75' }}>✓ Recommandations envoyées !</p>
              </div>
            )}
          </>
        )}
      </div>

      <PanneauSliders cibles={cibles} ciblesInitiales={ciblesInitiales} raquetteActuelle={raquetteChoisie} onChangeCible={handleChangeCible} ouvert={panneauOuvert} onToggle={() => setPanneauOuvert(o => !o)} loading={loading} />
    </main>
  )
}
