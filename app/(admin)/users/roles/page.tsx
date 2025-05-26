import { Metadata } from "next";
import { DashboardContainer } from "@/components/dashboard/DashboardContainer";
import { RoleList } from "@/components/admin/roles/RoleList";

export const metadata: Metadata = {
  title: "角色权限管理 - Lsky Pro",
  description: "管理系统角色和权限，设置用户访问控制",
};

export default function RolesPage() {
  return (
    <DashboardContainer>
      <RoleList />
    </DashboardContainer>
  );
}
