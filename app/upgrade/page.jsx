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
const DIM_DESC = {
  Puissance: 'Force de frappe transmise à la balle',
  Confort: 'Absorption des vibrations, protection du bras',
  Spin: 'Capacité à générer de l\'effet sur la balle',
  Contrôle: 'Précision et placement des coups',
  Tolérance: 'Régularité même sur les frappes décentrées',
  Maniabilité: 'Facilité à manœuvrer et réagir rapidement',
}

const ETAPES = ['recherche', 'sliders', 'email']

export default function UpgradePage() {
  const router = useRouter()
  const [etape, setEtape] = useState('recherche')
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [catalogue, setCatalogue] = useState([])
  const [raquetteChoisie, setRaquetteChoisie] = useState(null)
  const [cibles, setCibles] = useState({})
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingCatalogue, setLoadingCatalogue] = useState(true)
  const [erreur, setErreur] = useState('')
  const [tooltip, setTooltip] = useState(null)
  const searchRef = useRef(null)

  // Charger le catalogue au montage
  useEffect(() => {
    fetch('/api/catalogue')
      .then(r => r.json())
      .then(data => {
        setCatalogue(data.raquettes || [])
        setLoadingCatalogue(false)
      })
      .catch(() => setLoadingCatalogue(false))
  }, [])

  // Autocomplete
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([])
      return
    }
    const q = query.toLowerCase()
    const matches = catalogue
      .filter(r => r.title.toLowerCase().includes(q))
      .slice(0, 6)
    setSuggestions(matches)
  }, [query, catalogue])

  function choisirRaquette(raquette) {
    setRaquetteChoisie(raquette)
    setQuery(raquette.title)
    setSuggestions([])
    // Préremplir les cibles avec les valeurs actuelles
    const initialCibles = {}
    DIMS.forEach(d => {
      initialCibles[d] = raquette.schema[d] ?? 50
    })
    setCibles(initialCibles)
    setTimeout(() => setEtape('sliders'), 300)
  }

  function ajusterCible(dim, valeur) {
    setCibles(prev => ({ ...prev, [dim]: valeur }))
  }

  async function soumettre() {
    setLoading(true)
    setErreur('')
    try {
      const res = await fetch('/api/upgrade-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raquetteActuelle: raquetteChoisie,
          cibles,
          email: email || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur serveur')
      sessionStorage.setItem('upgrade_resultats', JSON.stringify(data.resultats))
      sessionStorage.setItem('upgrade_raquette', JSON.stringify(raquetteChoisie))
      sessionStorage.setItem('upgrade_cibles', JSON.stringify(cibles))
      router.push('/upgrade/resultats')
    } catch (e) {
      setErreur('Une erreur est survenue. Veuillez réessayer.')
      setLoading(false)
    }
  }

  const progression = etape === 'recherche' ? 33 : etape === 'sliders' ? 66 : 100

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--fond)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 20px' }} />
          <p style={{ color: 'var(--texte-muted)', fontFamily: 'var(--font)', fontWeight: 700 }}>
            Analyse de tes critères d'évolution…
          </p>
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--fond)' }}>

      {/* Header */}
      <header style={{ background: 'var(--blanc)', borderBottom: '1px solid var(--bordure)', padding: '14px 20px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'var(--font)', fontSize: 18, fontWeight: 900, color: 'var(--bleu)' }}>
            EL <span style={{ color: 'var(--jaune)' }}>SELECTOR</span>
          </span>
          <a href="/" style={{ fontFamily: 'var(--font)', fontSize: 12, fontWeight: 700, color: 'var(--texte-muted)', textDecoration: 'none' }}>
            ← Nouveau joueur
          </a>
        </div>
      </header>

      {/* Progress */}
      <div style={{ background: 'var(--blanc)', padding: '10px 20px 14px', borderBottom: '1px solid var(--bordure)' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: progression + '%' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--texte-muted)', fontWeight: 700 }}>
              {etape === 'recherche' ? '1 / 3' : etape === 'sliders' ? '2 / 3' : '3 / 3'}
            </span>
            {etape !== 'recherche' && (
              <button
                onClick={() => setEtape(etape === 'email' ? 'sliders' : 'recherche')}
                style={{ fontSize: 13, color: 'var(--texte-muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)', fontWeight: 700 }}>
                ← Retour
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="container fade-up" style={{ flex: 1, paddingTop: 40, paddingBottom: 32 }} key={etape}>

        {/* ETAPE 1 : Recherche */}
        {etape === 'recherche' && (
          <>
            <h1 style={{ fontFamily: 'var(--font)', fontSize: 'clamp(22px, 5vw, 30px)', fontWeight: 900, color: 'var(--texte)', textAlign: 'center', marginBottom: 8 }}>
              Quelle est ta raquette actuelle ?
            </h1>
            <p style={{ color: 'var(--texte-muted)', fontSize: 14, fontWeight: 600, textAlign: 'center', marginBottom: 32 }}>
              Tape le nom de ta raquette pour la trouver dans notre catalogue
            </p>

            <div style={{ position: 'relative' }}>
              <input
                ref={searchRef}
                type="text"
                placeholder="Ex: Babolat Technical Viper..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                autoFocus
                style={{
                  width: '100%', padding: '16px 16px 16px 44px',
                  background: 'var(--blanc)', border: '2px solid var(--bordure)',
                  borderRadius: 14, color: 'var(--texte)',
                  fontFamily: 'var(--font)', fontSize: 15, fontWeight: 600,
                  outline: 'none', transition: 'border-color .15s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--bleu)'}
                onBlur={e => e.target.style.borderColor = 'var(--bordure)'}
              />
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 18, pointerEvents: 'none' }}>🔍</span>

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
                  background: 'var(--blanc)', border: '1.5px solid var(--bordure)',
                  borderRadius: 14, marginTop: 6, overflow: 'hidden',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                }}>
                  {suggestions.map(r => (
                    <button
                      key={r.id}
                      onClick={() => choisirRaquette(r)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                        padding: '12px 16px', background: 'none', border: 'none',
                        borderBottom: '1px solid var(--bordure)', cursor: 'pointer',
                        transition: 'background .1s', textAlign: 'left',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bleu-light)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      {r.image && (
                        <img src={r.image} alt={r.title} style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 8, background: '#F0F3FF', flexShrink: 0 }} />
                      )}
                      <div>
                        <div style={{ fontFamily: 'var(--font)', fontSize: 13, fontWeight: 800, color: 'var(--texte)' }}>{r.title}</div>
                        <div style={{ fontFamily: 'var(--font)', fontSize: 11, fontWeight: 600, color: 'var(--texte-muted)' }}>
                          {parseFloat(r.price).toFixed(2)} € · {r.genre}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Aucun résultat */}
              {query.length >= 2 && suggestions.length === 0 && !loadingCatalogue && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
                  background: 'var(--blanc)', border: '1.5px solid var(--bordure)',
                  borderRadius: 14, marginTop: 6, padding: '20px 16px', textAlign: 'center',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                }}>
                  <p style={{ fontFamily: 'var(--font)', fontSize: 13, fontWeight: 700, color: 'var(--texte-muted)', marginBottom: 12 }}>
                    Raquette introuvable dans notre catalogue
                  </p>
                  <a href="/" style={{
                    fontFamily: 'var(--font)', fontSize: 13, fontWeight: 800,
                    color: 'var(--blanc)', background: 'var(--bleu)',
                    padding: '8px 16px', borderRadius: 10, textDecoration: 'none',
                    display: 'inline-block',
                  }}>
                    Utiliser El Selector →
                  </a>
                </div>
              )}
            </div>

            {loadingCatalogue && (
              <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--texte-muted)', fontFamily: 'var(--font)', fontWeight: 600, fontSize: 13 }}>
                Chargement du catalogue…
              </p>
            )}
          </>
        )}

        {/* ETAPE 2 : Sliders */}
        {etape === 'sliders' && raquetteChoisie && (
          <>
            <h1 style={{ fontFamily: 'var(--font)', fontSize: 'clamp(20px, 5vw, 28px)', fontWeight: 900, color: 'var(--texte)', textAlign: 'center', marginBottom: 6 }}>
              Comment veux-tu évoluer ?
            </h1>
            <p style={{ color: 'var(--texte-muted)', fontSize: 13, fontWeight: 600, textAlign: 'center', marginBottom: 24 }}>
              Ajuste les curseurs vers ce que tu recherches
            </p>

            {/* Raquette actuelle */}
            <div style={{
              background: 'var(--blanc)', border: '1.5px solid var(--bordure)',
              borderRadius: 14, padding: '12px 16px', marginBottom: 24,
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              {raquetteChoisie.image && (
                <img src={raquetteChoisie.image} alt={raquetteChoisie.title}
                  style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 8, background: '#F0F3FF', flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font)', fontSize: 12, fontWeight: 700, color: 'var(--texte-muted)', marginBottom: 2 }}>Raquette actuelle</div>
                <div style={{ fontFamily: 'var(--font)', fontSize: 14, fontWeight: 800, color: 'var(--texte)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {raquetteChoisie.title}
                </div>
              </div>
              <button
                onClick={() => { setEtape('recherche'); setRaquetteChoisie(null); setQuery('') }}
                style={{ fontSize: 11, fontWeight: 700, color: 'var(--bleu)', background: 'var(--bleu-light)', border: 'none', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', fontFamily: 'var(--font)', flexShrink: 0 }}>
                Changer
              </button>
            </div>

            {/* Sliders */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 32 }}>
              {DIMS.map(d => {
                const valeurActuelle = raquetteChoisie.schema[d] ?? 50
                const valeurCible = cibles[d] ?? valeurActuelle
                const delta = valeurCible - valeurActuelle
                const couleur = DIM_COLORS[d]

                return (
                  <div key={d} style={{ background: 'var(--blanc)', border: '1.5px solid var(--bordure)', borderRadius: 14, padding: '16px 16px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <span style={{ fontSize: 16 }}>{DIM_ICONS[d]}</span>
                        <span style={{ fontFamily: 'var(--font)', fontSize: 14, fontWeight: 800, color: 'var(--texte)' }}>{d}</span>
                        <button
                          onClick={() => setTooltip(tooltip === d ? null : d)}
                          style={{ width: 16, height: 16, borderRadius: '50%', border: '1.5px solid var(--bordure)', background: 'none', cursor: 'pointer', fontSize: 10, color: 'var(--texte-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                          ?
                        </button>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {delta !== 0 && (
                          <span style={{
                            fontFamily: 'var(--font)', fontSize: 11, fontWeight: 800,
                            color: delta > 0 ? '#1D9E75' : '#D85A30',
                            background: delta > 0 ? '#F0FAF4' : '#FEE8E0',
                            padding: '2px 8px', borderRadius: 100,
                          }}>
                            {delta > 0 ? '+' : ''}{delta}
                          </span>
                        )}
                        <span style={{ fontFamily: 'var(--font)', fontSize: 18, fontWeight: 900, color: couleur, minWidth: 32, textAlign: 'right' }}>
                          {valeurCible}
                        </span>
                      </div>
                    </div>

                    {/* Tooltip */}
                    {tooltip === d && (
                      <div style={{
                        background: 'var(--bleu-light)', border: '1px solid #C8D3F9',
                        borderRadius: 10, padding: '8px 12px', marginBottom: 10,
                        fontFamily: 'var(--font)', fontSize: 12, fontWeight: 600, color: 'var(--bleu)',
                      }}>
                        {DIM_DESC[d]}
                      </div>
                    )}

                    {/* Slider avec marqueur valeur actuelle */}
                    <div style={{ position: 'relative' }}>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={1}
                        value={valeurCible}
                        onChange={e => ajusterCible(d, parseInt(e.target.value))}
                        style={{ '--thumb-color': couleur, width: '100%' }}
                      />
                      {/* Marqueur valeur actuelle */}
                      <div style={{
                        position: 'absolute',
                        left: `calc(${valeurActuelle}% - 1px)`,
                        top: 0,
                        bottom: 0,
                        width: 2,
                        background: '#C8D3F9',
                        borderRadius: 1,
                        pointerEvents: 'none',
                      }} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                      <span style={{ fontFamily: 'var(--font)', fontSize: 10, fontWeight: 700, color: 'var(--texte-muted)' }}>Moins</span>
                      <span style={{ fontFamily: 'var(--font)', fontSize: 10, fontWeight: 700, color: 'var(--texte-muted)' }}>
                        Actuel : {valeurActuelle}
                      </span>
                      <span style={{ fontFamily: 'var(--font)', fontSize: 10, fontWeight: 700, color: 'var(--texte-muted)' }}>Plus</span>
                    </div>
                  </div>
                )
              })}
            </div>

            <button className="btn btn-primary" onClick={() => setEtape('email')}>
              Voir mes raquettes →
            </button>
          </>
        )}

        {/* ETAPE 3 : Email */}
        {etape === 'email' && (
          <>
            <h1 style={{ fontFamily: 'var(--font)', fontSize: 'clamp(22px, 5vw, 30px)', fontWeight: 900, color: 'var(--texte)', textAlign: 'center', marginBottom: 8 }}>
              Reçois tes recommandations
            </h1>
            <p style={{ color: 'var(--texte-muted)', fontSize: 14, fontWeight: 600, textAlign: 'center', marginBottom: 32 }}>
              Optionnel — reçois ton TOP 3 par email
            </p>
            <input
              type="email"
              placeholder="ton@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{
                width: '100%', padding: '16px',
                background: 'var(--blanc)', border: '2px solid var(--bordure)',
                borderRadius: 12, color: 'var(--texte)',
                fontFamily: 'var(--font)', fontSize: 15, fontWeight: 600,
                outline: 'none', marginBottom: 12,
              }}
            />
            <p style={{ fontSize: 12, color: 'var(--texte-muted)', fontWeight: 600, textAlign: 'center', marginBottom: 28 }}>
              🔒 Données traitées conformément au RGPD. Aucun spam.
            </p>
            {erreur && (
              <p style={{ color: '#D32F2F', fontSize: 14, marginBottom: 12, textAlign: 'center', fontWeight: 700 }}>
                {erreur}
              </p>
            )}
            <button className="btn btn-primary" onClick={soumettre}>
              Voir mes raquettes →
            </button>
          </>
        )}
      </div>
    </main>
  )
}
