import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

// Removed incorrect initialization of geistSans and geistMono
// const geistSans = GeistSans({ ... });
// const geistMono = GeistMono({ ... });
// We will use the imported GeistSans and GeistMono objects directly.

export const metadata: Metadata = {
  title: 'Athkari - اذكاري',
  description: 'Your daily companion for Athkar, with personalized recommendations.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      {/*
        The GeistSans.variable and GeistMono.variable are class names
        that set up the CSS variables --font-geist-sans and --font-geist-mono.
        The body tag's font-family is handled by globals.css using these variables.
      */}
      <body className="antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
