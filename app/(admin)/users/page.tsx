import { Metadata } from "next";
import { PageContainer } from "@/components/layouts/PageContainer";
import { UserList } from "@/components/admin/users/UserList";

export const metadata: Metadata = {
  title: "用户管理 - Lsky Pro",
  description: "管理系统用户，包括用户信息、权限设置等功能",
};

export default function UsersPage() {
  return (
    <PageContainer>
      <UserList />
    </PageContainer>
  );
}
