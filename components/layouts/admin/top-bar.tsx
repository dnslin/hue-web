"use client";

import React from "react";
import { motion } from "framer-motion";
import { Menu, Search, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminStore } from "@/lib/store/admin-store";
import { useAuthStore } from "@/lib/store/auth-store";
import { UserAvatar } from "@/components/shared/user-avatar";
import { UserDropdownMenu } from "@/components/shared/user-dropdown-menu";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ThemeSwitcher } from "@/components/shared/theme-switcher";

interface TopBarProps {
  className?: string;
}

export const TopBar: React.FC<TopBarProps> = ({ className }) => {
  const { toggleSidebar, breadcrumbs } = useAdminStore();
  const { user, isAuthenticated, logout } = useAuthStore();

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className
      )}
    >
      <div className="flex min-h-[64px] items-center justify-between px-4 lg:px-6">
        {/* 左侧：移动端菜单按钮 + 面包屑 */}
        <div className="flex items-center gap-4">
          {/* 移动端菜单按钮 */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden h-8 w-8 p-0"
            onClick={toggleSidebar}
          >
            <Menu className="h-4 w-4" />
          </Button>

          {/* 面包屑导航 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="hidden sm:flex"
          >
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((item, index) => (
                  <React.Fragment key={`${item.href}-${index}`}>
                    <BreadcrumbItem>
                      {item.href ? (
                        <BreadcrumbLink href={item.href}>
                          {item.label}
                        </BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage>{item.label}</BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                    {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </motion.div>
        </div>

        {/* 中间：搜索框 */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索功能、设置..."
              className="pl-10 bg-muted/50 border-0 focus-visible:ring-1"
            />
          </div>
        </div>

        {/* 右侧：操作按钮组 */}
        <div className="flex items-center gap-2">
          {/* 搜索按钮（移动端） */}
          <Button variant="ghost" size="sm" className="md:hidden h-8 w-8 p-0">
            <Search className="h-4 w-4" />
          </Button>

          {/* 通知按钮 */}
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 relative">
            <Bell className="h-4 w-4" />
            {/* 通知徽章 */}
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              3
            </Badge>
          </Button>

          {/* 主题切换器 */}
          <ThemeSwitcher />

          {/* 用户菜单 */}
          {isAuthenticated && user ? (
            <UserDropdownMenu user={user} onLogout={logout}>
              <div className="flex items-center gap-2 pl-2 border-l border-border cursor-pointer">
                <UserAvatar user={user} size="md" />
                <div className="hidden sm:block">
                  <p className="text-sm font-medium">{user.username}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
            </UserDropdownMenu>
          ) : (
            <div className="flex items-center gap-2 pl-2 border-l border-border">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <User className="h-4 w-4" />
              </Button>
              <div className="hidden sm:block">
                <p className="text-sm font-medium">未登录</p>
                <p className="text-xs text-muted-foreground">请登录</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
