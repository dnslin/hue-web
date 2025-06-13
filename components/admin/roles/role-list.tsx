"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Shield,
  Users,
  Edit,
  Trash2,
  Copy,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import { RolePermissions } from "./role-permissions";
import { Role } from "@/lib/types/roles"; // 修复：从正确的类型定义文件导入
import { useRoleStore } from "@/lib/store/role-store";

interface RoleListProps {
  onRoleSelect?: (role: Role) => void;
  selectedRoleId?: string;
}

export function RoleList({ onRoleSelect, selectedRoleId }: RoleListProps) {
  // 使用 RoleStore
  const {
    roles,
    isLoadingRoles,
    isSubmitting,
    error,
    fetchRoles,
    deleteRole: storeDeleteRole,
    duplicateRole: storeDuplicateRole,
    setSelectedRole: storeSetSelectedRole, // 用于在对话框中显示的角色
    selectedRole: storeSelectedRoleForDialog, // 从store获取，用于权限管理对话框
  } = useRoleStore();

  // 本地状态用于UI控制，例如对话框的显示
  // selectedRoleForDisplay 用于UI高亮等，不直接用于数据操作
  const [selectedRoleForDisplay, setSelectedRoleForDisplay] =
    useState<Role | null>(null);
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<number | null>(null); // 使用 number 类型的 roleId
  // duplicating 状态由 store 的 isSubmitting 替代一部分，但如果需要针对特定角色显示复制中，可以保留

  // 获取角色列表
  useEffect(() => {
    fetchRoles(); // 默认获取第一页
  }, [fetchRoles]);

  // 处理角色选择 (用于UI高亮和外部回调)
  const handleRoleSelect = (role: Role) => {
    setSelectedRoleForDisplay(role);
    onRoleSelect?.(role); // 调用外部传入的回调
    storeSetSelectedRole(role); // 同时更新store中的selectedRole，供权限弹窗使用
  };

  // 处理权限管理按钮点击
  const handleManagePermissionsClick = (role: Role) => {
    storeSetSelectedRole(role); // 确保store中的selectedRole是当前要管理权限的角色
    setShowPermissionsDialog(true);
  };

  // 处理角色更新 (通常由 RolePermissions 组件回调)
  const handleRoleUpdate = (updatedRole: Role) => {
    // RoleStore 内部的 syncPermissions 等操作会自动更新 roles 列表和 selectedRole
    // 这里可能只需要关闭权限对话框，并确保UI同步
    if (storeSelectedRoleForDialog?.id === updatedRole.id) {
      storeSetSelectedRole(updatedRole); // 更新对话框中使用的角色信息
    }
    // 如果 selectedRoleForDisplay 也需要更新
    if (selectedRoleForDisplay?.id === updatedRole.id) {
      setSelectedRoleForDisplay(updatedRole);
    }
    // fetchRoles(); // 可选：强制刷新列表，但store内部通常会处理
  };

  // 处理角色删除
  const handleDeleteRole = async (roleId: number) => {
    const success = await storeDeleteRole(roleId);
    if (success) {
      setShowDeleteDialog(null);
      if (selectedRoleForDisplay?.id === roleId) {
        setSelectedRoleForDisplay(null);
        storeSetSelectedRole(null); // 如果删除的是当前选中的角色，也清空store中的
      }
      // 列表刷新已在 storeDeleteRole 内部处理
    } else {
      // 错误已在store中处理并显示toast，这里无需额外处理
    }
  };

  // 处理角色复制
  const handleDuplicateRole = async (role: Role) => {
    // newNameSuffix 可以是固定的，或者允许用户输入
    const duplicatedRole = await storeDuplicateRole(role.id);
    if (duplicatedRole) {
      // 列表刷新已在 storeDuplicateRole 内部处理
      console.log("角色复制成功:", duplicatedRole);
    } else {
      // 错误已在store中处理并显示toast，这里无需额外处理
    }
  };

  // 获取角色颜色
  const getRoleColor = (roleName: string) => {
    switch (roleName.toLowerCase()) {
      case "admin":
      case "管理员":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "moderator":
      case "版主":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "user":
      case "普通用户":
      case "default": // 假设 "default" 也是普通用户的一种表示
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  if (isLoadingRoles && roles.length === 0) {
    // 初始加载时显示骨架屏
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6" />
          <h1 className="text-2xl font-semibold">角色权限管理</h1>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          添加角色
        </Button>
      </div>

      {/* 角色卡片网格 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {roles.map((role) => (
          <Card
            key={role.id}
            className={`
            cursor-pointer transition-all hover:shadow-md
            ${
              selectedRoleForDisplay?.id === role.id
                ? "ring-2 ring-primary"
                : ""
            }
          `}
            onClick={() => handleRoleSelect(role)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{role.alias || role.name}</CardTitle>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48" align="end">
                    <div className="space-y-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleManagePermissionsClick(role);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                        管理权限
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicateRole(role);
                        }}
                        disabled={isSubmitting} // 使用 store 的 isSubmitting
                      >
                        <Copy className="h-4 w-4" />
                        {isSubmitting ? "处理中..." : "复制角色"}
                      </Button>
                      <Dialog
                        open={showDeleteDialog === role.id} // 比较 number
                        onOpenChange={
                          (open) => setShowDeleteDialog(open ? role.id : null) // 设置 number 或 null
                        }
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start gap-2 text-red-600 hover:text-red-700"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="h-4 w-4" />
                            删除角色
                          </Button>
                        </DialogTrigger>
                        <DialogContent onClick={(e) => e.stopPropagation()}>
                          <DialogHeader>
                            <DialogTitle>删除角色</DialogTitle>
                            <DialogDescription>
                              确定要删除角色 {role.alias || role.name} ({role.name}) 吗？
                              此操作不可撤销，已分配此角色的用户将失去相应权限。
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setShowDeleteDialog(null)}
                            >
                              取消
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => handleDeleteRole(role.id)} // 传递 number
                              disabled={isSubmitting}
                            >
                              确认删除
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              {/* {role.description && ( // Role类型没有description属性，暂时移除
                <p className="text-sm text-muted-foreground">
                  {role.description}
                </p>
              )} */}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* 用户数量 - Role类型没有user_count属性，暂时移除或后续通过其他方式获取
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {role.user_count} 个用户
                  </span>
                </div>
                */}

                {/* 权限数量 */}
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {role.permissions.length} 个权限
                  </span>
                </div>

                {/* 角色标签 */}
                <div className="flex flex-wrap gap-1">
                  <Badge className={getRoleColor(role.name)}>{role.alias || role.name}</Badge>
                  {role.permissions.slice(0, 3).map((permission) => (
                    <Badge
                      key={permission.id.toString()} // key 应该是 string 或 number
                      variant="outline"
                      className="text-xs"
                    >
                      {permission.name} {/* 假设 Permission 类型有 name 字段 */}
                    </Badge>
                  ))}
                  {role.permissions.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{role.permissions.length - 3}
                    </Badge>
                  )}
                </div>

                {/* 创建时间 */}
                <div className="text-xs text-muted-foreground mt-2 pt-2 border-t border-dashed">
                  创建于:{" "}
                  {new Date(role.created_at).toLocaleDateString("zh-CN")}
                </div>
                {role.updated_at && role.updated_at !== role.created_at && (
                  <div className="text-xs text-muted-foreground">
                    更新于:{" "}
                    {new Date(role.updated_at).toLocaleDateString("zh-CN")}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 权限管理对话框 */}
      <Dialog
        open={showPermissionsDialog}
        onOpenChange={setShowPermissionsDialog}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>权限管理</DialogTitle>
            <DialogDescription>
              为角色{" "}
              {storeSelectedRoleForDialog
                ? `"${storeSelectedRoleForDialog.alias || storeSelectedRoleForDialog.name}"`
                : ""}{" "}
              分配和管理权限
            </DialogDescription>
          </DialogHeader>
          {storeSelectedRoleForDialog && (
            <RolePermissions
              role={storeSelectedRoleForDialog}
              onRoleUpdate={handleRoleUpdate} // RolePermissions 内部会调用这个来通知更新
            />
          )}
        </DialogContent>
      </Dialog>

      {/* 空状态 (当非加载状态且无数据时) */}
      {!isLoadingRoles && roles.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">暂无角色</h3>
              <p className="text-muted-foreground mb-4">
                创建第一个角色来开始管理用户权限
              </p>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                添加角色
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
