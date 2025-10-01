import { Inter } from "next/font/google";
import { metadata } from "./metadata";
import "./globals.css";
import Providers from "@app/providers";
import { PopupProvider } from "@contexts/PopupContext";
import AppContent from "./AppContent";

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
