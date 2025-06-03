import { AdminLayout } from "@/components/layouts/admin-layout";
import { ProtectedRoute } from "@/components/shared/protected-route";
import "@/styles/admin.css";

export default function AdminLayoutPage({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <AdminLayout>{children}</AdminLayout>
    </ProtectedRoute>
  );
}
