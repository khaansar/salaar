export const siteConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'Ace-it',
  shortName: 'Ace-it',
  tagline: 'Till you land it',
  description: 'Ace-it — Till you land it. Comprehensive mock tests and real exam practice platform.',
  logo: '/brand/icon.png',
  fullLogo: '/brand/logo.png',
  formatTitle: (pageTitle) => {
    const brand = process.env.NEXT_PUBLIC_APP_NAME || 'Ace-it';
    return pageTitle ? `${brand} | ${pageTitle}` : brand;
  },
};
