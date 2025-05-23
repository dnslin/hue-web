"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminStore } from "@/lib/store/admin-store";
import { AdminNavigation } from "./AdminNavigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BorderBeam } from "@/components/magicui/border-beam";
import { ShineBorder } from "@/components/magicui/shine-border";

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const {
    sidebarCollapsed,
    sidebarHovered,
    toggleSidebar,
    setSidebarHovered,
    setSidebarCollapsed,
  } = useAdminStore();

  // 响应式处理：在小屏幕上自动折叠
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setSidebarCollapsed]);

  const isExpanded = !sidebarCollapsed || sidebarHovered;

  return (
    <>
      {/* 移动端遮罩 */}
      <AnimatePresence>
        {isExpanded && sidebarCollapsed && (
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
          width: isExpanded ? 280 : 80,
        }}
        transition={{
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1],
        }}
        className={cn(
          "fixed left-0 top-0 z-50 h-full bg-background border-r border-border",
          "flex flex-col overflow-hidden relative",
          "lg:relative lg:z-auto",
          className
        )}
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
      >
        {/* 边框动画效果 */}
        {isExpanded && (
          <BorderBeam
            size={60}
            duration={12}
            colorFrom="#3b82f6"
            colorTo="#8b5cf6"
            className="opacity-30"
          />
        )}

        {/* 侧边栏头部 */}
        <div className="flex items-center justify-between p-4 border-b border-border relative">
          <AnimatePresence mode="wait">
            {isExpanded ? (
              <motion.div
                key="expanded"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3"
              >
                <div className="relative">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-sm">
                      L
                    </span>
                  </div>
                  <ShineBorder
                    className="absolute inset-0 rounded-lg"
                    shineColor={["#3b82f6", "#8b5cf6"]}
                    duration={3}
                    borderWidth={1}
                  />
                </div>
                <div>
                  <h1 className="font-semibold text-lg">Lsky Pro</h1>
                  <p className="text-xs text-muted-foreground">管理后台</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="collapsed"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-auto relative"
              >
                <span className="text-primary-foreground font-bold text-sm">
                  L
                </span>
                <ShineBorder
                  className="absolute inset-0 rounded-lg"
                  shineColor={["#3b82f6", "#8b5cf6"]}
                  duration={3}
                  borderWidth={1}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* 折叠按钮 */}
          <AnimatePresence>
            {isExpanded && (
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
                  className="h-8 w-8 p-0 hover:bg-accent/50"
                >
                  {sidebarCollapsed ? (
                    <PanelLeftOpen className="h-4 w-4" />
                  ) : (
                    <PanelLeftClose className="h-4 w-4" />
                  )}
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
            {isExpanded ? (
              <motion.div
                key="expanded-footer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }}
                className="text-center"
              >
                <p className="text-xs text-muted-foreground">© 2024 Lsky Pro</p>
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

        {/* 折叠状态下的展开提示 */}
        {sidebarCollapsed && !sidebarHovered && (
          <div className="absolute right-0 top-1/2 transform translate-x-full -translate-y-1/2">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-popover border border-border rounded-r-lg p-2 shadow-lg"
            >
              <PanelLeftOpen className="h-4 w-4 text-muted-foreground" />
            </motion.div>
          </div>
        )}
      </motion.aside>

      {/* 占位符，防止内容被侧边栏遮挡 */}
      <motion.div
        initial={false}
        animate={{
          width: isExpanded ? 280 : 80,
        }}
        transition={{
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1],
        }}
        className="hidden lg:block flex-shrink-0"
      />
    </>
  );
};
