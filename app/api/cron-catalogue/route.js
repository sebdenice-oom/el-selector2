import { getRaquettesFromShopify } from '../../../lib/shopify'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    // Vérification du secret cron
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return Response.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // 1. Récupérer le catalogue depuis Shopify
    console.log('Début récupération catalogue Shopify...')
    const raquettes = await getRaquettesFromShopify()
    console.log(`${raquettes.length} raquettes récupérées`)

    // 2. Écrire le fichier sur GitHub via l'API
    const owner = process.env.GITHUB_REPO_OWNER || 'sebdenice-oom'
    const repo  = process.env.GITHUB_REPO_NAME  || 'el-selector'
    const path  = 'public/catalogue.json'
    const token = process.env.GITHUB_TOKEN

    if (!token) {
      return Response.json({ error: 'GITHUB_TOKEN manquant' }, { status: 500 })
    }

    const contenu = JSON.stringify(raquettes, null, 2)
    const contenuBase64 = Buffer.from(contenu).toString('base64')

    // Récupérer le SHA du fichier actuel (requis pour la mise à jour)
    const urlFichier = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`
    const resFichier = await fetch(urlFichier, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
      }
    })

    let sha = null
    if (resFichier.ok) {
      const data = await resFichier.json()
      sha = data.sha
    }

    // Écrire le fichier sur GitHub
    const body = {
      message: `chore: mise à jour catalogue ${new Date().toISOString().split('T')[0]}`,
      content: contenuBase64,
      ...(sha ? { sha } : {}),
    }

    const resEcriture = await fetch(urlFichier, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!resEcriture.ok) {
      const err = await resEcriture.text()
      throw new Error(`GitHub API error: ${resEcriture.status} — ${err}`)
    }

    return Response.json({
      success: true,
      raquettes: raquettes.length,
      mise_a_jour: new Date().toISOString(),
    })

  } catch (err) {
    console.error('Cron catalogue error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
