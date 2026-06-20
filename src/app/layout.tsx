import { Analytics } from "@vercel/analytics/next";
import { Inter } from "next/font/google";
import type { Metadata, Viewport } from "next";
import { APP_NAME } from "@constants/app";
import growTheMusicTreeFavicon from "@behindthemusictree/assets/favicons/grow-the-music-tree/favicon.svg";
import "./globals.css";
import "@behindthemusictree/assets/styles/icon-links.css";

const faviconUrl = typeof growTheMusicTreeFavicon === "string" ? growTheMusicTreeFavicon : growTheMusicTreeFavicon.src;

export const metadata: Metadata = {
  title: APP_NAME,
  description: "The ultimate community-driven platform for exploring musical genres",
  icons: {
    icon: [{ url: faviconUrl, type: "image/svg+xml" }],
    shortcut: faviconUrl,
    apple: faviconUrl,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  fallback: ["system-ui", "sans-serif"],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
