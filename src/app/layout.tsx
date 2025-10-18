import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LectioToday',
  description: 'Daily wisdom from ancient Stoic philosophers',
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
