import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Saturn Structure',
    short_name: 'Saturn',
    description: 'Structure your day, not your brain. An ADHD-friendly planner.',
    start_url: '/today',
    display: 'standalone',
    background_color: '#FAFAF9',
    theme_color: '#6366F1',
    orientation: 'portrait-primary',
    icons: [
      { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-maskable-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icons/icon-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    categories: ['productivity', 'lifestyle'],
  }
}
