import { siteConfig } from '@/config/site';

export default function robots() {
  const rules = [
    {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin-dashboard/',
        '/attempt/',
        '/history/',
        '/settings/',
      ],
    },
  ];

  return {
    rules,
    ...(siteConfig.url && {
      sitemap: new URL('/sitemap.xml', `${siteConfig.url}/`).toString(),
    }),
  };
}