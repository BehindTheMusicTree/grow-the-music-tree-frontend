import { Inter } from "next/font/google";
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GrowTheMusicTree",
  description: "The ultimate community-driven platform for exploring musical genres",
  icons: {
    icon: "/icons8-tree-16.png",
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
      <body className={inter.className}>{children}</body>
    </html>
  );
}
