'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
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

function ComparaisonBar({ dim, valeurActuelle, valeurCible, valeurRaquette }) {
  const couleur = DIM_COLORS[dim]
  const atteint = valeurRaquette >= valeurCible
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
        <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, fontWeight: 700, color: '#555', display: 'flex', alignItems: 'center', gap: 4 }}>
          {DIM_ICONS[dim]} {dim}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 10, color: '#aaa', fontWeight: 600 }}>
            {valeurActuelle} → cible {valeurCible}
          </span>
          <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, fontWeight: 900, color: atteint ? '#1D9E75' : '#D85A30' }}>
            {valeurRaquette}<span style={{ fontSize: 9, marginLeft: 2 }}>{atteint ? '✓' : '↑'}</span>
          </span>
        </div>
      </div>
      <div style={{ position: 'relative', height: 6, background: '#EEF0F6', borderRadius: 3 }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${valeurActuelle}%`, background: '#D8DCF0', borderRadius: 3 }} />
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${valeurRaquette}%`, background: couleur, borderRadius: 3, opacity: 0.85, transition: 'width 0.3s ease' }} />
        <div style={{ position: 'absolute', left: `calc(${valeurCible}% - 1px)`, top: -2, bottom: -2, width: 2.5, background: atteint ? '#1D9E75' : '#D85A30', borderRadius: 2, zIndex: 2 }} />
      </div>
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
          <span style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.2)', borderRadius: 100, padding: '2px 10px', fontSize: 12, fontWeight: 900 }}>
            {raquette.scoreFinal}% match
          </span>
        </div>
      )}
      <div style={{ display: 'flex', gap: 14, padding: '16px 16px 12px' }}>
        <div style={{ width: 88, height: 88, flexShrink: 0, background: '#F0F3FF', borderRadius: 12, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          {raquette.image ? <img src={raquette.image} alt={raquette.imageAlt || raquette.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span style={{ fontSize: 32 }}>🏏</span>}
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
            {raquette.precommande ? <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, fontWeight: 700, background: '#FEF5E0', color: '#9A6B00', padding: '2px 9px', borderRadius: 8, border: '1px solid #F6BC3E' }}>🔜 Précommande</span>
              : <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, fontWeight: 700, background: '#F0FAF4', color: '#1D9E75', padding: '2px 9px', borderRadius: 8 }}>✓ En stock</span>}
          </div>
          <a href={raquette.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: isTop ? '#2B4EE5' : 'transparent', color: isTop ? '#fff' : '#2B4EE5', border: isTop ? 'none' : '1.5px solid #2B4EE5', fontFamily: 'Nunito, sans-serif', fontSize: 13, fontWeight: 800, padding: '8px 14px', borderRadius: 10, textDecoration: 'none' }}>Voir la raquette →</a>
        </div>
      </div>
      {dimsDisponibles.length > 0 && <>
        <button onClick={() => setExpanded(e => !e)} style={{ width: '100%', background: 'none', border: 'none', borderTop: '1px solid #EEF0F6', padding: '9px 16px', fontFamily: 'Nunito, sans-serif', fontSize: 12, fontWeight: 700, color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          {expanded ? 'Masquer la comparaison' : 'Voir la comparaison avec ma raquette'}
          <span style={{ display: 'inline-block', transition: 'transform .2s', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', fontSize: 10 }}>▼</span>
        </button>
        {expanded && (
          <div style={{ padding: '14px 16px 16px', borderTop: '1px solid #EEF0F6', background: '#FAFBFF' }}>
            <div style={{ display: 'flex', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><div style={{ width: 12, height: 5, background: '#D8DCF0', borderRadius: 2 }} /><span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 10, fontWeight: 600, color: '#aaa' }}>Ta raquette actuelle</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><div style={{ width: 12, height: 5, background: '#2B4EE5', borderRadius: 2, opacity: 0.85 }} /><span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 10, fontWeight: 600, color: '#aaa' }}>Cette raquette</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><div style={{ width: 3, height: 12, background: '#D85A30', borderRadius: 1 }} /><span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 10, fontWeight: 600, color: '#aaa' }}>Ton objectif</span></div>
            </div>
            {dimsDisponibles.map(d => (
              <ComparaisonBar key={d} dim={d} valeurActuelle={raquetteActuelle?.schema?.[d] ?? 50} valeurCible={cibles?.[d] ?? 50} valeurRaquette={raquette.schema[d]} />
            ))}
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
        <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, fontWeight: 600, color: '#888', marginBottom: 20 }}>
          {loading ? '⏳ Recalcul en cours...' : 'Les résultats se mettent à jour automatiquement'}
        </p>
        {DIMS.map(d => {
          const valeurActuelle = raquetteActuelle?.schema?.[d] ?? 50
          const valeurCible = cibles[d] ?? valeurActuelle
          const delta = valeurCible - valeurActuelle
          const couleur = DIM_COLORS[d]
          return (
            <div key={d} style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, fontWeight: 800, color: '#1A1A2E', display: 'flex', alignItems: 'center', gap: 5 }}>{DIM_ICONS[d]} {d}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {delta !== 0 && <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 10, fontWeight: 800, color: delta > 0 ? '#1D9E75' : '#D85A30', background: delta > 0 ? '#F0FAF4' : '#FEE8E0', padding: '1px 6px', borderRadius: 100 }}>{delta > 0 ? '+' : ''}{delta}</span>}
                  <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 16, fontWeight: 900, color: couleur, minWidth: 28, textAlign: 'right' }}>{valeurCible}</span>
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
        <button onClick={() => DIMS.forEach(d => onChangeCible(d, raquetteActuelle?.schema?.[d] ?? 50))} style={{ width: '100%', padding: '10px', background: '#F8F9FB', border: '1.5px solid #E8EAF0', borderRadius: 10, fontFamily: 'Nunito, sans-serif', fontSize: 13, fontWeight: 700, color: '#888', cursor: 'pointer', marginTop: 8 }}>
          Réinitialiser aux valeurs actuelles
        </button>
      </div>
      {ouvert && <div onClick={onToggle} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.15)', zIndex: 198, cursor: 'pointer' }} />}
    </>
  )
}

export default function UpgradeResultatsPage() {
  const router = useRouter()
  const [raquetteActuelle, setRaquetteActuelle] = useState(null)
  const [cibles, setCibles] = useState({})
  const [resultats, setResultats] = useState([])
  const [visibles, setVisibles] = useState(PAGE_SIZE)
  const [panneauOuvert, setPanneauOuvert] = useState(false)
  const [loading, setLoading] = useState(true)
  const debounceRef = useRef(null)

  // Charger les données initiales depuis sessionStorage
  useEffect(() => {
    const ra = sessionStorage.getItem('upgrade_raquette')
    const c = sessionStorage.getItem('upgrade_cibles')
    const r = sessionStorage.getItem('upgrade_resultats')
    if (ra) setRaquetteActuelle(JSON.parse(ra))
    if (c) setCibles(JSON.parse(c))
    if (r) { setResultats(JSON.parse(r)); setLoading(false) }
    else setLoading(false)
  }, [])

  // Recalcul via API avec debounce 600ms
  const recalculer = useCallback(async (nouvelleCibles, raquette) => {
    if (!raquette) return
    setLoading(true)
    try {
      const res = await fetch('/api/upgrade-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raquetteActuelle: raquette, cibles: nouvelleCibles, email: null }),
      })
      const data = await res.json()
      if (res.ok && data.resultats) {
        setResultats(data.resultats)
        setVisibles(PAGE_SIZE)
        sessionStorage.setItem('upgrade_resultats', JSON.stringify(data.resultats))
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [])

  const handleChangeCible = useCallback((dim, valeur) => {
    setCibles(prev => {
      const newCibles = { ...prev, [dim]: valeur }
      sessionStorage.setItem('upgrade_cibles', JSON.stringify(newCibles))
      // Debounce 600ms
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        recalculer(newCibles, raquetteActuelle)
      }, 600)
      return newCibles
    })
  }, [raquetteActuelle, recalculer])

  const raquettesVisibles = resultats.slice(0, visibles)
  const peutVoirPlus = visibles < resultats.length

  return (
    <main style={{ minHeight: '100vh', background: '#F8F9FB', paddingBottom: 80 }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #E8EAF0', padding: '14px 20px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 18, fontWeight: 900, color: '#2B4EE5' }}>EL <span style={{ color: '#F6BC3E' }}>SELECTOR</span></span>
        </div>
      </div>
      <div style={{ background: '#EEF2FF', padding: '24px 20px 20px', borderBottom: '1px solid #D8E0FA' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'Nunito, sans-serif', fontSize: 'clamp(20px, 5vw, 28px)', fontWeight: 900, color: '#1A1A2E', marginBottom: 8 }}>Tes raquettes d'évolution 🚀</h1>
          {raquetteActuelle && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, fontWeight: 700, color: '#2B4EE5', opacity: 0.7 }}>Depuis :</span>
              <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, fontWeight: 800, color: '#2B4EE5', background: 'rgba(43,78,229,0.08)', padding: '2px 10px', borderRadius: 100 }}>{raquetteActuelle.title}</span>
              <button onClick={() => router.push('/upgrade')} style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, fontWeight: 700, color: '#888', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Changer</button>
            </div>
          )}
          <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, color: '#2B4EE5', fontWeight: 600, marginTop: 8, opacity: 0.7 }}>🎚️ Utilise le panneau latéral pour ajuster tes critères</p>
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
            <button onClick={() => setPanneauOuvert(true)} className="btn btn-primary" style={{ display: 'inline-flex', width: 'auto' }}>🎚️ Ajuster mes critères</button>
          </div>
        ) : (
          <>
            <p style={{ color: '#888899', fontSize: 13, fontWeight: 700, marginBottom: 20, fontFamily: 'Nunito, sans-serif' }}>
              {resultats.length} raquette{resultats.length > 1 ? 's' : ''} trouvée{resultats.length > 1 ? 's' : ''}
            </p>
            {raquettesVisibles.map((r, i) => (
              <RaquetteCard key={r.id} raquette={r} rank={i + 1} raquetteActuelle={raquetteActuelle} cibles={cibles} />
            ))}
            {peutVoirPlus && (
              <button onClick={() => setVisibles(v => Math.min(v + PAGE_SIZE, resultats.length))} style={{ width: '100%', padding: '14px', background: '#fff', border: '1.5px solid #2B4EE5', borderRadius: 12, fontFamily: 'Nunito, sans-serif', fontSize: 14, fontWeight: 800, color: '#2B4EE5', cursor: 'pointer', marginBottom: 20 }}>
                Voir {Math.min(PAGE_SIZE, resultats.length - visibles)} raquette{Math.min(PAGE_SIZE, resultats.length - visibles) > 1 ? 's' : ''} de plus ↓
              </button>
            )}
            <div style={{ textAlign: 'center', marginTop: 16, paddingTop: 16, borderTop: '1px solid #E8EAF0' }}>
              <button onClick={() => router.push('/upgrade')} className="btn btn-secondary" style={{ display: 'inline-flex', width: 'auto' }}>← Modifier ma sélection</button>
            </div>
          </>
        )}
      </div>
      <PanneauSliders cibles={cibles} raquetteActuelle={raquetteActuelle} onChangeCible={handleChangeCible} ouvert={panneauOuvert} onToggle={() => setPanneauOuvert(o => !o)} loading={loading} />
    </main>
  )
}
