import { Metadata } from "next";
import { DashboardContainer } from "@/components/dashboard/DashboardContainer";
import { UserList } from "@/components/admin/users/UserList";

export const metadata: Metadata = {
  title: "用户管理 - Lsky Pro",
  description: "管理系统用户，包括用户信息、权限设置等功能",
};

export default function UsersPage() {
  return (
    <DashboardContainer>
      <UserList />
    </DashboardContainer>
  );
}
