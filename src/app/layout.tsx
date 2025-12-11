
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { type Viewport } from 'next';
import { StoreInitializer } from '@/store/StoreInitializer';

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
        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" sizes="57x57" href="/apple-icon-57x57.png" />
        <link rel="apple-touch-icon" sizes="60x60" href="/apple-icon-60x60.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="/apple-icon-72x72.png" />
        <link rel="apple-touch-icon" sizes="76x76" href="/apple-icon-76x76.png" />
        <link rel="apple-touch-icon" sizes="114x114" href="/apple-icon-114x114.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/apple-icon-120x120.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/apple-icon-144x144.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/apple-icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon-180x180.png" />

        {/* Android/Chrome Icons */}
        <link rel="icon" type="image/png" sizes="192x192" href="/android-icon-192x192.png" />

        {/* Standard Favicons */}
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />

        {/* Windows Tile Icons */}
        <meta name="msapplication-TileColor" content="#A7D1AB" />
        <meta name="msapplication-TileImage" content="/ms-icon-144x144.png" />
        
        {/* The theme-color meta tags are now handled by the viewport object */}
      </head>
      <body className="antialiased bg-background text-foreground">
        <StoreInitializer />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
          {children}
        <Toaster />
      </body>
    </html>
  );
}
