import { getRaquettes } from '../../../lib/shopify'
import { scoreRaquettesUpgrade } from '../../../lib/scoring-upgrade'

export const dynamic = 'force-dynamic'

// Profils de test : raquette actuelle + cibles
const PROFILS_TEST = [
  {
    label: 'Homme intermédiaire / veut plus de puissance',
    raquetteActuelle: { id: 'test1', schema: { Puissance: 70, Confort: 75, Spin: 72, Contrôle: 68, Tolérance: 74, Maniabilité: 71 }, price: 180, compareAtPrice: 220, genre: 'Homme' },
    cibles: { Puissance: 85, Confort: 75, Spin: 72, Contrôle: 68, Tolérance: 74, Maniabilité: 71 },
    ciblesInitiales: { Puissance: 70, Confort: 75, Spin: 72, Contrôle: 68, Tolérance: 74, Maniabilité: 71 },
    prixReference: 220,
  },
  {
    label: 'Homme avancé / veut plus de contrôle',
    raquetteActuelle: { id: 'test2', schema: { Puissance: 85, Confort: 65, Spin: 78, Contrôle: 72, Tolérance: 65, Maniabilité: 68 }, price: 250, compareAtPrice: 300, genre: 'Homme' },
    cibles: { Puissance: 85, Confort: 65, Spin: 78, Contrôle: 88, Tolérance: 65, Maniabilité: 68 },
    ciblesInitiales: { Puissance: 85, Confort: 65, Spin: 78, Contrôle: 72, Tolérance: 65, Maniabilité: 68 },
    prixReference: 300,
  },
  {
    label: 'Femme intermédiaire / raquette similaire',
    raquetteActuelle: { id: 'test3', schema: { Puissance: 65, Confort: 80, Spin: 68, Contrôle: 74, Tolérance: 80, Maniabilité: 78 }, price: 150, compareAtPrice: 180, genre: 'Femme' },
    cibles: { Puissance: 65, Confort: 80, Spin: 68, Contrôle: 74, Tolérance: 80, Maniabilité: 78 },
    ciblesInitiales: { Puissance: 65, Confort: 80, Spin: 68, Contrôle: 74, Tolérance: 80, Maniabilité: 78 },
    prixReference: 180,
  },
  {
    label: 'Homme compétition / veut plus de spin',
    raquetteActuelle: { id: 'test4', schema: { Puissance: 90, Confort: 60, Spin: 75, Contrôle: 80, Tolérance: 60, Maniabilité: 65 }, price: 300, compareAtPrice: 350, genre: 'Homme' },
    cibles: { Puissance: 90, Confort: 60, Spin: 90, Contrôle: 80, Tolérance: 60, Maniabilité: 65 },
    ciblesInitiales: { Puissance: 90, Confort: 60, Spin: 75, Contrôle: 80, Tolérance: 60, Maniabilité: 65 },
    prixReference: 350,
  },
  {
    label: 'Homme débutant / veut plus de confort',
    raquetteActuelle: { id: 'test5', schema: { Puissance: 60, Confort: 70, Spin: 65, Contrôle: 68, Tolérance: 72, Maniabilité: 74 }, price: 120, compareAtPrice: 150, genre: 'Homme' },
    cibles: { Puissance: 60, Confort: 85, Spin: 65, Contrôle: 68, Tolérance: 72, Maniabilité: 74 },
    ciblesInitiales: { Puissance: 60, Confort: 70, Spin: 65, Contrôle: 68, Tolérance: 72, Maniabilité: 74 },
    prixReference: 150,
  },
]

export async function GET() {
  try {
    const raquettes = await getRaquettes()
    const resultats = []
    let epsCount = 0

    for (const profil of PROFILS_TEST) {
      const scored = scoreRaquettesUpgrade(
        raquettes,
        profil.cibles,
        profil.ciblesInitiales,
        profil.prixReference,
        profil.raquetteActuelle.id,
        12
      )

      const top1 = scored[0]
      const eps = scored.find(r => r.isEPS)

      resultats.push({
        profil: profil.label,
        nb_resultats: scored.length,
        top1: top1 ? `${top1.title} (${top1.scoreFinal}%)` : 'aucun',
        eps_apparait: !!eps,
        eps_raquette: eps ? `${eps.title}` : '—',
        eps_score: eps ? `${eps.scoreFinal}%` : '—',
        ecart_top1: eps ? `${top1.scoreFinal - eps.scoreFinal} pts` : '—',
      })

      if (eps) epsCount++
    }

    return Response.json({
      catalogue_raquettes: raquettes.length,
      frequence_EPS: `${epsCount}/${PROFILS_TEST.length} profils (${Math.round(epsCount / PROFILS_TEST.length * 100)}%)`,
      seuils: { marge_min: '50%', ecart_max_top1: '10pts', score_min: '60%' },
      resultats,
    })

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
