import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  ),
  title: 'LectioToday — Daily reflections',
  description:
    'A sleek, quiet space for daily philosophical and religious passages with gentle discussion.',
  openGraph: {
    type: 'website',
    title: 'LectioToday',
    description: 'Daily passages + discussion',
    images: ['/og/default.png'],
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
