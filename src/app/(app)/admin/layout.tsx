import AdminNav from "@components/features/admin/AdminNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <AdminNav />
      {children}
    </div>
  );
}
