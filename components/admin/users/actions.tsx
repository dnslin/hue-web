"use client";

import { useState, useRef } from "react";
import {
  MoreHorizontal,
  Edit,
  Ban,
  CheckCircle,
  Key,
  UserX,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { User, UserStatus, UserUpdateRequest } from "@/lib/types/user";
import { useUserActionStore } from "@/lib/store/user/action";
import { showToast } from "@/lib/utils/toast";
import { RoleSelect } from "@/components/shared/role-select";

interface UserActionsProps {
  user: User;
}

export function UserActions({ user }: UserActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false);
  const [showStatusChangeDialog, setShowStatusChangeDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const editDialogContentRef = useRef<HTMLDivElement>(null);
  const [targetStatus, setTargetStatus] = useState<UserStatus | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [editForm, setEditForm] = useState({
    username: user.username,
    email: user.email,
    roleId: user.roleId,
    storageCapacityMb: user.storageCapacityMb || 0,
  });

  const {
    loading,
    error,
    changeUserStatus,
    deleteUser,
    resetPassword,
    updateUser,
    clearError,
  } = useUserActionStore();

  const isSubmitting =
    loading.isChangingStatus[user.id] ||
    loading.isDeleting[user.id] ||
    loading.isResettingPassword[user.id] ||
    loading.isUpdating[user.id];

  const handleStatusToggle = async (newStatus: UserStatus) => {
    // 如果是敏感操作（封禁/解封），显示确认弹窗
    if (
      newStatus === UserStatus.BANNED ||
      (user.status === UserStatus.BANNED && newStatus === UserStatus.NORMAL)
    ) {
      setTargetStatus(newStatus);
      setShowStatusChangeDialog(true);
      return;
    }

    // 其他状态变更直接执行
    await executeStatusChange(newStatus);
  };

  const executeStatusChange = async (newStatus: UserStatus) => {
    clearError("statusChangeError", user.id);

    const result = await changeUserStatus(user, newStatus);

    // store 已经处理了错误显示，这里只处理成功情况
    if (result.success) {
      showToast.success(`用户 ${user.username} 状态已更新`);
    }
  };

  const handleConfirmStatusChange = async () => {
    if (targetStatus !== null && targetStatus !== undefined) {
      await executeStatusChange(targetStatus);
      setShowStatusChangeDialog(false);
      setTargetStatus(null);
    }
  };

  const handleDelete = async () => {
    clearError("deleteError", user.id);

    const result = await deleteUser(user.id);

    // store 已经处理了错误显示，这里只处理成功情况
    if (result.success) {
      setShowDeleteDialog(false);
      showToast.success(`用户 ${user.username} 已删除`);
    }
  };

  const handleResetPassword = async () => {
    clearError("resetPasswordError", user.id);

    const result = await resetPassword(user.id);

    // store 已经处理了错误显示，这里只处理成功情况
    if (result.success) {
      if (result.newPassword && result.newPassword !== "已通过邮件发送") {
        showToast.success(
          `用户 ${user.username} 的密码已成功重置`,
          `新密码：${result.newPassword}，请用户登录后立即修改`
        );
      } else {
        showToast.success(
          `用户 ${user.username} 的密码已成功重置`,
          "新密码已通过邮件发送给用户"
        );
      }
    }

    // 无论成功还是失败，都关闭弹窗
    setShowResetPasswordDialog(false);
  };

  const handleRejectUser = async () => {
    clearError("statusChangeError", user.id);

    const result = await changeUserStatus(
      user,
      UserStatus.REJECTED,
      rejectReason
    );

    // store 已经处理了错误显示，这里只处理成功情况
    if (result.success) {
      showToast.success(`用户 ${user.username} 已被拒绝`);
      setShowRejectDialog(false);
      setRejectReason("");
    }
  };

  const handleEditUser = async () => {
    const updateData: UserUpdateRequest = {
      username: editForm.username,
      email: editForm.email,
      roleId: editForm.roleId,
      storageCapacityMb: editForm.storageCapacityMb,
    };

    const result = await updateUser(user.id, updateData);

    // store 已经处理了错误显示，这里只处理成功情况
    if (result.success) {
      showToast.success(`用户 ${user.username} 信息已更新`);
      setShowEditDialog(false);
    }
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
      case UserStatus.BANNED:
        return <Badge variant="destructive">已封禁</Badge>;
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
            {/* 编辑用户信息 - 所有用户 */}
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={() => setShowEditDialog(true)}
            >
              <Edit className="h-4 w-4" />
              编辑信息
            </Button>

            {/* 封禁用户 - 只针对正常用户 */}
            {user.status === UserStatus.NORMAL && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-yellow-600 hover:text-yellow-700"
                onClick={() => handleStatusToggle(UserStatus.BANNED)}
                disabled={isSubmitting}
              >
                <Ban className="h-4 w-4" />
                封禁账号
              </Button>
            )}

            {/* 解封用户 - 只针对封禁用户 */}
            {user.status === UserStatus.BANNED && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-green-600 hover:text-green-700"
                onClick={() => handleStatusToggle(UserStatus.NORMAL)}
                disabled={isSubmitting}
              >
                <CheckCircle className="h-4 w-4" />
                {isSubmitting ? "解封中..." : "解除封禁"}
              </Button>
            )}

            {/* 批准用户和拒绝用户 - 只针对待审核用户 */}
            {user.status === UserStatus.PENDING && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 text-green-600 hover:text-green-700"
                  onClick={() => handleStatusToggle(UserStatus.NORMAL)}
                  disabled={isSubmitting}
                >
                  <CheckCircle className="h-4 w-4" />
                  批准注册
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 text-red-600 hover:text-red-700"
                  onClick={() => setShowRejectDialog(true)}
                  disabled={isSubmitting}
                >
                  <XCircle className="h-4 w-4" />
                  拒绝注册
                </Button>
              </>
            )}

            {/* 重置密码 - 仅正常状态用户 */}
            {user.status === UserStatus.NORMAL && (
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
                    <Button
                      onClick={handleResetPassword}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "重置中..." : "确认重置"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            {/* 删除用户 - 所有用户 */}
            {user.status !== UserStatus.DELETED && (
              <Dialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 text-red-600 hover:text-red-700"
                  >
                    <UserX className="h-4 w-4" />
                    删除账号
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
            )}

            {/* 状态变更确认弹窗 */}
            <Dialog
              open={showStatusChangeDialog}
              onOpenChange={setShowStatusChangeDialog}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {targetStatus === UserStatus.BANNED
                      ? "封禁用户"
                      : "解封用户"}
                  </DialogTitle>
                  <DialogDescription>
                    {targetStatus === UserStatus.BANNED
                      ? `确定要封禁用户 "${user.username}" 吗？封禁后用户将无法登录系统。`
                      : `确定要解封用户 "${user.username}" 吗？解封后用户将恢复正常使用权限。`}
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowStatusChangeDialog(false)}
                  >
                    取消
                  </Button>
                  <Button
                    variant={
                      targetStatus === UserStatus.BANNED
                        ? "destructive"
                        : "default"
                    }
                    onClick={handleConfirmStatusChange}
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? targetStatus === UserStatus.BANNED
                        ? "封禁中..."
                        : "解封中..."
                      : targetStatus === UserStatus.BANNED
                      ? "确认封禁"
                      : "确认解封"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* 拒绝用户弹窗 */}
            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>拒绝注册</DialogTitle>
                  <DialogDescription>
                    确定要拒绝用户 &ldquo;{user.username}&rdquo; 的注册申请吗？
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="reject-reason">拒绝理由（可选）</Label>
                    <Textarea
                      id="reject-reason"
                      placeholder="请输入拒绝理由..."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="w-full min-h-20"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowRejectDialog(false);
                      setRejectReason("");
                    }}
                  >
                    取消
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleRejectUser}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "拒绝中..." : "确认拒绝"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* 编辑用户弹窗 */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
              <DialogContent ref={editDialogContentRef}>
                <DialogHeader>
                  <DialogTitle>编辑用户信息</DialogTitle>
                  <DialogDescription>
                    修改用户 &ldquo;{user.username}&rdquo; 的基本信息
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-username">用户名</Label>
                    <Input
                      id="edit-username"
                      value={editForm.username}
                      onChange={(e) =>
                        setEditForm({ ...editForm, username: e.target.value })
                      }
                      placeholder="请输入用户名"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-email">邮箱</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={editForm.email}
                      onChange={(e) =>
                        setEditForm({ ...editForm, email: e.target.value })
                      }
                      placeholder="请输入邮箱"
                    />
                  </div>
                  <RoleSelect
                    value={editForm.roleId}
                    onValueChange={(roleId) =>
                      setEditForm({
                        ...editForm,
                        roleId: roleId,
                      })
                    }
                    label="用户角色"
                    placeholder="请选择角色"
                    required
                    portalContainer={editDialogContentRef.current}
                  />
                  <div className="space-y-2">
                    <Label htmlFor="edit-storage-capacity">存储容量 (MB)</Label>
                    <Input
                      id="edit-storage-capacity"
                      type="number"
                      min="0"
                      step="1"
                      value={editForm.storageCapacityMb}
                      onChange={(e) => {
                        const value = e.target.value;
                        // 允许空值或有效数字
                        if (value === '' || /^\d+$/.test(value)) {
                          const numValue = value === '' ? 0 : parseInt(value);
                          // 确保值不为负数
                          if (numValue >= 0) {
                            setEditForm({ ...editForm, storageCapacityMb: numValue });
                          }
                        }
                      }}
                      placeholder="请输入存储容量（MB）"
                    />
                    <p className="text-sm text-muted-foreground">
                      用户可使用的存储容量，单位为 MB。0 表示无限制。
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowEditDialog(false)}
                  >
                    取消
                  </Button>
                  <Button onClick={handleEditUser} disabled={isSubmitting}>
                    {isSubmitting ? "保存中..." : "保存更改"}
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
