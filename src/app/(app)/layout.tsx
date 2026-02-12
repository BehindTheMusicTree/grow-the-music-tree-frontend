import Providers from "@app/providers";
import AppContent from "@app/AppContent";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <AppContent>{children}</AppContent>
    </Providers>
  );
}
