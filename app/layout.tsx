import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'Smart Leave Planner',
  description: 'Maximize your annual leave with AI-powered optimization',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Leave Planner',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#FAFAF7',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-beige-50">
        <main className="max-w-md mx-auto min-h-screen relative pb-24">
          {children}
        </main>
        <div className="max-w-md mx-auto">
          <Navigation />
        </div>
      </body>
    </html>
  );
}
