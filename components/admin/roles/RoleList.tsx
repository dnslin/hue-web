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
import { RolePermissions } from "./RolePermissions";
import { Role } from "@/lib/types/user";
import { getRoleList, deleteRole, duplicateRole } from "@/lib/api";

interface RoleListProps {
  onRoleSelect?: (role: Role) => void;
  selectedRoleId?: string;
}

export function RoleList({ onRoleSelect, selectedRoleId }: RoleListProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showPermissions, setShowPermissions] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);
  const [duplicating, setDuplicating] = useState<string | null>(null);

  // 获取角色列表
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const roleList = await getRoleList();
        setRoles(roleList);
      } catch (error) {
        console.error("获取角色列表失败:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  // 处理角色选择
  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    onRoleSelect?.(role);
  };

  // 处理权限管理
  const handleManagePermissions = (role: Role) => {
    setSelectedRole(role);
    setShowPermissions(true);
  };

  // 处理角色更新
  const handleRoleUpdate = (updatedRole: Role) => {
    setRoles((prevRoles) =>
      prevRoles.map((role) => (role.id === updatedRole.id ? updatedRole : role))
    );
    setSelectedRole(updatedRole);
  };

  // 处理角色删除
  const handleDeleteRole = async (roleId: string) => {
    try {
      await deleteRole(roleId);
      setRoles((prevRoles) => prevRoles.filter((role) => role.id !== roleId));
      setShowDeleteDialog(null);
      if (selectedRole?.id === roleId) {
        setSelectedRole(null);
      }
    } catch (error) {
      console.error("删除角色失败:", error);
    }
  };

  // 处理角色复制
  const handleDuplicateRole = async (role: Role) => {
    setDuplicating(role.id);
    try {
      const newRoleName = `${role.name} (副本)`;
      const duplicatedRole = await duplicateRole(role.id, newRoleName);
      setRoles((prevRoles) => [...prevRoles, duplicatedRole]);
    } catch (error) {
      console.error("复制角色失败:", error);
    } finally {
      setDuplicating(null);
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
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  if (loading) {
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
              ${selectedRoleId === role.id ? "ring-2 ring-primary" : ""}
            `}
            onClick={() => handleRoleSelect(role)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{role.name}</CardTitle>
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
                          handleManagePermissions(role);
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
                        disabled={duplicating === role.id}
                      >
                        <Copy className="h-4 w-4" />
                        {duplicating === role.id ? "复制中..." : "复制角色"}
                      </Button>
                      <Dialog
                        open={showDeleteDialog === role.id}
                        onOpenChange={(open) =>
                          setShowDeleteDialog(open ? role.id : null)
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
                              确定要删除角色 "{role.name}"
                              吗？此操作不可撤销，已分配此角色的用户将失去相应权限。
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
                              onClick={() => handleDeleteRole(role.id)}
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
              {role.description && (
                <p className="text-sm text-muted-foreground">
                  {role.description}
                </p>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* 用户数量 */}
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {role.user_count} 个用户
                  </span>
                </div>

                {/* 权限数量 */}
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {role.permissions.length} 个权限
                  </span>
                </div>

                {/* 角色标签 */}
                <div className="flex flex-wrap gap-1">
                  <Badge className={getRoleColor(role.name)}>{role.name}</Badge>
                  {role.permissions.slice(0, 3).map((permission) => (
                    <Badge
                      key={permission.id}
                      variant="outline"
                      className="text-xs"
                    >
                      {permission.name}
                    </Badge>
                  ))}
                  {role.permissions.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{role.permissions.length - 3}
                    </Badge>
                  )}
                </div>

                {/* 创建时间 */}
                <div className="text-xs text-muted-foreground">
                  创建于 {new Date(role.created_at).toLocaleDateString("zh-CN")}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 权限管理对话框 */}
      <Dialog open={showPermissions} onOpenChange={setShowPermissions}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>权限管理</DialogTitle>
            <DialogDescription>为角色分配和管理权限</DialogDescription>
          </DialogHeader>
          {selectedRole && (
            <RolePermissions
              role={selectedRole}
              onRoleUpdate={handleRoleUpdate}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* 空状态 */}
      {roles.length === 0 && (
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
