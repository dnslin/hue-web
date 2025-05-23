import { AdminLayout } from "@/components/layouts/AdminLayout";
import "@/styles/admin.css";

export default function AdminLayoutPage({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}
