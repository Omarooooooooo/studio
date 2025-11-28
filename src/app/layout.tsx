
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AthkarProvider } from '@/context/AthkarContext';
import { type Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Athkari - اذكاري',
  description: 'Your daily companion for Athkar, with personalized recommendations.',
  manifest: '/manifest.json', // This will now point to the dynamically generated manifest
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#A7D1AB' },
    { media: '(prefers-color-scheme: dark)', color: '#4D8554' },
  ],
}

const THEME_STORAGE_KEY = 'athkari-theme';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeScript = `
    (function() {
      try {
        const theme = localStorage.getItem('${THEME_STORAGE_KEY}');
        if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } catch (e) {
        console.error('Error applying initial theme:', e);
      }
    })();
  `;

  return (
    <html 
      lang="ar" 
      dir="rtl" 
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning={true}
    >
      <head>
        {/* The theme-color meta tags are now handled by the viewport object */}
      </head>
      <body className="antialiased bg-background text-foreground">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <AthkarProvider>
          {children}
        </AthkarProvider>
        <Toaster />
      </body>
    </html>
  );
}
