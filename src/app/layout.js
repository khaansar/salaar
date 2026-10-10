import { Plus_Jakarta_Sans } from "next/font/google";

import "./globals.css";

import StoreProvider from "../store/StoreProvider";
import AuthProvider from "../components/auth/AuthProvider";
import { ToastProvider } from "../components/common/ToastProvider";
import { siteConfig } from "@/config/site";

/**
 * Load the application's primary font and expose it through a CSS variable
 * so that the existing global styles and components can use it consistently.
 */
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

/**
 * Root document metadata shared by the Salaar frontend.
 */
export const metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
};

/**
 * The root layout defines the HTML document and mounts the application-wide
 * providers required by pages throughout the application.
 *
 * Theme initialization is intentionally not performed through an inline
 * script here. The application's client-side theme hook is responsible for
 * restoring the user's saved theme and updating the HTML document class.
 */
export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <StoreProvider>
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