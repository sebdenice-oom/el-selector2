import { getRaquettesFromShopify, getRaquettesAvecArchivesFromShopify } from '../../../lib/shopify'

export const dynamic = 'force-dynamic'

async function ecrireGitHub(owner, repo, token, path, data) {
  const contenu = JSON.stringify(data, null, 2)
  const contenuBase64 = Buffer.from(contenu).toString('base64')
  const urlFichier = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/vnd.github+json',
    'Content-Type': 'application/json',
  }

  // Toujours récupérer le SHA actuel juste avant d'écrire
  let sha = null
  try {
    const resFichier = await fetch(urlFichier, { headers })
    if (resFichier.ok) {
      const d = await resFichier.json()
      sha = d.sha
    }
  } catch(e) {}

  const body = {
    message: `chore: mise à jour ${path} ${new Date().toISOString().split('T')[0]}`,
    content: contenuBase64,
    ...(sha ? { sha } : {}),
  }

  const res = await fetch(urlFichier, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  })

  // En cas de conflit 409, réessayer en récupérant le SHA frais
  if (res.status === 409) {
    const resFrais = await fetch(urlFichier, { headers })
    if (resFrais.ok) {
      const d = await resFrais.json()
      const bodyRetry = { ...body, sha: d.sha }
      const resRetry = await fetch(urlFichier, {
        method: 'PUT', headers,
        body: JSON.stringify(bodyRetry),
      })
      if (!resRetry.ok) {
        const err = await resRetry.text()
        throw new Error(`GitHub error ${path}: ${resRetry.status} — ${err}`)
      }
      return
    }
  }

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`GitHub error ${path}: ${res.status} — ${err}`)
  }
}

export async function GET(request) {
  try {
    const owner = process.env.GITHUB_REPO_OWNER || 'sebdenice-oom'
    const repo  = process.env.GITHUB_REPO_NAME  || 'el-selector'
    const token = process.env.GITHUB_TOKEN

    if (!token) {
      return Response.json({ error: 'GITHUB_TOKEN manquant' }, { status: 500 })
    }

    // 1. Récupérer les deux catalogues depuis Shopify
    console.log('Récupération catalogue actif...')
    const raquettes = await getRaquettesFromShopify()
    console.log(`${raquettes.length} raquettes actives`)

    console.log('Récupération catalogue avec archivées...')
    const raquettesArchive = await getRaquettesAvecArchivesFromShopify()
    console.log(`${raquettesArchive.length} raquettes total (avec archivées)`)

    // 2. Écrire les deux fichiers sur GitHub
    await ecrireGitHub(owner, repo, token, 'public/catalogue.json', raquettes)
    await ecrireGitHub(owner, repo, token, 'public/catalogue-archive.json', raquettesArchive)

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
