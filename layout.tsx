import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SAV Dunkirk Informatique - Prise en charge & Suivi Atelier',
  description:
    'Application de gestion des dépôts, fiches de prise en charge SAV et synchronisation Baserow pour Dunkirk Informatique.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="dark">
      <body className="antialiased min-h-screen selection:bg-amber-400 selection:text-slate-950 font-sans">
        {children}
      </body>
    </html>
  );
}
