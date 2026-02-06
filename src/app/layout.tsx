import { Inter } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";
import Providers from "@app/providers";
import { PopupProvider } from "@contexts/PopupContext";
import AppContent from "./AppContent";

export const metadata: Metadata = {
  title: "GrowTheMusicTree",
  description: "The ultimate community-driven platform for exploring musical genres",
  icons: {
    icon: "/icons8-tree-16.png",
  },
};

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <PopupProvider>
            <AppContent>{children}</AppContent>
          </PopupProvider>
        </Providers>
      </body>
    </html>
  );
}
