import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MEDAI BLACK BOX - Medical AI Forensics',
  description: 'Interactive forensic laboratory for auditing medical AI - Can you trust the AI?',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🔍</text></svg>',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gradient-to-br from-noir to-slate">
          {children}
        </div>
      </body>
    </html>
  );
}
