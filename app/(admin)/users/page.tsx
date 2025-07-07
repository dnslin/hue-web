"use client";

import { useState, useEffect } from "react";
import { PageContainer } from "@/components/layouts/page-container";
import { UserList } from "@/components/admin/users/list";

// export const metadata: Metadata = {
//   title: "用户管理 - Lsky Pro",
//   description: "管理系统用户，包括用户信息、权限设置等功能",
// };

export default function UsersPage() {
  const [isMobile, setIsMobile] = useState(false);

  // 检测移动端设备
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <PageContainer>
      <UserList isMobile={isMobile} />
    </PageContainer>
  );
}
