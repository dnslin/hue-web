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
import { Role, Permission, PermissionGroup as PermissionGroupTypeFromUserTypes } from "@/lib/types/user"; // Renamed to avoid conflict
import { useRoleStore, PermissionGroupFE } from "@/lib/store/roleStore"; // Use PermissionGroupFE from store
interface RolePermissionsProps {
  role: Role;
  onRoleUpdate: (role: Role) => void;
}

export function RolePermissions({ role, onRoleUpdate }: RolePermissionsProps) {
  const {
    permissions, // All permissions
    permissionGroups: storePermissionGroups, // Grouped by FE logic in store
    isLoadingPermissions,
    isSubmitting,
    error,
    fetchPermissions,
    syncPermissions, // Use syncPermissions for a more robust update
    // assignPermission, // Individual assignment might not be needed if using sync
    // removePermission, // Individual removal might not be needed if using sync
  } = useRoleStore();

  // Local state for managing UI selections
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<Set<number>>( // Store permission IDs as numbers
    new Set(role.permissions.map((p) => p.id))
  );

  // 获取权限分组和所有权限
  useEffect(() => {
    fetchPermissions(); // Fetches all permissions and groups them in the store
  }, [fetchPermissions]);
  
  // Update local selection when the role prop changes (e.g., when a different role is selected in RoleList)
  useEffect(() => {
    setSelectedPermissionIds(new Set(role.permissions.map((p) => p.id)));
  }, [role]);

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
  const togglePermission = (permissionId: number) => { // ID is number
    const newSelected = new Set(selectedPermissionIds);
    if (newSelected.has(permissionId)) {
      newSelected.delete(permissionId);
    } else {
      newSelected.add(permissionId);
    }
    setSelectedPermissionIds(newSelected);
  };

  // 切换分组所有权限
  const toggleGroupPermissions = (group: PermissionGroupFE, checked: boolean) => {
    const newSelected = new Set(selectedPermissionIds);
    group.permissions.forEach((permission) => {
      if (checked) {
        newSelected.add(permission.id);
      } else {
        newSelected.delete(permission.id);
      }
    });
    setSelectedPermissionIds(newSelected);
  };

  // 保存权限变更
  const savePermissions = async () => {
    // No need to set local updating state, use isSubmitting from store
    const updatedRole = await syncPermissions(role.id, Array.from(selectedPermissionIds));
    if (updatedRole) {
      onRoleUpdate(updatedRole); // Notify parent component
      // Optionally, show a success message
    } else {
      // Error is handled in the store, can show a generic error message here or rely on store's error state
      console.error("保存权限失败 (RolePermissions):", error);
    }
  };

  // 重置权限选择
  const resetPermissions = () => {
    setSelectedPermissionIds(new Set(role.permissions.map((p) => p.id)));
  };

  // 检查是否有变更
  const hasChanges = () => {
    const currentPermissionIds = new Set(role.permissions.map((p) => p.id)); // These are numbers
    if (selectedPermissionIds.size !== currentPermissionIds.size) {
      return true;
    }
    for (const id of selectedPermissionIds) {
      if (!currentPermissionIds.has(id)) {
        return true;
      }
    }
    return false;
  };

  if (isLoadingPermissions && storePermissionGroups.length === 0) {
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
              为角色 {role.name} 分配权限
            </p>
          </div>
          <div className="flex items-center gap-2">
            {hasChanges() && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetPermissions}
                  disabled={isSubmitting}
                >
                  重置
                </Button>
                <Button size="sm" onClick={savePermissions} disabled={isSubmitting}>
                  {isSubmitting ? "保存中..." : "保存变更"}
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
            {storePermissionGroups.map((group) => { // Use storePermissionGroups
              const groupPermissionIds = group.permissions.map((p) => p.id); // These are numbers
              const selectedInGroupCount = groupPermissionIds.filter((id) =>
                selectedPermissionIds.has(id)
              ).length;
              const allSelectedInGroup =
                selectedInGroupCount === groupPermissionIds.length && groupPermissionIds.length > 0;

              return (
                <div key={group.name} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{group.name}</h3>
                      <Badge variant="outline">
                        {selectedInGroupCount}/{groupPermissionIds.length}
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        toggleGroupPermissions(group, !allSelectedInGroup)
                      }
                      className="gap-2"
                    >
                      {allSelectedInGroup ? (
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
                    {group.permissions.map((permission) => { // permission.id is number
                      const Icon = getPermissionIcon(permission.group_name); // Use group_name or a more specific field if available for icon
                      const isSelected = selectedPermissionIds.has(permission.id);

                      return (
                        <div
                          key={permission.id} // ID is number
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
                                {/* Assuming permission object has resource and action, or adjust as per actual Permission type */}
                                {/* For now, using group_name as a placeholder if resource/action not directly on permission */}
                                <Badge variant="outline" className="text-xs">
                                  {permission.group_name || 'N/A'}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {permission.name} {/* Display permission name as action-like identifier */}
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
              <Badge variant="outline">{selectedPermissionIds.size} 个权限</Badge>
            </div>

            {selectedPermissionIds.size === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>暂未选择任何权限</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {permissions // Iterate over all fetched permissions
                  .filter((p) => selectedPermissionIds.has(p.id)) // Filter by selected IDs
                  .map((permission) => {
                    const Icon = getPermissionIcon(permission.group_name); // Use group_name or a more specific field

                    return (
                      <div
                        key={permission.id} // ID is number
                        className="p-4 rounded-lg border border-primary bg-primary/5 ring-1 ring-primary/20"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-md bg-primary text-primary-foreground">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-sm">
                                {permission.name}
                              </h4>
                              <Button
                                variant="ghost"
                                size="icon" // Make it an icon button
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                                onClick={() => togglePermission(permission.id)} // ID is number
                              >
                                <X className="h-3 w-3" />
                                <span className="sr-only">取消选择</span>
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 truncate" title={permission.description}>
                              {permission.description}
                            </p>
                            <div className="flex items-center gap-1 mt-2">
                               <Badge variant="outline" className="text-xs">
                                {permission.group_name || 'N/A'}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {permission.name}
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
