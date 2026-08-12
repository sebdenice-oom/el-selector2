import { getRaquettesFromShopify, getRaquettesAvecArchivesFromShopify } from '../../../lib/shopify'

export const dynamic = 'force-dynamic'

async function ecrireGitHub(owner, repo, token, path, data) {
  const contenu = JSON.stringify(data, null, 2)
  const contenuBase64 = Buffer.from(contenu).toString('base64')
  const urlFichier = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`

  const resFichier = await fetch(urlFichier, {
    headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/vnd.github+json' }
  })
  let sha = null
  if (resFichier.ok) { const d = await resFichier.json(); sha = d.sha }

  const body = {
    message: `chore: mise à jour ${path} ${new Date().toISOString().split('T')[0]}`,
    content: contenuBase64,
    ...(sha ? { sha } : {}),
  }

  const res = await fetch(urlFichier, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`GitHub error ${path}: ${res.status} — ${err}`)
  }
}

export async function GET(request) {
  try {
    const owner = process.env.GITHUB_REPO_OWNER || 'sebdenice-oom'
    // ⚠️ Le vrai dépôt est "el-selector2" (et non "el-selector") : sans ça le cron
    // committe dans le mauvais dépôt et le catalogue reste vide.
    const repo  = process.env.GITHUB_REPO_NAME  || 'el-selector2'
    const token = process.env.GITHUB_TOKEN

    if (!token) {
      return Response.json({ error: 'GITHUB_TOKEN manquant (à configurer dans les variables d\'environnement Vercel, avec droit d\'écriture sur le repo)' }, { status: 500 })
    }

    // 1. Récupérer les deux catalogues depuis Shopify
    console.log('Récupération catalogue actif...')
    const raquettes = await getRaquettesFromShopify()
    console.log(`${raquettes.length} raquettes actives`)

    console.log('Récupération catalogue avec archivées...')
    const raquettesArchive = await getRaquettesAvecArchivesFromShopify()
    console.log(`${raquettesArchive.length} raquettes total (avec archivées)`)

    // Garde-fou : ne jamais écraser le catalogue avec une liste vide
    // (une erreur/mauvaise config Shopify ne doit pas vider le catalogue en ligne).
    if (!Array.isArray(raquettes) || raquettes.length === 0) {
      return Response.json({
        error: 'Shopify a renvoyé 0 raquette active — écriture annulée pour ne pas vider le catalogue.',
      }, { status: 502 })
    }

    // 2. Écrire les deux fichiers sur GitHub
    await ecrireGitHub(owner, repo, token, 'public/catalogue.json', raquettes)
    if (Array.isArray(raquettesArchive) && raquettesArchive.length > 0) {
      await ecrireGitHub(owner, repo, token, 'public/catalogue-archive.json', raquettesArchive)
    }

    return Response.json({
      success: true,
      raquettes_actives: raquettes.length,
      raquettes_avec_archives: raquettesArchive.length,
      mise_a_jour: new Date().toISOString(),
    })

  } catch (err) {
    console.error('Cron catalogue error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
