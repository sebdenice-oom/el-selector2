import { getRaquettes } from '../../../lib/shopify'
import { scoreRaquettesUpgrade } from '../../../lib/scoring-upgrade'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const raquettes = await getRaquettes()

    if (!raquettes.length) {
      return Response.json({ error: 'Catalogue vide' }, { status: 500 })
    }

    // Prendre 5 vraies raquettes du catalogue comme point de départ
    // On filtre celles qui ont un schéma complet
    const raquettesAvecSchema = raquettes.filter(r =>
      r.schema && Object.keys(r.schema).length >= 5 && r.stock > 0
    )

    // Prendre 5 raquettes réparties dans le catalogue (début, milieu, fin)
    const indices = [0, Math.floor(raquettesAvecSchema.length * 0.25),
                     Math.floor(raquettesAvecSchema.length * 0.5),
                     Math.floor(raquettesAvecSchema.length * 0.75),
                     raquettesAvecSchema.length - 1]

    const raquettesTest = indices.map(i => raquettesAvecSchema[i]).filter(Boolean)

    const resultats = []
    let epsCount = 0

    for (const raquette of raquettesTest) {
      const prixRef = raquette.compareAtPrice || raquette.price

      // Test 1 : raquette similaire (cibles = valeurs actuelles)
      const ciblesInitiales = { ...raquette.schema }

      // Test 2 : on booste la caractéristique la plus basse de +15
      const dimMinKey = Object.entries(raquette.schema)
        .sort((a, b) => a[1] - b[1])[0]?.[0]
      const ciblesModifiees = { ...raquette.schema }
      if (dimMinKey) ciblesModifiees[dimMinKey] = Math.min(100, (raquette.schema[dimMinKey] || 0) + 15)

      // Score avec cibles similaires
      const scored = scoreRaquettesUpgrade(
        raquettes, ciblesModifiees, ciblesInitiales,
        prixRef, raquette.id, 12
      )

      const top1 = scored[0]
      const eps = scored.find(r => r.isEPS)

      resultats.push({
        raquette_de_depart: raquette.title,
        prix_ref: `${prixRef}€`,
        critere_booste: dimMinKey ? `${dimMinKey} +15` : '—',
        nb_resultats: scored.length,
        top1: top1 ? `${top1.title} (${top1.scoreFinal}%)` : 'aucun',
        eps_apparait: !!eps,
        eps_raquette: eps ? eps.title : '—',
        eps_score: eps ? `${eps.scoreFinal}%` : '—',
        ecart_top1: eps && top1 ? `${top1.scoreFinal - eps.scoreFinal} pts` : '—',
      })

      if (eps) epsCount++
    }

    return Response.json({
      catalogue_raquettes: raquettes.length,
      raquettes_avec_schema: raquettesAvecSchema.length,
      frequence_EPS: `${epsCount}/${raquettesTest.length} profils (${Math.round(epsCount / raquettesTest.length * 100)}%)`,
      seuils: { marge_min: '50%', ecart_max_top1: '10pts', score_min: '60%' },
      resultats,
    })

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
