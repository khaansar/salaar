export const siteConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME,
  shortName: process.env.NEXT_PUBLIC_APP_NAME,
  tagline: process.env.NEXT_PUBLIC_APP_TAGLINE,
  description: process.env.NEXT_PUBLIC_APP_DESCRIPTION,
  logo: '/brand/icon.png',
  fullLogo: '/brand/icon.png',
  formatTitle: (pageTitle) => {
    const brand = process.env.NEXT_PUBLIC_APP_NAME;
    return pageTitle ? `${brand} | ${pageTitle}` : brand;
  },
};
