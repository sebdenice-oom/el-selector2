// app/page.jsx — Page d'accueil El Selector
// Aiguille le joueur vers le Selector (première raquette) ou l'Evoluteur (faire évoluer sa raquette).

export const metadata = {
  title: 'Trouve ta prochaine raquette de padel — El Selector',
  description: "Tu débutes ou tu veux faire évoluer ta raquette de padel ? El Selector te guide vers la raquette qui te correspond, en quelques questions.",
}

export default function AccueilPage() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--fond)' }}>

      {/* HEADER */}
      <header style={{ background: 'var(--blanc)', borderBottom: '1px solid var(--bordure)', padding: '14px 20px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <span style={{ fontFamily: 'var(--font)', fontSize: 18, fontWeight: 900, color: 'var(--bleu)' }}>
            EL <span style={{ color: 'var(--jaune)' }}>SELECTOR</span>
          </span>
        </div>
      </header>

      <div className="container" style={{ maxWidth: 720, flex: 1, paddingTop: 44, paddingBottom: 40 }}>

        {/* HERO */}
        <section style={{ textAlign: 'center', marginBottom: 40 }}>
          <span style={{
            display: 'inline-block', fontFamily: 'var(--font)', fontSize: 13, fontWeight: 800,
            color: 'var(--bleu)', background: 'var(--bleu-light)', padding: '6px 14px', borderRadius: 100,
            marginBottom: 18, letterSpacing: '.01em',
          }}>
            🎾 Ton conseiller raquette de padel
          </span>
          <h1 style={{
            fontFamily: 'var(--font)', fontSize: 'clamp(28px, 6vw, 44px)', fontWeight: 900,
            color: 'var(--texte)', lineHeight: 1.12, margin: '0 auto 14px', maxWidth: 15 + 'ch',
          }}>
            Trouve ta prochaine{' '}
            <span style={{ position: 'relative', whiteSpace: 'nowrap' }}>
              <span style={{ position: 'absolute', left: -2, right: -2, bottom: 4, height: '0.42em', background: 'var(--jaune)', borderRadius: 4, zIndex: 0 }} aria-hidden="true" />
              <span style={{ position: 'relative', zIndex: 1 }}>raquette&nbsp;!</span>
            </span>
          </h1>
          <p style={{
            fontFamily: 'var(--font)', fontSize: 'clamp(15px, 2.2vw, 17px)', fontWeight: 600,
            color: 'var(--texte-muted)', maxWidth: '52ch', margin: '0 auto',
          }}>
            Deux chemins, un seul objectif&nbsp;: la raquette qui te correspond vraiment. Choisis ton point de départ, on s'occupe du reste.
          </p>
        </section>

        {/* DEUX ENTRÉES — dimensions et poids visuel strictement identiques */}
        <section className="acc-grid" aria-label="Choisis ton point de départ">

          {/* Entrée 1 : El Selector */}
          <a className="acc-card" href="/selector">
            <span className="acc-emoji" aria-hidden="true">🏏</span>
            <span className="acc-tag">El Selector</span>
            <span className="acc-h2">Je pars de zéro</span>
            <span className="acc-p">Tu cherches ta première raquette&nbsp;? On te pose 4 questions simples et on te propose les modèles faits pour toi.</span>
            <span className="acc-meta">4 étapes • ~2 min</span>
            <span className="acc-cta">Commencer le Selector →</span>
          </a>

          {/* Entrée 2 : El Evoluteur */}
          <a className="acc-card" href="/upgrade">
            <span className="acc-emoji" aria-hidden="true">🚀</span>
            <span className="acc-tag">El Evoluteur</span>
            <span className="acc-h2">Je fais évoluer ma raquette</span>
            <span className="acc-p">Tu joues déjà&nbsp;? Indique ta raquette actuelle&nbsp;: on identifie ce qui te correspond et on te propose la suite logique.</span>
            <span className="acc-meta">À partir de ta raquette actuelle</span>
            <span className="acc-cta">Commencer l'Evoluteur →</span>
          </a>

        </section>

        {/* PASSERELLE — on ne laisse jamais le joueur sortir de l'outil */}
        <section className="acc-bridge" aria-label="Aide">
          <span className="acc-bridge-emoji" aria-hidden="true">🔁</span>
          <span className="acc-bridge-text">
            <strong>Tu ne retrouves pas ta raquette dans l'Evoluteur&nbsp;?</strong>
            Pas de souci&nbsp;: le Selector prend le relais et te guide pas à pas, sans quitter l'outil.
          </span>
          <a className="acc-bridge-link" href="/selector">Passer par le Selector →</a>
        </section>

        {/* RÉASSURANCE */}
        <div className="acc-reassure">
          <span>✓ 100&nbsp;% gratuit</span>
          <span>✓ Sans inscription</span>
          <span>✓ Conseils personnalisés</span>
        </div>

      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid var(--bordure)', padding: '22px 20px 32px', textAlign: 'center' }}>
        <span style={{ fontFamily: 'var(--font)', fontSize: 13, fontWeight: 700, color: 'var(--texte-muted)' }}>
          EL <span style={{ color: 'var(--jaune)' }}>SELECTOR</span> — ton conseiller raquette de padel.
        </span>
      </footer>

      {/* Styles spécifiques à l'accueil (grille responsive + états hover) */}
      <style>{`
        .acc-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          align-items: stretch;
          margin-bottom: 24px;
        }
        .acc-card {
          display: flex;
          flex-direction: column;
          background: var(--blanc);
          border: 2px solid var(--bordure);
          border-radius: var(--radius);
          padding: 26px 22px;
          text-decoration: none;
          transition: border-color .15s ease, transform .15s ease, box-shadow .15s ease;
        }
        .acc-card:hover {
          border-color: var(--bleu);
          transform: translateY(-3px);
          box-shadow: 0 14px 30px -14px rgba(43,78,229,.35);
        }
        .acc-card:focus-visible {
          outline: 3px solid var(--bleu);
          outline-offset: 3px;
        }
        .acc-emoji {
          font-size: 34px;
          width: 60px; height: 60px;
          display: inline-flex; align-items: center; justify-content: center;
          background: var(--bleu-light);
          border-radius: 16px;
          margin-bottom: 16px;
        }
        .acc-tag {
          font-family: var(--font); font-size: 12px; font-weight: 800; letter-spacing: .08em;
          text-transform: uppercase; color: var(--bleu); margin-bottom: 4px;
        }
        .acc-h2 {
          font-family: var(--font); font-size: 20px; font-weight: 900; color: var(--texte);
          line-height: 1.2; margin-bottom: 8px;
        }
        .acc-p {
          font-family: var(--font); font-size: 14.5px; font-weight: 600; color: var(--texte-muted);
          line-height: 1.55;
        }
        .acc-meta {
          font-family: var(--font); font-size: 13px; font-weight: 800; color: var(--texte-muted);
          margin-top: 14px;
        }
        .acc-cta {
          margin-top: 18px;
          display: inline-flex; align-items: center; justify-content: center;
          background: var(--bleu); color: #fff;
          font-family: var(--font); font-size: 15px; font-weight: 800;
          padding: 13px 18px; border-radius: var(--radius-btn);
          transition: background .15s ease;
        }
        .acc-card:hover .acc-cta { background: var(--bleu-hover); }

        .acc-bridge {
          display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
          justify-content: center; text-align: center;
          background: var(--texte); color: #fff;
          border-radius: var(--radius); padding: 20px 24px; margin-bottom: 22px;
        }
        .acc-bridge-emoji {
          font-size: 22px; width: 42px; height: 42px; flex: none;
          display: inline-flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,.12); border-radius: 12px;
        }
        .acc-bridge-text {
          font-family: var(--font); font-size: 14px; font-weight: 600; color: #C9CCE0;
          max-width: 46ch; line-height: 1.5;
        }
        .acc-bridge-text strong {
          display: block; color: #fff; font-weight: 800; font-size: 15px; margin-bottom: 2px;
        }
        .acc-bridge-link {
          font-family: var(--font); font-size: 14px; font-weight: 800; white-space: nowrap;
          color: var(--texte); background: var(--jaune);
          padding: 10px 16px; border-radius: var(--radius-btn); text-decoration: none;
          transition: filter .15s ease;
        }
        .acc-bridge-link:hover { filter: brightness(.94); }

        .acc-reassure {
          display: flex; justify-content: center; flex-wrap: wrap; gap: 12px 26px;
          font-family: var(--font); font-size: 13.5px; font-weight: 800; color: var(--texte-muted);
        }

        @media (max-width: 600px) {
          .acc-grid { grid-template-columns: 1fr; }
          .acc-bridge { flex-direction: column; }
        }
      `}</style>

    </main>
  )
}
