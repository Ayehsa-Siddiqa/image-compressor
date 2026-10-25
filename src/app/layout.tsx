import type { Metadata, Viewport } from "next";
import { Kumbh_Sans } from "next/font/google";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { siteConfig } from "@/config/site";
import { themeInitScript } from "@/lib/theme";
import "./globals.css";

// Headings use Kumbh Sans; body text and subheadings use Arial (see globals.css).
const kumbhSans = Kumbh_Sans({
  variable: "--font-kumbh-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  // Set NEXT_PUBLIC_SITE_URL in production so social preview images resolve to absolute URLs.
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL) : undefined,
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary",
    title: siteConfig.title,
    description: siteConfig.description,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1220" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: the theme script adds the `dark` class to <html> before React hydrates.
    // data-scroll-behavior lets Next.js turn off smooth scrolling during route changes (it's on for in-page anchors).
    <html lang="en" className={`${kumbhSans.variable} antialiased`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-dvh flex-col bg-page">
        <a
          href="#main"
          className="sr-only z-50 rounded-full bg-primary px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
