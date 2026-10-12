import type { Metadata } from 'next';
import './globals.css';
import './care.css';
import DemoToolbar from '@/components/DemoToolbar';

export const metadata: Metadata = {
  title: 'Vins Care · Il tuo percorso di cura',
  description: 'Dialogo con il team, cartella condivisa, diario, esami, consensi e monitoraggio nel tuo percorso di cura.',
  manifest: '/manifest.webmanifest',
  icons: { icon: '/favicon.svg', apple: '/icons/icon-192.png' },
  appleWebApp: { capable: true, title: 'Vins Care', statusBarStyle: 'default' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it">
      <body><DemoToolbar/>{children}</body>
    </html>
  );
}
