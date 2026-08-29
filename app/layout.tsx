import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mezmur Lyrics',
  description: 'Ethiopian Orthodox Tewahedo hymn lyrics management app',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
