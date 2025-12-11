
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { type Viewport } from 'next';
import { FirebaseClientProvider } from "@/firebase/client-provider";

export const metadata: Metadata = {
  title: 'Athkari - اذكاري',
  description: 'Your daily companion for Athkar, with personalized recommendations.',
  manifest: '/site.webmanifest', 
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
  // This script is essential to avoid the "flash of incorrect theme" (FOIT).
  // It runs before React hydrates, so it's faster than a useEffect.
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
        // Ignore errors in case localStorage is not available
      }
    })();
  `;

  return (
    <html 
      lang="ar" 
      dir="rtl" 
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning={true} // Important because we are setting the theme class manually
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="msapplication-TileColor" content="#A7D1AB" />
        <meta name="msapplication-TileImage" content="/ms-icon-144x144.png" />
        
      </head>
      <body className="antialiased bg-background text-foreground">
        <FirebaseClientProvider>
          {children}
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
