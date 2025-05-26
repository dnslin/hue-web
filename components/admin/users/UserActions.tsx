"use client";

import { useState } from "react";
import {
  MoreHorizontal,
  Edit,
  Ban,
  CheckCircle,
  Key,
  UserX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { User, UserStatus } from "@/lib/types/user";
import { toggleUserStatus, deleteUser, resetUserPassword } from "@/lib/api";

interface UserActionsProps {
  user: User;
  onUserUpdate: (user: User) => void;
  onUserDelete: (userId: number) => void;
}

export function UserActions({
  user,
  onUserUpdate,
  onUserDelete,
}: UserActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false);

  const handleStatusToggle = async (newStatus: UserStatus) => {
    setIsLoading(true);
    try {
      const updatedUser = await toggleUserStatus(user.id, newStatus);
      onUserUpdate(updatedUser);
    } catch (error) {
      console.error("更新用户状态失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deleteUser(user.id);
      onUserDelete(user.id);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("删除用户失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setIsLoading(true);
    try {
      // 生成临时密码
      const tempPassword = Math.random().toString(36).slice(-8);
      await resetUserPassword(user.id, tempPassword);
      alert(`密码已重置为: ${tempPassword}`);
      setShowResetPasswordDialog(false);
    } catch (error) {
      console.error("重置密码失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case UserStatus.ACTIVE:
        return (
          <Badge
            variant="default"
            className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          >
            正常
          </Badge>
        );
      case UserStatus.INACTIVE:
        return (
          <Badge
            variant="secondary"
            className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
          >
            未激活
          </Badge>
        );
      case UserStatus.BANNED:
        return <Badge variant="destructive">已封禁</Badge>;
      default:
        return <Badge variant="outline">未知</Badge>;
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* 状态显示 */}
      {getStatusBadge(user.status)}

      {/* 操作菜单 */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">打开菜单</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48" align="end">
          <div className="space-y-1">
            {/* 编辑用户 */}
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={() => {
                // TODO: 实现编辑用户功能
                console.log("编辑用户:", user.id);
              }}
            >
              <Edit className="h-4 w-4" />
              编辑用户
            </Button>

            {/* 状态切换 */}
            {user.status === UserStatus.ACTIVE ? (
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-yellow-600 hover:text-yellow-700"
                onClick={() => handleStatusToggle(UserStatus.BANNED)}
                disabled={isLoading}
              >
                <Ban className="h-4 w-4" />
                封禁用户
              </Button>
            ) : user.status === UserStatus.BANNED ? (
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-green-600 hover:text-green-700"
                onClick={() => handleStatusToggle(UserStatus.ACTIVE)}
                disabled={isLoading}
              >
                <CheckCircle className="h-4 w-4" />
                解除封禁
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-green-600 hover:text-green-700"
                onClick={() => handleStatusToggle(UserStatus.ACTIVE)}
                disabled={isLoading}
              >
                <CheckCircle className="h-4 w-4" />
                激活用户
              </Button>
            )}

            {/* 重置密码 */}
            <Dialog
              open={showResetPasswordDialog}
              onOpenChange={setShowResetPasswordDialog}
            >
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2"
                >
                  <Key className="h-4 w-4" />
                  重置密码
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>重置密码</DialogTitle>
                  <DialogDescription>
                    确定要重置用户 &ldquo;{user.username}&rdquo;
                    的密码吗？系统将生成一个临时密码。
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowResetPasswordDialog(false)}
                  >
                    取消
                  </Button>
                  <Button onClick={handleResetPassword} disabled={isLoading}>
                    {isLoading ? "重置中..." : "确认重置"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* 删除用户 */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 text-red-600 hover:text-red-700"
                >
                  <UserX className="h-4 w-4" />
                  删除用户
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>删除用户</DialogTitle>
                  <DialogDescription>
                    确定要删除用户 &ldquo;{user.username}&rdquo;
                    吗？此操作不可撤销，用户的所有数据将被永久删除。
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteDialog(false)}
                  >
                    取消
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isLoading}
                  >
                    {isLoading ? "删除中..." : "确认删除"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
