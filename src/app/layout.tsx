import type { Metadata } from 'next';
import './globals.css';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import SiteFooter from '@/components/SiteFooter';

export const metadata: Metadata = {
  title: 'LectioToday — Daily reflection',
  description: 'A single quiet space for one passage and a gentle discussion.',
  manifest: '/manifest.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-[#0b0b0f] text-zinc-100 flex flex-col">
        <ServiceWorkerRegister />
        <div className="flex-1">
          {children}
        </div>
        <SiteFooter />
      </body>
    </html>
  );
}
