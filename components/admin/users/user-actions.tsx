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
import { useUserStore } from "@/lib/store/user-store";

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
  const [isSubmitting, setIsSubmitting] = useState(false); // 更通用的加载状态
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false);

  const { changeUserStatus, deleteUser: storeDeleteUser, updateUser: storeUpdateUser, error, clearError } = useUserStore();

  const handleStatusToggle = async (newStatus: UserStatus) => {
    setIsSubmitting(true);
    clearError(); // 清除之前的错误状态
    // 注意：userStore.changeUserStatus 接受 fromStatus 和 toStatus
    // 我们需要从 user prop 获取当前的 fromStatus
    const updatedUser = await changeUserStatus(user.id, user.status, newStatus);
    if (updatedUser) {
      onUserUpdate(updatedUser); // 回调给父组件，父组件通常会刷新列表或更新单个用户
    } else {
      // 错误处理已在 store 中完成，这里可以根据需要添加额外的UI提示
      // 例如，使用 toast 通知用户
      console.error("更新用户状态失败 (UserActions):", error);
    }
    setIsSubmitting(false);
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    clearError();
    const success = await storeDeleteUser(user.id);
    if (success) {
      onUserDelete(user.id); // 回调通知父组件
      setShowDeleteDialog(false);
    } else {
      console.error("删除用户失败 (UserActions):", error);
      // 可以在此显示错误提示给用户, 例如使用 toast
      alert(`删除用户 ${user.username} 失败: ${error || '未知错误'}`);
    }
    setIsSubmitting(false);
  };

  const handleResetPassword = async () => {
    setIsSubmitting(true);
    clearError();
    const tempPassword = Math.random().toString(36).slice(-8); // 生成一个8位随机密码
    // 使用 storeUpdateUser 来更新密码，UserUpdateRequest 支持 password 字段
    const updatedUser = await storeUpdateUser(user.id, { password: tempPassword });
    if (updatedUser) {
      alert(`用户 ${user.username} 的密码已成功重置为: ${tempPassword}\n请用户使用此临时密码登录后立即修改。`);
      setShowResetPasswordDialog(false);
      // 可选: 如果 storeUpdateUser 返回了更新后的用户对象，可以调用 onUserUpdate
      // onUserUpdate(updatedUser);
    } else {
      console.error("重置密码失败 (UserActions):", error);
      alert(`重置用户 ${user.username} 的密码失败: ${error || '未知错误'}`);
    }
    setIsSubmitting(false);
  };

  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case UserStatus.NORMAL:
        return (
          <Badge
            variant="default"
            className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          >
            正常
          </Badge>
        );
      case UserStatus.PENDING:
        return (
          <Badge
            variant="secondary"
            className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
          >
            待审核
          </Badge>
        );
      case UserStatus.DISABLED:
        return <Badge variant="destructive">已禁用</Badge>;
      case UserStatus.REJECTED:
        return (
          <Badge
            variant="destructive"
            className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
          >
            审核拒绝
          </Badge>
        );
      case UserStatus.DELETED:
        return <Badge variant="outline">已删除</Badge>;
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
            {user.status === UserStatus.NORMAL ? (
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-yellow-600 hover:text-yellow-700"
                onClick={() => handleStatusToggle(UserStatus.DISABLED)}
                disabled={isSubmitting}
              >
                <Ban className="h-4 w-4" />
                禁用用户
              </Button>
            ) : user.status === UserStatus.DISABLED ? (
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-green-600 hover:text-green-700"
                onClick={() => handleStatusToggle(UserStatus.NORMAL)}
                disabled={isSubmitting}
              >
                <CheckCircle className="h-4 w-4" />
                启用用户
              </Button>
            ) : user.status === UserStatus.PENDING ? (
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-green-600 hover:text-green-700"
                onClick={() => handleStatusToggle(UserStatus.NORMAL)}
                disabled={isSubmitting}
              >
                <CheckCircle className="h-4 w-4" />
                批准用户
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-green-600 hover:text-green-700"
                onClick={() => handleStatusToggle(UserStatus.NORMAL)}
                disabled={isSubmitting}
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
                  <Button onClick={handleResetPassword} disabled={isSubmitting}>
                    {isSubmitting ? "重置中..." : "确认重置"}
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
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "删除中..." : "确认删除"}
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
