'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'

const DIMS = ['Puissance', 'Confort', 'Spin', 'Contrôle', 'Tolérance', 'Maniabilité']
const DIM_COLORS = {
  Puissance: '#2B4EE5', Confort: '#1D9E75', Spin: '#7F77DD',
  Contrôle: '#F6BC3E', Tolérance: '#D85A30', Maniabilité: '#D4537E',
}
const DIM_ICONS = {
  Puissance: '⚡', Confort: '🛡️', Spin: '🌀',
  Contrôle: '🎯', Tolérance: '💪', Maniabilité: '🏃',
}
const PAGE_SIZE = 4

function GaugeCircle({ dim, valeur, cible, size = 64 }) {
  const couleur = DIM_COLORS[dim]
  const r = (size / 2) - 6
  const circ = 2 * Math.PI * r
  const fillDash = (valeur / 100) * circ
  const cibleDash = (cible / 100) * circ
  const atteint = valeur >= cible
  const cx = size / 2
  const cy = size / 2
  return (
    <div style={{ textAlign: 'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#EEF0F6" strokeWidth={size >= 64 ? 8 : 6} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={couleur} strokeWidth={size >= 64 ? 8 : 6}
          strokeDasharray={`${fillDash} ${circ - fillDash}`}
          strokeDashoffset={circ / 4}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.4s ease' }} />
        {cible !== valeur && (
          <circle cx={cx} cy={cy} r={r} fill="none"
            stroke={atteint ? '#1D9E75' : '#D85A30'}
            strokeWidth={2}
            strokeDasharray={`2 ${circ - 2}`}
            strokeDashoffset={circ / 4 - cibleDash}
            strokeLinecap="round" />
        )}
        <text x={cx} y={cy + (size >= 64 ? 5 : 4)} textAnchor="middle"
          fontSize={size >= 64 ? 14 : 11} fontWeight="700"
          fill={atteint || cible === valeur ? couleur : '#1A1A2E'}
          fontFamily="Nunito, sans-serif">{valeur}</text>
      </svg>
      <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 10, fontWeight: 700, color: '#888', marginTop: 2 }}>{DIM_ICONS[dim]} {dim}</div>
      {cible !== valeur && (
        <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 9, fontWeight: 800, color: atteint ? '#1D9E75' : '#D85A30', marginTop: 1 }}>
          cible {cible} {atteint ? '✓' : '↑'}
        </div>
      )}
    </div>
  )
}

function RaquetteCard({ raquette, rank, raquetteActuelle, cibles }) {
  const [expanded, setExpanded] = useState(false)
  const isTop = rank === 1
  const hasPromo = raquette.compareAtPrice && raquette.compareAtPrice > raquette.price
  const remise = hasPromo ? Math.round((1 - raquette.price / raquette.compareAtPrice) * 100) : 0
  const dimsDisponibles = DIMS.filter(d => raquette.schema && raquette.schema[d] !== undefined)
  return (
    <div style={{ background: '#fff', border: `1.5px solid ${isTop ? '#2B4EE5' : '#E8EAF0'}`, borderRadius: 16, overflow: 'hidden', marginBottom: 14, boxShadow: isTop ? '0 4px 20px rgba(43,78,229,0.10)' : 'none' }}>
      {isTop && (
        <div style={{ background: '#2B4EE5', color: '#fff', padding: '6px 16px', fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', fontFamily: 'Nunito, sans-serif', display: 'flex', alignItems: 'center' }}>
          🚀 Meilleure évolution
          <span style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.2)', borderRadius: 100, padding: '2px 10px', fontSize: 12, fontWeight: 900 }}>{raquette.scoreFinal}% match</span>
        </div>
      )}
      <div style={{ display: 'flex', gap: 14, padding: '16px 16px 12px' }}>
        <div style={{ width: 88, height: 88, flexShrink: 0, background: '#F0F3FF', borderRadius: 12, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          {raquette.image ? <img src={raquette.image} alt={raquette.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span style={{ fontSize: 32 }}>🏏</span>}
          {!isTop && <div style={{ position: 'absolute', top: 4, left: 4, background: '#F8F9FB', border: '1px solid #E8EAF0', borderRadius: 8, padding: '2px 7px', fontSize: 10, fontWeight: 800, color: '#888', fontFamily: 'Nunito, sans-serif' }}>#{rank}</div>}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, fontWeight: 800, color: '#1A1A2E', lineHeight: 1.3, marginBottom: 6 }}>{raquette.title}</h3>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 22, fontWeight: 900, color: hasPromo ? '#D85A30' : '#2B4EE5' }}>{parseFloat(raquette.price).toFixed(2)} €</span>
            {hasPromo && <>
              <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, fontWeight: 700, color: '#aaa', textDecoration: 'line-through' }}>{parseFloat(raquette.compareAtPrice).toFixed(2)} €</span>
              <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, fontWeight: 800, background: '#FEE8E0', color: '#D85A30', padding: '2px 8px', borderRadius: 100 }}>-{remise}%</span>
            </>}
          </div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
            {!isTop && <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, fontWeight: 800, background: '#EEF2FF', color: '#2B4EE5', padding: '2px 9px', borderRadius: 100 }}>{raquette.scoreFinal}% match</span>}
            {raquette.precommande
              ? <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, fontWeight: 700, background: '#FEF5E0', color: '#9A6B00', padding: '2px 9px', borderRadius: 8, border: '1px solid #F6BC3E' }}>🔜 Précommande</span>
              : <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, fontWeight: 700, background: '#F0FAF4', color: '#1D9E75', padding: '2px 9px', borderRadius: 8 }}>✓ En stock</span>}
          </div>
          <a href={raquette.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: isTop ? '#2B4EE5' : 'transparent', color: isTop ? '#fff' : '#2B4EE5', border: isTop ? 'none' : '1.5px solid #2B4EE5', fontFamily: 'Nunito, sans-serif', fontSize: 13, fontWeight: 800, padding: '8px 14px', borderRadius: 10, textDecoration: 'none' }}>
            Voir la raquette →
          </a>
        </div>
      </div>
      {dimsDisponibles.length > 0 && <>
        <button onClick={() => setExpanded(e => !e)} style={{ width: '100%', background: 'none', border: 'none', borderTop: '1px solid #EEF0F6', padding: '9px 16px', fontFamily: 'Nunito, sans-serif', fontSize: 12, fontWeight: 700, color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          {expanded ? 'Masquer le profil' : 'Voir le profil technique'}
          <span style={{ display: 'inline-block', transition: 'transform .2s', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', fontSize: 10 }}>▼</span>
        </button>
        {expanded && (
          <div style={{ padding: '16px', borderTop: '1px solid #EEF0F6', background: '#FAFBFF' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, justifyItems: 'center' }}>
              {dimsDisponibles.map(d => (
                <GaugeCircle key={d} dim={d} valeur={raquette.schema[d]} cible={cibles?.[d] ?? raquette.schema[d]} size={70} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><div style={{ width: 10, height: 2, background: '#1D9E75', borderRadius: 1 }} /><span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 10, color: '#888' }}>Objectif atteint</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><div style={{ width: 10, height: 2, background: '#D85A30', borderRadius: 1 }} /><span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 10, color: '#888' }}>Objectif non atteint</span></div>
            </div>
          </div>
        )}
      </>}
    </div>
  )
}

function PanneauSliders({ cibles, raquetteActuelle, onChangeCible, ouvert, onToggle, loading }) {
  return (
    <>
      <button onClick={onToggle} style={{ position: 'fixed', right: 0, top: '50%', transform: 'translateY(-50%)', background: '#2B4EE5', color: '#fff', border: 'none', borderRadius: '12px 0 0 12px', padding: '14px 10px', cursor: 'pointer', zIndex: 200, fontFamily: 'Nunito, sans-serif', fontSize: 11, fontWeight: 800, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, boxShadow: '-2px 0 12px rgba(43,78,229,0.2)' }}>
        <span style={{ fontSize: 16 }}>{loading ? '⏳' : '🎚️'}</span>
        <span style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', transform: 'rotate(180deg)', letterSpacing: '0.05em' }}>{ouvert ? 'Fermer' : 'Ajuster'}</span>
      </button>
      <div style={{ position: 'fixed', right: ouvert ? 0 : '-320px', top: 0, bottom: 0, width: 300, background: '#fff', boxShadow: '-4px 0 24px rgba(0,0,0,0.10)', zIndex: 199, transition: 'right 0.3s ease', overflowY: 'auto', padding: '24px 16px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 15, fontWeight: 900, color: '#1A1A2E' }}>Ajuster mes critères</span>
          <button onClick={onToggle} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#888' }}>✕</button>
        </div>
        <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, fontWeight: 600, color: '#888', marginBottom: 16 }}>
          {loading ? '⏳ Recalcul...' : 'Les résultats se mettent à jour automatiquement'}
        </p>
        {raquetteActuelle && Object.keys(cibles).length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 20, padding: '12px', background: '#F8F9FB', borderRadius: 12 }}>
            {DIMS.map(d => (
              <GaugeCircle key={d} dim={d} valeur={raquetteActuelle?.schema?.[d] ?? 50} cible={cibles[d] ?? raquetteActuelle?.schema?.[d] ?? 50} size={52} />
            ))}
          </div>
        )}
        {DIMS.map(d => {
          const valeurActuelle = raquetteActuelle?.schema?.[d] ?? 50
          const valeurCible = cibles[d] ?? valeurActuelle
          const delta = valeurCible - valeurActuelle
          const couleur = DIM_COLORS[d]
          return (
            <div key={d} style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, fontWeight: 800, color: '#1A1A2E', display: 'flex', alignItems: 'center', gap: 5 }}>{DIM_ICONS[d]} {d}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {delta !== 0 && <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 10, fontWeight: 800, color: delta > 0 ? '#1D9E75' : '#D85A30', background: delta > 0 ? '#F0FAF4' : '#FEE8E0', padding: '1px 6px', borderRadius: 100 }}>{delta > 0 ? '+' : ''}{delta}</span>}
                  <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 16, fontWeight: 900, color: couleur }}>{valeurCible}</span>
                </div>
              </div>
              <div style={{ position: 'relative' }}>
                <input type="range" min={0} max={100} step={1} value={valeurCible} onChange={e => onChangeCible(d, parseInt(e.target.value))} style={{ width: '100%' }} />
                <div style={{ position: 'absolute', left: `calc(${valeurActuelle}% - 1px)`, top: 0, bottom: 0, width: 2, background: '#C8D3F9', borderRadius: 1, pointerEvents: 'none' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 9, fontWeight: 600, color: '#ccc' }}>Moins</span>
                <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 9, fontWeight: 600, color: '#aaa' }}>Actuel : {valeurActuelle}</span>
                <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 9, fontWeight: 600, color: '#ccc' }}>Plus</span>
              </div>
            </div>
          )
        })}
        <button onClick={() => DIMS.forEach(d => onChangeCible(d, raquetteActuelle?.schema?.[d] ?? 50))} style={{ width: '100%', padding: '10px', background: '#F8F9FB', border: '1.5px solid #E8EAF0', borderRadius: 10, fontFamily: 'Nunito, sans-serif', fontSize: 13, fontWeight: 700, color: '#888', cursor: 'pointer', marginTop: 4 }}>
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

  const appelAPI = useCallback(async (raquette, nouvelleCibles) => {
    if (!raquette) return
    setLoading(true)
    try {
      const res = await fetch('/api/upgrade-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raquetteActuelle: raquette, cibles: nouvelleCibles, email: null }),
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
    const initCibles = {}
    DIMS.forEach(d => { initCibles[d] = raquette.schema[d] ?? 50 })
    setCibles(initCibles)
    setEtape('resultats')
    sessionStorage.setItem('upgrade_raquette', JSON.stringify(raquette))
    sessionStorage.setItem('upgrade_cibles', JSON.stringify(initCibles))
    appelAPI(raquette, initCibles)
  }

  const handleChangeCible = useCallback((dim, valeur) => {
    setCibles(prev => {
      const newCibles = { ...prev, [dim]: valeur }
      sessionStorage.setItem('upgrade_cibles', JSON.stringify(newCibles))
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => { appelAPI(raquetteChoisie, newCibles) }, 600)
      return newCibles
    })
  }, [raquetteChoisie, appelAPI])

  async function envoyerEmail() {
    if (!email) return
    setEmailEnvoye(true)
    try {
      await fetch('/api/upgrade-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raquetteActuelle: raquetteChoisie, cibles, email }),
      })
    } catch (e) {}
  }

  if (etape === 'recherche') {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--fond)' }}>
        <header style={{ background: 'var(--blanc)', borderBottom: '1px solid var(--bordure)', padding: '14px 20px' }}>
          <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font)', fontSize: 18, fontWeight: 900, color: 'var(--bleu)' }}>EL <span style={{ color: 'var(--jaune)' }}>SELECTOR</span></span>
            <a href="/selector" style={{ fontFamily: 'var(--font)', fontSize: 12, fontWeight: 700, color: 'var(--texte-muted)', textDecoration: 'none' }}>← Nouveau joueur</a>
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
                <a href="/selector" style={{ fontFamily: 'var(--font)', fontSize: 13, fontWeight: 800, color: 'var(--blanc)', background: 'var(--bleu)', padding: '8px 16px', borderRadius: 10, textDecoration: 'none', display: 'inline-block' }}>Utiliser El Selector →</a>
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
      <div style={{ background: '#fff', borderBottom: '1px solid #E8EAF0', padding: '14px 20px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 18, fontWeight: 900, color: '#2B4EE5' }}>EL <span style={{ color: '#F6BC3E' }}>SELECTOR</span></span>
          <button onClick={() => setEtape('recherche')} style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, fontWeight: 700, color: '#888', background: 'none', border: 'none', cursor: 'pointer' }}>← Changer de raquette</button>
        </div>
      </div>
      <div style={{ background: '#EEF2FF', padding: '20px 20px 16px', borderBottom: '1px solid #D8E0FA' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'Nunito, sans-serif', fontSize: 'clamp(18px, 5vw, 24px)', fontWeight: 900, color: '#1A1A2E', marginBottom: 6 }}>Tes raquettes d'évolution 🚀</h1>
          {raquetteChoisie && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, fontWeight: 700, color: '#2B4EE5', opacity: 0.7 }}>Depuis :</span>
              <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, fontWeight: 800, color: '#2B4EE5', background: 'rgba(43,78,229,0.08)', padding: '2px 10px', borderRadius: 100 }}>{raquetteChoisie.title}</span>
            </div>
          )}
          <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, color: '#2B4EE5', fontWeight: 600, marginTop: 8, opacity: 0.7 }}>🎚️ Utilise le panneau latéral pour ajuster tes critères</p>
        </div>
      </div>
      <div className="container" style={{ paddingTop: 24, paddingRight: 52 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div className="spinner" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, color: '#888', fontSize: 13 }}>Calcul des meilleures évolutions…</p>
          </div>
        ) : resultats.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ fontSize: 18, fontWeight: 800, marginBottom: 12, fontFamily: 'Nunito, sans-serif' }}>Aucune raquette ne correspond.</p>
            <button onClick={() => setPanneauOuvert(true)} style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, fontWeight: 800, background: '#2B4EE5', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 20px', cursor: 'pointer' }}>🎚️ Ajuster mes critères</button>
          </div>
        ) : (
          <>
            <p style={{ color: '#888899', fontSize: 13, fontWeight: 700, marginBottom: 20, fontFamily: 'Nunito, sans-serif' }}>{resultats.length} raquette{resultats.length > 1 ? 's' : ''} trouvée{resultats.length > 1 ? 's' : ''}</p>
            {resultats.slice(0, visibles).map((r, i) => (
              <RaquetteCard key={r.id} raquette={r} rank={i + 1} raquetteActuelle={raquetteChoisie} cibles={cibles} />
            ))}
            {visibles < resultats.length && (
              <button onClick={() => setVisibles(v => Math.min(v + PAGE_SIZE, resultats.length))} style={{ width: '100%', padding: '14px', background: '#fff', border: '1.5px solid #2B4EE5', borderRadius: 12, fontFamily: 'Nunito, sans-serif', fontSize: 14, fontWeight: 800, color: '#2B4EE5', cursor: 'pointer', marginBottom: 20 }}>
                Voir {Math.min(PAGE_SIZE, resultats.length - visibles)} raquette{Math.min(PAGE_SIZE, resultats.length - visibles) > 1 ? 's' : ''} de plus ↓
              </button>
            )}
            {!emailEnvoye ? (
              <div style={{ background: '#fff', border: '1.5px solid #E8EAF0', borderRadius: 16, padding: '20px 16px', marginTop: 8, textAlign: 'center' }}>
                <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 15, fontWeight: 900, color: '#1A1A2E', marginBottom: 6 }}>📧 Reçois ton TOP 3 par email</p>
                <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, fontWeight: 600, color: '#888', marginBottom: 14 }}>Garde une trace de tes recommandations personnalisées</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input type="email" placeholder="ton@email.com" value={email} onChange={e => setEmail(e.target.value)}
                    style={{ flex: 1, padding: '12px', background: '#F8F9FB', border: '1.5px solid #E8EAF0', borderRadius: 10, fontFamily: 'Nunito, sans-serif', fontSize: 14, fontWeight: 600, outline: 'none', color: '#1A1A2E' }} />
                  <button onClick={envoyerEmail} style={{ padding: '12px 16px', background: '#2B4EE5', color: '#fff', border: 'none', borderRadius: 10, fontFamily: 'Nunito, sans-serif', fontSize: 13, fontWeight: 800, cursor: 'pointer', flexShrink: 0 }}>Envoyer →</button>
                </div>
                <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, color: '#aaa', marginTop: 8 }}>🔒 RGPD · Aucun spam</p>
              </div>
            ) : (
              <div style={{ background: '#F0FAF4', border: '1.5px solid #1D9E75', borderRadius: 16, padding: '16px', marginTop: 8, textAlign: 'center' }}>
                <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, fontWeight: 800, color: '#1D9E75' }}>✓ Recommandations envoyées !</p>
              </div>
            )}
          </>
        )}
      </div>
      <PanneauSliders cibles={cibles} raquetteActuelle={raquetteChoisie} onChangeCible={handleChangeCible} ouvert={panneauOuvert} onToggle={() => setPanneauOuvert(o => !o)} loading={loading} />
    </main>
  )
}
