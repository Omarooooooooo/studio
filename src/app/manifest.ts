
import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Athkari - أذكاري',
    short_name: 'أذكاري',
    description: 'Your daily companion for Athkar, with personalized recommendations.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F0F4EF',
    theme_color: '#A7D1AB',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
