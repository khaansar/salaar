import { Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import { cookies } from "next/headers";
import "./globals.css";
import StoreProvider from "../store/StoreProvider";
import AuthProvider from "../components/auth/AuthProvider";
import { ToastProvider } from "../components/common/ToastProvider";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata = {
  title: "TestHub",
  description: "TestHub examination platform",
};

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const userRole = cookieStore.get('user_role')?.value;

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plusJakartaSans.variable} h-full antialiased`}
    >
      <head>
        <script
          id="theme-script"
          dangerouslySetInnerHTML={{
            __html: `
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
            `,
          }}
        />
      </head>

      <body className="min-h-full flex flex-col">
        <StoreProvider initialRole={userRole}>
          <AuthProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </AuthProvider>
        </StoreProvider>
      </body>
    </html>
  );
}