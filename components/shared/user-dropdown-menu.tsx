"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { User, Settings, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserInfo } from "@/lib/store/auth-store";
import { cn } from "@/lib/utils";

interface UserDropdownMenuProps {
  user: UserInfo;
  onLogout: () => void;
  children: React.ReactNode;
}

export const UserDropdownMenu: React.FC<UserDropdownMenuProps> = ({
  user,
  onLogout,
  children,
}) => {
  const router = useRouter();

  const handleProfileClick = () => {
    // TODO: 导航到个人资料页面
    console.log("导航到个人资料页面");
  };

  const handleSettingsClick = () => {
    // TODO: 导航到账户设置页面
    console.log("导航到账户设置页面");
  };

  const handleLogoutClick = async () => {
    try {
      // 调用注销函数清空用户信息
      await onLogout();

      // 跳转到首页
      router.push("/");

      console.log("🚪 用户已注销，跳转到首页");
    } catch (error) {
      console.error("注销过程中发生错误:", error);
      // 即使出错也跳转到首页
      router.push("/");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none">
        {children}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-56"
        align="end"
        sideOffset={8}
        alignOffset={0}
      >
        {/* 用户信息头部 */}
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.username}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* 个人信息 */}
        <DropdownMenuItem
          onClick={handleProfileClick}
          className="cursor-pointer"
        >
          <User className="mr-2 h-4 w-4" />
          <span>查看个人信息</span>
        </DropdownMenuItem>

        {/* 账户设置 */}
        <DropdownMenuItem
          onClick={handleSettingsClick}
          className="cursor-pointer"
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>账户设置</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* 注销账户 */}
        <DropdownMenuItem
          onClick={handleLogoutClick}
          className={cn(
            "cursor-pointer",
            "text-red-600 dark:text-red-400",
            "focus:text-red-600 dark:focus:text-red-400",
            "focus:bg-red-50 dark:focus:bg-red-950/50"
          )}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>退出登录</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
