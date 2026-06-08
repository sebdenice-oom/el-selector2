'use client'
import { useState, useEffect, useCallback, useRef } from 'react'

const DIMS = ['Puissance', 'Confort', 'Spin', 'Contrôle', 'Tolérance', 'Maniabilité']
const DIM_ICONS = { Puissance: '⚡', Confort: '🛡️', Spin: '🌀', Contrôle: '🎯', Tolérance: '💪', Maniabilité: '🏃' }
const COULEUR_REF = '#D4537E'
const COULEUR_PROP = '#2B4EE5'
const PAGE_SIZE = 3

function radarPoint(valeur, angle, cx, cy, r) {
  const offset = ((valeur - 50) / 50) * r
  return [cx + offset * Math.cos(angle), cy + offset * Math.sin(angle)]
}

function RadarZoom({ schemaRef, schemaPropose }) {
  const cx = 105, cy = 110, r = 82
  const angles = DIMS.map((_, i) => (Math.PI / 3) * i - Math.PI / 2)
  const ptsRef   = DIMS.map((d, i) => radarPoint(schemaRef[d]    ?? 50, angles[i], cx, cy, r))
  const ptsProp  = DIMS.map((d, i) => radarPoint(schemaPropose[d] ?? 50, angles[i], cx, cy, r))
  const toStr = pts => pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const grid100 = angles.map(a => [cx + r * Math.cos(a), cy + r * Math.sin(a)])
  const grid75  = angles.map(a => [cx + (r / 2) * Math.cos(a), cy + (r / 2) * Math.sin(a)])

  // Labels complets avec position adaptée pour éviter la troncature
  const labelMap = {
    Puissance: 'Puissance', Confort: 'Confort', Spin: 'Spin',
    Contrôle: 'Contrôle', Tolérance: 'Tolérance', Maniabilité: 'Maniabilité'
  }

  return (
    <svg width={230} height={240} viewBox="0 0 230 240" style={{ display: 'block', margin: '0 auto', flexShrink: 0 }}>
      {angles.map((a, i) => (
        <line key={i} x1={cx} y1={cy}
          x2={grid100[i][0].toFixed(1)} y2={grid100[i][1].toFixed(1)}
          stroke="#E0E3EE" strokeWidth="0.5" />
      ))}
      <polygon points={toStr(grid100)} fill="none" stroke="#E0E3EE" strokeWidth="0.8" />
      <polygon points={toStr(grid75)}  fill="none" stroke="#E0E3EE" strokeWidth="0.8" />
      <circle cx={cx} cy={cy} r={2.5} fill="#E0E3EE" />
      <text x={cx} y={cy - 4}        textAnchor="middle" fontSize={8} fill="#bbb" fontFamily="Nunito,sans-serif">50</text>
      <text x={cx} y={cy - r/2 - 3}  textAnchor="middle" fontSize={8} fill="#bbb" fontFamily="Nunito,sans-serif">75</text>
      <text x={cx} y={cy - r - 3}    textAnchor="middle" fontSize={8} fill="#bbb" fontFamily="Nunito,sans-serif">100</text>
      {/* Ta raquette */}
      <polygon points={toStr(ptsRef)}
        fill={COULEUR_REF + '14'} stroke={COULEUR_REF} strokeWidth={2}
        strokeDasharray="5,2.5" strokeLinejoin="round" />
      {/* Proposée */}
      <polygon points={toStr(ptsProp)}
        fill={COULEUR_PROP + '18'} stroke={COULEUR_PROP} strokeWidth={2}
        strokeLinejoin="round" />
      {/* Labels avec marge suffisante */}
      {DIMS.map((d, i) => {
        const a   = angles[i]
        const lx  = cx + (r + 22) * Math.cos(a)
        const ly  = cy + (r + 22) * Math.sin(a)
        const anc = lx < cx - 8 ? 'end' : lx > cx + 8 ? 'start' : 'middle'
        return (
          <text key={i} x={lx.toFixed(1)} y={(ly + 4).toFixed(1)}
            textAnchor={anc} fontSize={9} fontWeight="700"
            fill="#666" fontFamily="Nunito,sans-serif">
            {labelMap[d]}
          </text>
        )
      })}
    </svg>
  )
}

function ComparaisonCard({ raquette, raquetteActuelle }) {
  const schemaRef     = raquetteActuelle?.schema || {}
  const schemaPropose = raquette.schema || {}

  return (
    <div style={{ padding: '12px 0 4px' }}>
      <div style={{ textAlign: 'center', marginBottom: 10 }}>
        <div style={{ fontSize: 11, color: '#888', fontFamily: 'Nunito, sans-serif' }}>Score de correspondance</div>
        <div style={{ fontSize: 26, fontWeight: 900, color: COULEUR_PROP, fontFamily: 'Nunito, sans-serif', lineHeight: 1.2 }}>{raquette.scoreFinal}%</div>
      </div>

      {/* Légende claire au-dessus du radar */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: COULEUR_REF, fontFamily: 'Nunito, sans-serif' }}>
          <svg width={18} height={4}><line x1={0} y1={2} x2={18} y2={2} stroke={COULEUR_REF} strokeWidth={2} strokeDasharray="4,2"/></svg>
          Raquette actuelle
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: COULEUR_PROP, fontFamily: 'Nunito, sans-serif' }}>
          <svg width={18} height={4}><line x1={0} y1={2} x2={18} y2={2} stroke={COULEUR_PROP} strokeWidth={2}/></svg>
          Raquette proposée
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <RadarZoom schemaRef={schemaRef} schemaPropose={schemaPropose} />
        <div style={{ flex: 1, minWidth: 150 }}>
          {DIMS.filter(d => schemaPropose[d] !== undefined).map(d => {
            const valRef  = schemaRef[d] ?? '–'
            const valProp = schemaPropose[d]
            const delta   = typeof valRef === 'number' ? valProp - valRef : null
            const pos     = delta !== null && delta >= 0
            return (
              <div key={d} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 0', borderBottom: '0.5px solid #EEF0F6' }}>
                <span style={{ fontSize: 13, width: 20, textAlign: 'center', flexShrink: 0 }}>{DIM_ICONS[d]}</span>
                <span style={{ fontSize: 12, color: '#666', flex: 1, fontFamily: 'Nunito, sans-serif', fontWeight: 600 }}>{d}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: COULEUR_REF, width: 26, textAlign: 'right', fontFamily: 'Nunito, sans-serif' }}>{valRef}</span>
                  <span style={{ fontSize: 11, color: '#aaa' }}>→</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: COULEUR_PROP, width: 26, textAlign: 'right', fontFamily: 'Nunito, sans-serif' }}>{valProp}</span>
                  {delta !== null && (
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 6px', borderRadius: 8, minWidth: 32, textAlign: 'center', fontFamily: 'Nunito, sans-serif', background: pos ? '#EAF3DE' : '#FAECE7', color: pos ? '#3B6D11' : '#993C1D' }}>
                      {pos ? '+' : ''}{delta}
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


const JOFFREY_PHOTO = 'https://el-selector2.vercel.app/joffrey.jpg'

function JoffreyCard({ raquette, raquetteActuelle }) {
  const hasPromo = raquette.compareAtPrice && raquette.compareAtPrice > raquette.price
  const remise = hasPromo ? Math.round((1 - raquette.price / raquette.compareAtPrice) * 100) : 0
  const [expanded, setExpanded] = useState(false)
  const schemaRef     = raquetteActuelle?.schema || {}
  const schemaPropose = raquette.schema || {}

  return (
    <div style={{ border: '2px solid #F6BC3E', borderRadius: 14, overflow: 'hidden', background: '#fff', boxShadow: '0 4px 20px rgba(246,188,62,0.20)', marginBottom: 10 }}>
      <div style={{ background: 'linear-gradient(90deg, #F6BC3E, #f0a500)', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <img src={JOFFREY_PHOTO} alt="Joffrey" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', border: '2px solid #fff', flexShrink: 0 }} />
        <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, fontWeight: 900, color: '#1A1A2E' }}>Le coup de cœur de Joffrey ⭐</span>
      </div>
      <a href={raquette.url} target="_blank" rel="noopener noreferrer"
        style={{ display: 'flex', gap: 12, padding: '12px 14px', textDecoration: 'none' }}
        onMouseEnter={e => e.currentTarget.style.background = '#FFFDF0'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
        <div style={{ width: 64, height: 64, flexShrink: 0, background: '#FFF8E0', borderRadius: 10, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {raquette.image ? <img src={raquette.image} alt={raquette.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span style={{ fontSize: 28 }}>🏏</span>}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, fontWeight: 800, color: '#1A1A2E', lineHeight: 1.3, marginBottom: 4 }}>{raquette.title}</div>
          <div style={{ marginBottom: 4 }}>
            <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 17, fontWeight: 900, color: hasPromo ? '#D85A30' : '#1A1A2E' }}>{parseFloat(raquette.price).toFixed(2)} €</span>
            {hasPromo && <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, fontWeight: 700, color: '#aaa', textDecoration: 'line-through', marginLeft: 5 }}>{parseFloat(raquette.compareAtPrice).toFixed(2)} €</span>}
            {hasPromo && <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 10, fontWeight: 800, background: '#FEE8E0', color: '#D85A30', padding: '1px 6px', borderRadius: 100, marginLeft: 4 }}>-{remise}%</span>}
          </div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, fontWeight: 800, background: '#FEF5E0', color: '#9A6B00', padding: '2px 9px', borderRadius: 100, border: '1px solid #F6BC3E' }}>{raquette.scoreFinal}% match</span>
            <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 10, fontWeight: 700, color: '#aaa', marginLeft: 'auto' }}>Voir →</span>
          </div>
        </div>
      </a>
      <div style={{ borderTop: '1px solid #FEF0C0', padding: '6px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFFDF5' }}>
        <button onClick={() => setExpanded(e => !e)}
          style={{ fontFamily: 'Nunito, sans-serif', fontSize: 10, fontWeight: 700, color: '#9A6B00', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          {expanded ? 'Masquer la comparaison' : 'Voir la comparaison'}
        </button>
        <a href={raquette.url} target="_blank" rel="noopener noreferrer"
          style={{ fontFamily: 'Nunito, sans-serif', fontSize: 10, fontWeight: 700, color: '#aaa', textDecoration: 'none' }}>Voir →</a>
      </div>
      {expanded && (
        <div style={{ padding: '0 14px 14px', borderTop: '1px solid #FEF0C0', background: '#FFFDF5' }}>
          <div style={{ textAlign: 'center', padding: '10px 0 8px' }}>
            <div style={{ fontSize: 11, color: '#888', fontFamily: 'Nunito, sans-serif' }}>Score de correspondance</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#9A6B00', fontFamily: 'Nunito, sans-serif' }}>{raquette.scoreFinal}%</div>
          </div>
          {DIMS.filter(d => schemaPropose[d] !== undefined).map(d => {
            const valRef = schemaRef[d] ?? '–'
            const valProp = schemaPropose[d]
            const delta = typeof valRef === 'number' ? valProp - valRef : null
            const pos = delta !== null && delta >= 0
            return (
              <div key={d} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 0', borderBottom: '0.5px solid #FEF0C0' }}>
                <span style={{ fontSize: 13, width: 20, textAlign: 'center', flexShrink: 0 }}>{DIM_ICONS[d]}</span>
                <span style={{ fontSize: 12, color: '#888', flex: 1, fontFamily: 'Nunito, sans-serif' }}>{d}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#D4537E', width: 26, textAlign: 'right', fontFamily: 'Nunito, sans-serif' }}>{valRef}</span>
                  <span style={{ fontSize: 11, color: '#aaa' }}>→</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#9A6B00', width: 26, textAlign: 'right', fontFamily: 'Nunito, sans-serif' }}>{valProp}</span>
                  {delta !== null && (
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 5px', borderRadius: 8, minWidth: 30, textAlign: 'center', fontFamily: 'Nunito, sans-serif', background: pos ? '#EAF3DE' : '#FAECE7', color: pos ? '#3B6D11' : '#993C1D' }}>
                      {pos ? '+' : ''}{delta}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function RaquetteCard({ raquette, rank, raquetteActuelle }) {
  const [expanded, setExpanded] = useState(false)
  const isTop    = rank === 1
  const hasPromo = raquette.compareAtPrice && raquette.compareAtPrice > raquette.price
  const remise   = hasPromo ? Math.round((1 - raquette.price / raquette.compareAtPrice) * 100) : 0

  return (
    <div style={{ background: '#fff', border: `1.5px solid ${isTop ? COULEUR_PROP : '#E8EAF0'}`, borderRadius: 14, overflow: 'hidden', marginBottom: 10, boxShadow: isTop ? '0 4px 20px rgba(43,78,229,0.10)' : 'none' }}>
      {isTop && <div style={{ background: COULEUR_PROP, color: '#fff', padding: '5px 14px', fontSize: 11, fontWeight: 800, letterSpacing: '0.05em', fontFamily: 'Nunito, sans-serif' }}>🚀 Meilleure évolution</div>}

      {/* Tuile cliquable */}
      <a href={raquette.url} target="_blank" rel="noopener noreferrer"
        style={{ display: 'flex', gap: 12, padding: '12px 14px', textDecoration: 'none', transition: 'background .1s' }}
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
            <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, fontWeight: 900, background: '#EEF2FF', color: COULEUR_PROP, padding: '3px 10px', borderRadius: 100 }}>{raquette.scoreFinal}% match</span>
            {raquette.precommande
              ? <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 10, fontWeight: 700, background: '#FEF5E0', color: '#9A6B00', padding: '1px 7px', borderRadius: 7, border: '1px solid #F6BC3E' }}>🔜 Précommande</span>
              : null}
            <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 10, fontWeight: 700, color: '#aaa', marginLeft: 'auto' }}>Voir →</span>
          </div>
        </div>
      </a>

      {/* Toggle comparaison */}
      <button onClick={() => setExpanded(e => !e)}
        style={{ width: '100%', background: 'none', border: 'none', borderTop: '0.5px solid #EEF0F6', padding: '8px 14px', fontFamily: 'Nunito, sans-serif', fontSize: 11, fontWeight: 700, color: '#666', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
        {expanded ? 'Masquer la comparaison' : 'Voir la comparaison'}
        <span style={{ display: 'inline-block', transition: 'transform .2s', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', fontSize: 9 }}>▼</span>
      </button>

      {expanded && (
        <div style={{ padding: '0 14px 14px', borderTop: '0.5px solid #EEF0F6', background: '#FAFBFF' }}>
          <ComparaisonCard raquette={raquette} raquetteActuelle={raquetteActuelle} />
        </div>
      )}
    </div>
  )
}

function RaquetteReference({ raquette }) {
  if (!raquette) return null
  const prixRef = raquette.compareAtPrice && raquette.compareAtPrice > raquette.price ? raquette.compareAtPrice : raquette.price
  return (
    <div style={{ background: '#fff', border: '1.5px solid #E8EAF0', borderRadius: 14, overflow: 'hidden', marginBottom: 0 }}>
      <div style={{ background: '#F8F9FB', padding: '5px 14px', fontSize: 10, fontWeight: 800, letterSpacing: '0.05em', color: '#888', fontFamily: 'Nunito, sans-serif' }}>TA RAQUETTE ACTUELLE</div>
      <div style={{ display: 'flex', gap: 12, padding: '10px 14px' }}>
        <div style={{ width: 56, height: 56, flexShrink: 0, background: '#F0F3FF', borderRadius: 10, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {raquette.image ? <img src={raquette.image} alt={raquette.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span style={{ fontSize: 24 }}>🏏</span>}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, fontWeight: 800, color: '#1A1A2E', marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{raquette.title}</div>
          <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 15, fontWeight: 900, color: COULEUR_REF, marginBottom: 4 }}>{parseFloat(prixRef).toFixed(2)} €</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 12px' }}>
            {Object.entries(raquette.schema || {}).map(([k, v]) => (
              <span key={k} style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, fontWeight: 700, color: COULEUR_REF }}>{DIM_ICONS[k]} {v}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Sliders intégrés directement dans la page (plus de panneau latéral)
function SlidersIntegres({ cibles, ciblesInitiales, raquetteActuelle, onChangeCible, loading }) {
  return (
    <div style={{ background: '#fff', border: '1.5px solid #E8EAF0', borderRadius: 14, padding: '14px 16px', marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13, fontWeight: 900, color: '#1A1A2E' }}>
          🎚️ Ajuster mes critères
        </span>
        <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 11, fontWeight: 600, color: loading ? '#F6BC3E' : '#1D9E75' }}>
          {loading ? '⏳ Calcul...' : '✓ À jour'}
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px 20px' }}>
        {DIMS.map(d => {
          const valeurActuelle = raquetteActuelle?.schema?.[d] ?? 50
          const valeurCible    = cibles[d] ?? valeurActuelle
          const delta          = valeurCible - valeurActuelle
          return (
            <div key={d}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, fontWeight: 800, color: '#1A1A2E' }}>{DIM_ICONS[d]} {d}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  {delta !== 0 && (
                    <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 10, fontWeight: 800, color: delta > 0 ? '#3B6D11' : '#993C1D', background: delta > 0 ? '#EAF3DE' : '#FAECE7', padding: '1px 6px', borderRadius: 100 }}>
                      {delta > 0 ? '+' : ''}{delta}
                    </span>
                  )}
                  <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, fontWeight: 900, color: COULEUR_PROP }}>{valeurCible}</span>
                </div>
              </div>
              <div style={{ position: 'relative' }}>
                <input type="range" min={0} max={100} step={1} value={valeurCible}
                  onChange={e => onChangeCible(d, parseInt(e.target.value))}
                  style={{ width: '100%' }} />
                <div style={{ position: 'absolute', left: `${valeurActuelle}%`, top: 0, bottom: 0, width: 2, background: '#C8D3F9', borderRadius: 1, pointerEvents: 'none', transform: 'translateX(-50%)' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 1 }}>
                <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 9, color: '#ccc' }}>0</span>
                <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 9, color: '#aaa' }}>Actuel : {valeurActuelle}</span>
                <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 9, color: '#ccc' }}>100</span>
              </div>
            </div>
          )
        })}
      </div>
      <button
        onClick={() => DIMS.forEach(d => onChangeCible(d, raquetteActuelle?.schema?.[d] ?? 50))}
        style={{ marginTop: 12, padding: '8px 16px', background: '#F8F9FB', border: '1.5px solid #E8EAF0', borderRadius: 10, fontFamily: 'Nunito, sans-serif', fontSize: 12, fontWeight: 700, color: '#666', cursor: 'pointer' }}>
        Réinitialiser
      </button>
    </div>
  )
}

export default function UpgradePage() {
  const [etape, setEtape]                     = useState('recherche')
  const [query, setQuery]                     = useState('')
  const [suggestions, setSuggestions]         = useState([])
  const [catalogue, setCatalogue]             = useState([])
  const [raquetteChoisie, setRaquetteChoisie] = useState(null)
  const [cibles, setCibles]                   = useState({})
  const [ciblesInitiales, setCiblesInitiales] = useState({})
  const [resultats, setResultats]             = useState([])
  const [visibles, setVisibles]               = useState(PAGE_SIZE)
  const [loading, setLoading]                 = useState(false)
  const [loadingCatalogue, setLoadingCatalogue] = useState(true)
  const [email, setEmail]                     = useState('')
  const [emailEnvoye, setEmailEnvoye]         = useState(false)
  const debounceRef = useRef(null)

  useEffect(() => {
    fetch('/api/catalogue').then(r => r.json())
      .then(data => { setCatalogue(data.raquettes || []); setLoadingCatalogue(false) })
      .catch(() => setLoadingCatalogue(false))
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
        body: JSON.stringify({ raquetteActuelle: raquette, cibles: nouvellesCibles, ciblesInitiales: initiales || nouvellesCibles }),
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
          <h1 style={{ fontFamily: 'var(--font)', fontSize: 'clamp(22px,5vw,30px)', fontWeight: 900, color: 'var(--texte)', textAlign: 'center', marginBottom: 8 }}>Quelle est ta raquette actuelle ?</h1>
          <p style={{ color: 'var(--texte-muted)', fontSize: 14, fontWeight: 600, textAlign: 'center', marginBottom: 32 }}>Tape le nom pour la trouver dans notre catalogue</p>
          <div style={{ position: 'relative' }}>
            <input type="text" placeholder="Ex: Bullpadel Hack 04..." value={query}
              onChange={e => setQuery(e.target.value)} autoFocus
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
      {/* Header sticky */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E8EAF0', padding: '14px 20px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: 18, fontWeight: 900, color: COULEUR_PROP }}>EL <span style={{ color: '#F6BC3E' }}>SELECTOR</span></span>
          <button onClick={() => setEtape('recherche')} style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, fontWeight: 700, color: '#888', background: 'none', border: 'none', cursor: 'pointer' }}>← Changer de raquette</button>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 16, paddingBottom: 20 }}>
        {/* Raquette référence */}
        <RaquetteReference raquette={raquetteChoisie} />

        {/* Sliders intégrés directement */}
        <div style={{ marginTop: 12 }}>
          <SlidersIntegres
            cibles={cibles}
            ciblesInitiales={ciblesInitiales}
            raquetteActuelle={raquetteChoisie}
            onChangeCible={handleChangeCible}
            loading={loading}
          />
        </div>

        {/* Résultats */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div className="spinner" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 700, color: '#888', fontSize: 13 }}>Calcul en cours…</p>
          </div>
        ) : resultats.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p style={{ fontSize: 16, fontWeight: 800, marginBottom: 12, fontFamily: 'Nunito, sans-serif', color: '#1A1A2E' }}>Aucune raquette ne correspond.</p>
          </div>
        ) : (
          <>
            <p style={{ color: '#888', fontSize: 12, fontWeight: 700, marginBottom: 12, fontFamily: 'Nunito, sans-serif' }}>
              {resultats.length} raquette{resultats.length > 1 ? 's' : ''} trouvée{resultats.length > 1 ? 's' : ''}
            </p>
            {resultats.slice(0, visibles).map((r, i) => (
              r.isJoffrey
                ? <JoffreyCard key={r.id + '_joffrey'} raquette={r} raquetteActuelle={raquetteChoisie} />
                : <RaquetteCard key={r.id} raquette={r} rank={i + 1} raquetteActuelle={raquetteChoisie} />
            ))}
            {visibles < resultats.length && (
              <button onClick={() => setVisibles(v => Math.min(v + PAGE_SIZE, resultats.length))}
                style={{ width: '100%', padding: '12px', background: '#fff', border: `1.5px solid ${COULEUR_PROP}`, borderRadius: 12, fontFamily: 'Nunito, sans-serif', fontSize: 13, fontWeight: 800, color: COULEUR_PROP, cursor: 'pointer', marginBottom: 16 }}>
                Voir {Math.min(PAGE_SIZE, resultats.length - visibles)} raquette{Math.min(PAGE_SIZE, resultats.length - visibles) > 1 ? 's' : ''} de plus ↓
              </button>
            )}

            {/* Email */}
            {!emailEnvoye ? (
              <div style={{ background: '#fff', border: '1.5px solid #E8EAF0', borderRadius: 14, padding: '18px 16px', marginTop: 8, textAlign: 'center' }}>
                <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 14, fontWeight: 900, color: '#1A1A2E', marginBottom: 4 }}>📧 Reçois ton TOP 3 par email</p>
                <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: 12, fontWeight: 600, color: '#888', marginBottom: 12 }}>Garde une trace de tes recommandations</p>
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
    </main>
  )
}
