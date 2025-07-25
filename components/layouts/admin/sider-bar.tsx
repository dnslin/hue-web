"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminStore } from "@/lib/store/admin";
import { AdminNavigation } from "./admin-navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BorderBeam } from "@/components/magicui/border-beam";
import { ShineBorder } from "@/components/magicui/shine-border";
import Image from "next/image";
import { useSiteInfo } from "@/lib/hooks/use-site-info";

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const { sidebarCollapsed, toggleSidebar, setSidebarCollapsed } =
    useAdminStore();

  const { appName, logoUrl, isLoading } = useSiteInfo();

  const [isMobile, setIsMobile] = useState(false);

  // 响应式处理：在小屏幕上自动折叠
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setSidebarCollapsed]);

  return (
    <>
      {/* 移动端遮罩 */}
      <AnimatePresence>
        {!sidebarCollapsed && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarCollapsed(true)}
          />
        )}
      </AnimatePresence>

      {/* 侧边栏主体 */}
      <motion.aside
        initial={false}
        animate={{
          width: sidebarCollapsed ? (isMobile ? 0 : 64) : 240,
        }}
        transition={{
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1],
        }}
        className={cn(
          "fixed left-0 top-0 z-50 h-screen bg-background border-r border-border",
          "flex flex-col overflow-hidden",
          "lg:relative lg:z-auto",
          "will-change-transform",
          className
        )}
      >
        {/* 边框动画效果 */}
        {!sidebarCollapsed && (
          <BorderBeam
            size={60}
            duration={12}
            colorFrom="#3b82f6"
            colorTo="#8b5cf6"
            className="opacity-30"
          />
        )}

        {/* 侧边栏头部 */}
        <div className="flex items-center justify-between p-4 border-b border-border relative min-h-[64px]">
          <AnimatePresence mode="wait">
            {!sidebarCollapsed ? (
              <motion.div
                key="expanded"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3"
              >
                <div className="relative">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <Image
                      src={logoUrl}
                      alt={`${appName} Logo`}
                      width={32}
                      height={32}
                      priority={true}
                      className="drop-shadow-[0_0_8px_rgba(59,130,246,0.5)] dark:drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]"
                    />
                  </div>
                </div>
                <div>
                  <h1 className="font-semibold text-lg">{isLoading ? "加载中..." : appName}</h1>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="collapsed"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="w-8 h-8 flex items-center justify-center mx-auto relative"
              >
                <Image
                  src={logoUrl}
                  alt={`${appName} Logo`}
                  width={32}
                  height={32}
                  priority={true}
                  className="drop-shadow-[0_0_8px_rgba(59,130,246,0.5)] dark:drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]"
                />
                <ShineBorder
                  className="absolute inset-0 rounded-lg"
                  shineColor={["#3b82f6", "#8b5cf6"]}
                  duration={3}
                  borderWidth={1}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* 展开状态下的折叠按钮 */}
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSidebar}
                  className="h-8 w-8 p-0 hover:bg-accent/50 transition-colors"
                  aria-label="收起侧边栏"
                >
                  <PanelLeftClose className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 导航区域 */}
        <ScrollArea className="flex-1">
          <div className="p-4">
            <AdminNavigation />
          </div>
        </ScrollArea>

        {/* 侧边栏底部 */}
        <div className="p-4 border-t border-border">
          <AnimatePresence mode="wait">
            {!sidebarCollapsed ? (
              <motion.div
                key="expanded-footer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }}
                className="text-center"
              >
                <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} {appName}</p>
                <p className="text-xs text-muted-foreground">版本 2.0.0</p>
              </motion.div>
            ) : (
              <motion.div
                key="collapsed-footer"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center mx-auto"
              >
                <span className="text-muted-foreground text-xs">v2</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>

      {/* 折叠状态下的浮动展开按钮 */}
      <AnimatePresence>
        {sidebarCollapsed && !isMobile && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed left-16 top-6 z-[60] lg:left-16"
            style={{ left: sidebarCollapsed ? "68px" : "244px" }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSidebar}
              className="h-8 w-8 p-0 bg-background border border-border rounded-full shadow-lg hover:bg-accent/50 hover:shadow-xl transition-all duration-200"
              aria-label="展开侧边栏"
            >
              <PanelLeftOpen className="h-3.5 w-3.5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
