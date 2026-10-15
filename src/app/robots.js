import { siteConfig } from '@/config/site';

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    ...(siteConfig.url
      ? {
          sitemap: new URL('/sitemap.xml', `${siteConfig.url}/`).toString(),
        }
      : {}),
  };
}
