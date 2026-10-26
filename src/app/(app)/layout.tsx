import { Toaster } from "sonner";
import Providers from "@app/providers";
import AppContent from "@app/AppContent";
import BlockingOverlay from "@components/ui/BlockingOverlay";
import Analytics from "@components/features/analytics/Analytics";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <AppContent>{children}</AppContent>
      <Toaster />
      <BlockingOverlay />
      <Analytics />
    </Providers>
  );
}
