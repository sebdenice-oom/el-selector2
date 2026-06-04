// lib/klaviyo.js
// Injection Klaviyo — server-side uniquement

const KLAVIYO_API = 'https://a.klaviyo.com/api'
const REVISION = '2024-10-15'

function klaviyoHeaders() {
  return {
    'Authorization': `Klaviyo-API-Key ${process.env.KLAVIYO_PRIVATE_KEY}`,
    'Content-Type': 'application/json',
    'revision': REVISION,
  }
}

// Enrichit le profil Klaviyo avec les données quiz
export async function identifyProfile(email, quizData, topRaquettes) {
  if (!email) return

  const payload = {
    data: {
      type: 'profile',
      attributes: {
        email,
        properties: {
          selector_niveau: quizData.niveau,
          selector_genre: quizData.genre,
          selector_budget: quizData.budget,
          selector_sensation: quizData.sensation,
          selector_date_quiz: new Date().toISOString(),
          selector_top1_id: topRaquettes[0]?.id || '',
          selector_top1_titre: topRaquettes[0]?.title || '',
          selector_top1_url: topRaquettes[0]?.url || '',
          selector_top1_image: topRaquettes[0]?.image || '',
          selector_top1_prix: topRaquettes[0]?.price || 0,
        }
      }
    }
  }

  const res = await fetch(`${KLAVIYO_API}/profiles/`, {
    method: 'POST',
    headers: klaviyoHeaders(),
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('Klaviyo identify error:', err)
  }
}

// Envoie l'événement "Quiz Selector Complété"
export async function trackQuizComplete(email, quizData, topRaquettes) {
  if (!email) return

  const payload = {
    data: {
      type: 'event',
      attributes: {
        metric: { data: { type: 'metric', attributes: { name: 'Quiz Selector Complété' } } },
        profile: { data: { type: 'profile', attributes: { email } } },
        properties: {
          niveau: quizData.niveau,
          genre: quizData.genre,
          budget: quizData.budget,
          sensation: quizData.sensation,
          nb_resultats: topRaquettes.length,
          raquettes_recommandees: topRaquettes.slice(0, 3).map(r => ({
            id: r.id,
            titre: r.title,
            prix: r.price,
            url: r.url,
            image: r.image,
            score: r.scoreFinal,
          })),
        },
        time: new Date().toISOString(),
      }
    }
  }

  const res = await fetch(`${KLAVIYO_API}/events/`, {
    method: 'POST',
    headers: klaviyoHeaders(),
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('Klaviyo track error:', err)
  }
}
