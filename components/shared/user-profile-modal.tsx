"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/lib/store/auth";
import { getGravatarUrl } from "@/lib/utils/gravatar";
import { cn } from "@/lib/utils";
import type { User as UserType } from "@/lib/types/user";
import { BasicInfoCard } from "./user-profile-modal/basic-info-card";
import { PasswordUpdateCard } from "./user-profile-modal/password-update-card";
import { StorageStatsCard } from "./user-profile-modal/storage-stats-card";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const { updateUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleUserUpdate = async (updatedUser: UserType) => {
    updateUser(updatedUser);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={cn(
          // 响应式宽度
          "max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl",
          // 响应式高度
          "max-h-[95vh] sm:max-h-[90vh]",
          // 布局和滚动
          "overflow-hidden p-0",
          // 响应式圆角
          "rounded-lg sm:rounded-xl",
          // 自定义动画
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", 
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          // 移动端从底部滑入，桌面端从顶部
          "data-[state=closed]:slide-out-to-bottom-2 data-[state=open]:slide-in-from-bottom-2",
          "sm:data-[state=closed]:slide-out-to-top-2 sm:data-[state=open]:slide-in-from-top-2"
        )}
      >
        <div className="flex flex-col h-full max-h-[95vh] sm:max-h-[90vh]">
          {/* 固定头部 */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="p-3 sm:p-4 lg:p-6 border-b bg-background/80 backdrop-blur-sm"
          >
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-lg sm:text-xl font-semibold">个人设置</DialogTitle>
              <DialogDescription className="sr-only">
                管理您的个人信息、密码和存储设置
              </DialogDescription>

              {/* 用户概览卡片 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-0 shadow-sm">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <Avatar className="h-12 w-12 sm:h-16 sm:w-16 ring-2 ring-blue-100 dark:ring-blue-900">
                        <AvatarImage
                          src={getGravatarUrl(user.email)}
                          alt={user.username}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm sm:text-lg">
                          {user.username?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1 min-w-0">
                        <h3 className="font-semibold text-base sm:text-lg truncate">
                          {user.username}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">{user.email}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary" className="text-xs">
                            {user.role?.name || "用户"}
                          </Badge>
                          <span className="text-xs text-muted-foreground hidden sm:inline">
                            注册于 {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </DialogHeader>
          </motion.div>

          {/* 可滚动内容区域 */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              {/* 响应式网格布局 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                {/* 左侧：基本信息和密码修改 */}
                <div className="space-y-4 lg:space-y-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                  >
                    <BasicInfoCard 
                      user={user} 
                      onUserUpdate={handleUserUpdate}
                      isLoading={isLoading}
                      setIsLoading={setIsLoading}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                  >
                    <PasswordUpdateCard 
                      user={user}
                      isLoading={isLoading}
                      setIsLoading={setIsLoading}
                    />
                  </motion.div>
                </div>

                {/* 右侧：存储统计 */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                  className="lg:sticky lg:top-0"
                >
                  <StorageStatsCard user={user} />
                </motion.div>
              </div>
              
              {/* 底部安全区域 */}
              <div className="h-4 sm:h-0" />
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};