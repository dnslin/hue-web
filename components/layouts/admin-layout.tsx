"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAdminStore } from "@/lib/store/admin";
import { generateBreadcrumbs } from "@/lib/constants/admin-navigation";
import { Sidebar } from "./admin/sider-bar";
import { TopBar } from "./admin/top-bar";
import { MobileBottomNav } from "./admin/mobile-bottom-nav";

interface AdminLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  className,
}) => {
  const pathname = usePathname();
  const { setCurrentRoute, setBreadcrumbs } = useAdminStore();
  const [isMobile, setIsMobile] = useState(false);

  // 根据当前路径更新面包屑和路由状态
  useEffect(() => {
    setCurrentRoute(pathname);
    const breadcrumbs = generateBreadcrumbs(pathname);
    setBreadcrumbs(breadcrumbs);
  }, [pathname, setCurrentRoute, setBreadcrumbs]);

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
    <div className="h-screen bg-background flex overflow-hidden">
      {/* 侧边栏 */}
      <Sidebar />

      {/* 主内容区域 */}
      <div
        className={cn(
          "flex flex-col flex-1 h-screen transition-all duration-300 ease-in-out w-full"
        )}
      >
        {/* 顶部工具栏 */}
        <TopBar />

        {/* 页面内容 */}
        <main
          className={cn(
            "flex-1 overflow-y-auto overflow-x-hidden bg-background custom-scrollbar",
            isMobile && "admin-main-content-mobile",
            className
          )}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* 移动端底部导航栏 */}
      {isMobile && <MobileBottomNav />}
    </div>
  );
};
