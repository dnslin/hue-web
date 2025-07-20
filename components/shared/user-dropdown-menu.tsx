"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { User, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { User as UserType } from "@/lib/types/user";
import { UserProfileModal } from "./user-profile-modal";

interface UserDropdownMenuProps {
  user: UserType;
  onLogout: () => void;
  children: React.ReactNode;
}

export const UserDropdownMenu: React.FC<UserDropdownMenuProps> = ({
  user,
  onLogout,
  children,
}) => {
  const router = useRouter();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleProfileClick = () => {
    setIsProfileModalOpen(true);
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
    <>
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

          {/* 个人设置 */}
          <DropdownMenuItem
            onClick={handleProfileClick}
            className="cursor-pointer"
          >
            <User className="mr-2 h-4 w-4" />
            <span>个人设置</span>
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

      {/* 个人设置模态框 */}
      <UserProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
      />
    </>
  );
};
