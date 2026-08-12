import { getRaquettes } from '../../../lib/shopify'
import { scoreRaquettes } from '../../../lib/scoring'

export const dynamic = 'force-dynamic'

const PROFILS_TEST = [
  { genre: 'Homme', niveau: 'debutant',      budget: 100,   budgetIllimite: false, sensation: ['confort'] },
  { genre: 'Homme', niveau: 'intermediaire', budget: 200,   budgetIllimite: false, sensation: ['controle'] },
  { genre: 'Homme', niveau: 'intermediaire', budget: 300,   budgetIllimite: false, sensation: ['puissance', 'controle'] },
  { genre: 'Homme', niveau: 'avance',        budget: 300,   budgetIllimite: false, sensation: ['puissance'] },
  { genre: 'Homme', niveau: 'competition',   budget: 99999, budgetIllimite: true,  sensation: ['puissance', 'spin'] },
  { genre: 'Femme', niveau: 'debutant',      budget: 150,   budgetIllimite: false, sensation: ['confort'] },
  { genre: 'Femme', niveau: 'intermediaire', budget: 250,   budgetIllimite: false, sensation: ['maniabilite'] },
  { genre: 'Junior', niveau: 'debutant',     budget: 100,   budgetIllimite: false, sensation: ['maniabilite'] },
  { genre: 'Homme', niveau: 'intermediaire', budget: 150,   budgetIllimite: false, sensation: ['tolerance'] },
  { genre: 'Homme', niveau: 'avance',        budget: 500,   budgetIllimite: false, sensation: ['spin', 'controle'] },
]

export async function GET() {
  try {
    const raquettes = await getRaquettes()
    const resultats = []
    let epsCount = 0

    for (const quiz of PROFILS_TEST) {
      const scored = scoreRaquettes(raquettes, quiz, 12)
      const top1 = scored[0]
      const eps = scored.find(r => r.isEPS)

      resultats.push({
        profil: `${quiz.genre} / ${quiz.niveau} / ${quiz.budgetIllimite ? 'illimité' : quiz.budget + '€'} / ${quiz.sensation.join('+')}`,
        nb_resultats: scored.length,
        top1: top1 ? `${top1.title} (${top1.scoreFinal}%)` : 'aucun',
        eps_apparait: !!eps,
        eps_raquette: eps ? `${eps.title}` : '—',
        eps_score: eps ? `${eps.scoreFinal}%` : '—',
        eps_marge: eps ? `${Math.round(eps.scoreMarge || 0)}%` : '—',
        ecart_top1: eps ? `${top1.scoreFinal - eps.scoreFinal} pts` : '—',
      })

      if (eps) epsCount++
    }

    return Response.json({
      catalogue_raquettes: raquettes.length,
      frequence_EPS: `${epsCount}/${PROFILS_TEST.length} profils (${Math.round(epsCount/PROFILS_TEST.length*100)}%)`,
      seuils: { marge_min: '50%', ecart_max_top1: '10pts', score_min: '60%' },
      resultats,
    })

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
