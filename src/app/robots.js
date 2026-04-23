export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/dashboard/',
    },
    sitemap: 'https://mesenlladorio-c8gr.vercel.app/sitemap.xml',
  }
}
