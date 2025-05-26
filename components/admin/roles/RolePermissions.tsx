"use client";

import { useState, useEffect } from "react";
import {
  Check,
  X,
  Shield,
  Lock,
  Users,
  Settings,
  Database,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Role, Permission, PermissionGroup } from "@/lib/types/user";
import {
  getPermissionGroups,
  assignPermissionsToRole,
  removePermissionsFromRole,
} from "@/lib/api";

interface RolePermissionsProps {
  role: Role;
  onRoleUpdate: (role: Role) => void;
}

export function RolePermissions({ role, onRoleUpdate }: RolePermissionsProps) {
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(
    new Set(role.permissions.map((p) => p.id))
  );

  // 获取权限分组
  useEffect(() => {
    const fetchPermissionGroups = async () => {
      try {
        const groups = await getPermissionGroups();
        setPermissionGroups(groups);
      } catch (error) {
        console.error("获取权限分组失败:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissionGroups();
  }, []);

  // 获取权限图标
  const getPermissionIcon = (resource: string) => {
    switch (resource.toLowerCase()) {
      case "user":
      case "users":
        return Users;
      case "role":
      case "roles":
        return Shield;
      case "file":
      case "files":
      case "upload":
        return FileText;
      case "system":
      case "settings":
        return Settings;
      case "database":
        return Database;
      default:
        return Lock;
    }
  };

  // 切换权限选择
  const togglePermission = (permissionId: string) => {
    const newSelected = new Set(selectedPermissions);
    if (newSelected.has(permissionId)) {
      newSelected.delete(permissionId);
    } else {
      newSelected.add(permissionId);
    }
    setSelectedPermissions(newSelected);
  };

  // 切换分组所有权限
  const toggleGroupPermissions = (group: PermissionGroup, checked: boolean) => {
    const newSelected = new Set(selectedPermissions);
    group.permissions.forEach((permission) => {
      if (checked) {
        newSelected.add(permission.id);
      } else {
        newSelected.delete(permission.id);
      }
    });
    setSelectedPermissions(newSelected);
  };

  // 保存权限变更
  const savePermissions = async () => {
    setUpdating(true);
    try {
      const currentPermissionIds = new Set(role.permissions.map((p) => p.id));
      const toAdd = Array.from(selectedPermissions).filter(
        (id) => !currentPermissionIds.has(id)
      );
      const toRemove = Array.from(currentPermissionIds).filter(
        (id) => !selectedPermissions.has(id)
      );

      // 添加权限
      if (toAdd.length > 0) {
        await assignPermissionsToRole(role.id, toAdd);
      }

      // 移除权限
      if (toRemove.length > 0) {
        await removePermissionsFromRole(role.id, toRemove);
      }

      // 更新角色数据
      const allPermissions = permissionGroups.flatMap((g) => g.permissions);
      const updatedPermissions = allPermissions.filter((p) =>
        selectedPermissions.has(p.id)
      );
      const updatedRole = { ...role, permissions: updatedPermissions };
      onRoleUpdate(updatedRole);
    } catch (error) {
      console.error("保存权限失败:", error);
    } finally {
      setUpdating(false);
    }
  };

  // 重置权限选择
  const resetPermissions = () => {
    setSelectedPermissions(new Set(role.permissions.map((p) => p.id)));
  };

  // 检查是否有变更
  const hasChanges = () => {
    const currentPermissionIds = new Set(role.permissions.map((p) => p.id));
    return (
      selectedPermissions.size !== currentPermissionIds.size ||
      Array.from(selectedPermissions).some(
        (id) => !currentPermissionIds.has(id)
      )
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>权限管理</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <div className="grid grid-cols-2 gap-2">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <Skeleton key={j} className="h-12" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              权限管理
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              为角色 "{role.name}" 分配权限
            </p>
          </div>
          <div className="flex items-center gap-2">
            {hasChanges() && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetPermissions}
                  disabled={updating}
                >
                  重置
                </Button>
                <Button size="sm" onClick={savePermissions} disabled={updating}>
                  {updating ? "保存中..." : "保存变更"}
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="by-group" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="by-group">按分组查看</TabsTrigger>
            <TabsTrigger value="selected">已选权限</TabsTrigger>
          </TabsList>

          <TabsContent value="by-group" className="space-y-6">
            {permissionGroups.map((group) => {
              const groupPermissionIds = group.permissions.map((p) => p.id);
              const selectedInGroup = groupPermissionIds.filter((id) =>
                selectedPermissions.has(id)
              );
              const allSelected =
                selectedInGroup.length === groupPermissionIds.length;
              const someSelected = selectedInGroup.length > 0 && !allSelected;

              return (
                <div key={group.name} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{group.name}</h3>
                      <Badge variant="outline">
                        {selectedInGroup.length}/{groupPermissionIds.length}
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        toggleGroupPermissions(group, !allSelected)
                      }
                      className="gap-2"
                    >
                      {allSelected ? (
                        <>
                          <X className="h-4 w-4" />
                          取消全选
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4" />
                          全选
                        </>
                      )}
                    </Button>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {group.description}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {group.permissions.map((permission) => {
                      const Icon = getPermissionIcon(permission.resource);
                      const isSelected = selectedPermissions.has(permission.id);

                      return (
                        <div
                          key={permission.id}
                          className={`
                            p-4 rounded-lg border cursor-pointer transition-all
                            ${
                              isSelected
                                ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                                : "border-border hover:border-primary/50 hover:bg-muted/50"
                            }
                          `}
                          onClick={() => togglePermission(permission.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`
                              p-2 rounded-md transition-colors
                              ${
                                isSelected
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground"
                              }
                            `}
                            >
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-sm">
                                  {permission.name}
                                </h4>
                                {isSelected && (
                                  <Check className="h-4 w-4 text-primary" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {permission.description}
                              </p>
                              <div className="flex items-center gap-1 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {permission.resource}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {permission.action}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </TabsContent>

          <TabsContent value="selected" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">已选择的权限</h3>
              <Badge variant="outline">{selectedPermissions.size} 个权限</Badge>
            </div>

            {selectedPermissions.size === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>暂未选择任何权限</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {permissionGroups
                  .flatMap((group) =>
                    group.permissions.filter((p) =>
                      selectedPermissions.has(p.id)
                    )
                  )
                  .map((permission) => {
                    const Icon = getPermissionIcon(permission.resource);

                    return (
                      <div
                        key={permission.id}
                        className="p-4 rounded-lg border border-primary bg-primary/5 ring-1 ring-primary/20"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-md bg-primary text-primary-foreground">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-sm">
                                {permission.name}
                              </h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                onClick={() => togglePermission(permission.id)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {permission.description}
                            </p>
                            <div className="flex items-center gap-1 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {permission.resource}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {permission.action}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
