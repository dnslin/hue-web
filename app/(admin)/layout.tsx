import { AdminLayout } from "@/components/layouts/AdminLayout";
import { ProtectedRoute } from "@/components/shared/ProtectedRoute";
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
