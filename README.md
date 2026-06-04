# El Selector — Guide de déploiement

## Variables d'environnement à configurer sur Vercel

| Variable | Valeur |
|---|---|
| `SHOPIFY_STORE_DOMAIN` | `esprit-padel-shop.myshopify.com` |
| `SHOPIFY_ADMIN_API_TOKEN` | Votre token (dans credentials-el-selector.txt) |
| `SHOPIFY_API_VERSION` | `2026-04` |
| `KLAVIYO_PRIVATE_KEY` | Votre clé Klaviyo (dans credentials-el-selector.txt) |
| `CRON_SECRET` | Un mot de passe aléatoire de votre choix |

## Structure des métachamps Shopify utilisés

### Produits
- `custom.schema` — JSON : notes El Comparateur
- `custom.genre` — Liste : Homme / Femme / Junior / Unisexe
- `custom.poids` — Liste : fourchettes de poids
- `custom.rotation` — Entier : ventes 90 jours (mis à jour chaque nuit)

### Clients
- `custom.profil_selector` — JSON : profil quiz du client

## Cron job rotation
Le job `/api/cron-rotation` tourne automatiquement chaque nuit à 3h via Vercel Crons.
Il calcule les ventes sur 90 jours via ShopifyQL et met à jour le métachamp `rotation`.
