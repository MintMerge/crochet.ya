import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Crochet Ya | Handmade Crochet Products',
    short_name: 'Crochet Ya',
    description: 'Discover beautiful handmade crochet products - amigurumi, accessories, home decor and more.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFF5F0',
    theme_color: '#FF8C69',
    icons: [
      {
        src: '/icon',
        sizes: '32x32',
        type: 'image/png',
      },
    ],
  }
}
