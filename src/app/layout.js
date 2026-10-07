import { Plus_Jakarta_Sans } from 'next/font/google';
import Script from 'next/script';
import { cookies } from 'next/headers';
import './globals.css';
import StoreProvider from '../store/StoreProvider';
import AuthProvider from '../components/auth/AuthProvider';
import { ToastProvider } from '../components/common/ToastProvider';
import { siteConfig } from '../config/site';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});


export const metadata = {
  title: {
    template: `${siteConfig.name} | %s`,
    default: `${siteConfig.name} - ${siteConfig.tagline}`,
  },
  description: siteConfig.description,
  icons: {
    icon: [
      {
        url: '/brand/icon.png',
        type: 'image/png',
      },
    ],
  },
};

const themeScript = `
  (function () {
    try {
      var theme = localStorage.getItem('theme');

      if (
        theme === 'dark' ||
        (!theme &&
          window.matchMedia('(prefers-color-scheme: dark)').matches)
      ) {
        document.documentElement.classList.add('dark');
      }
    } catch (e) {}
  })();
`;

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const hasSession = Boolean(cookieStore.get('ACCESS_TOKEN')?.value);

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Script id="theme-script" strategy="beforeInteractive">
          {themeScript}
        </Script>

        <StoreProvider hasSession={hasSession}>
          <AuthProvider hasSession={hasSession}>
            <ToastProvider>
              {children}
            </ToastProvider>
          </AuthProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
