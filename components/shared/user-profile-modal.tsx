"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/lib/store/auth";
import { getGravatarUrl } from "@/lib/utils/gravatar";
import { getUserDisplayName } from "@/lib/types/user";
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0 sm:rounded-lg">
        <div className="flex flex-col h-full max-h-[90vh]">
          {/* 固定头部 */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="p-4 sm:p-6 border-b bg-background/80 backdrop-blur-sm"
          >
            <DialogHeader className="space-y-3">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl font-semibold">个人设置</DialogTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0 hover:bg-accent"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
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
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 sm:h-16 sm:w-16 ring-2 ring-blue-100 dark:ring-blue-900">
                        <AvatarImage
                          src={getGravatarUrl(user.email)}
                          alt={user.username}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-lg">
                          {user.username?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">
                          {getUserDisplayName(user)}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">{user.email}</p>
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
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="space-y-6"
            >
              {/* 基本信息卡片 */}
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

              {/* 密码修改卡片 */}
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

              {/* 存储统计卡片 */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                className="pb-4"
              >
                <StorageStatsCard user={user} />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};