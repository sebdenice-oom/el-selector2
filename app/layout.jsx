// app/layout.jsx
import './globals.css'

export const metadata = {
  title: 'El Selector — Trouvez votre raquette idéale',
  description: 'Répondez à 4 questions et découvrez les raquettes faites pour vous.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
