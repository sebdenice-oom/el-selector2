import { getRaquettes } from '../../../lib/shopify'
import { scoreRaquettes } from '../../../lib/scoring'

export const dynamic = 'force-dynamic'

// Profils de test représentatifs
const PROFILS_TEST = [
  { genre: 'Homme', niveau: 'debutant',      budget: 100,  budgetIllimite: false, sensation: ['confort'] },
  { genre: 'Homme', niveau: 'debutant',      budget: 200,  budgetIllimite: false, sensation: ['maniabilite'] },
  { genre: 'Homme', niveau: 'intermediaire', budget: 200,  budgetIllimite: false, sensation: ['controle'] },
  { genre: 'Homme', niveau: 'intermediaire', budget: 300,  budgetIllimite: false, sensation: ['puissance', 'controle'] },
  { genre: 'Homme', niveau: 'avance',        budget: 300,  budgetIllimite: false, sensation: ['puissance'] },
  { genre: 'Homme', niveau: 'avance',        budget: 500,  budgetIllimite: false, sensation: ['spin', 'controle'] },
  { genre: 'Homme', niveau: 'competition',   budget: 99999, budgetIllimite: true,  sensation: ['puissance', 'spin'] },
  { genre: 'Femme', niveau: 'debutant',      budget: 150,  budgetIllimite: false, sensation: ['confort'] },
  { genre: 'Femme', niveau: 'intermediaire', budget: 250,  budgetIllimite: false, sensation: ['maniabilite', 'controle'] },
  { genre: 'Femme', niveau: 'avance',        budget: 400,  budgetIllimite: false, sensation: ['puissance'] },
  { genre: 'Junior', niveau: 'debutant',     budget: 100,  budgetIllimite: false, sensation: ['maniabilite'] },
  { genre: 'Homme', niveau: 'intermediaire', budget: 150,  budgetIllimite: false, sensation: ['tolerance'] },
]

export async function GET() {
  try {
    const raquettes = await getRaquettes()
    const resultats = []
    let epsCount = 0

    for (const quiz of PROFILS_TEST) {
      const scored = scoreRaquettes(raquettes, quiz, 10)
      const top1 = scored[0]
      const eps = scored.find(r => r.isEPS)

      resultats.push({
        profil: `${quiz.genre} / ${quiz.niveau} / ${quiz.budgetIllimite ? 'illimité' : quiz.budget + '€'} / ${quiz.sensation.join('+')}`,
        nb_resultats: scored.filter(r => !r.isEPS).length,
        top1: top1 ? `${top1.title} (${top1.scoreFinal}%)` : 'aucun',
        eps_apparait: !!eps,
        eps: eps ? `${eps.title} (${eps.scoreFinal}% / marge ${Math.round(eps.scoreMarge || 0)}%)` : '—',
      })

      if (eps) epsCount++
    }

    const frequence = Math.round((epsCount / PROFILS_TEST.length) * 100)

    return Response.json({
      frequence_apparition: `${frequence}% (${epsCount}/${PROFILS_TEST.length} profils)`,
      seuil_marge_actuel: '30%',
      detail: resultats,
    })

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
