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
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Role, Permission } from "@/lib/types/roles";
import { useRoleStore, PermissionGroupFE } from "@/lib/store/role";
import {
  permissionItemVariants,
  permissionGroupVariants,
  dialogVariants,
  createPermissionToggleAnimation,
} from "@/lib/dashboard/animations";

interface RolePermissionsProps {
  role: Role;
  onRoleUpdate: (role: Role) => void;
}

export function RolePermissions({ role, onRoleUpdate }: RolePermissionsProps) {
  const {
    permissions,
    permissionGroups: storePermissionGroups,
    isLoadingPermissions,
    isSubmitting,
    error,
    fetchPermissions,
    syncPermissions,
    // assignPermission, // Individual assignment might not be needed if using sync
    // removePermission, // Individual removal might not be needed if using sync
  } = useRoleStore();

  // Local state for managing UI selections
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<
    Set<number>
  >(new Set(role.permissions.map((p) => p.id))); // Store permission IDs as numbers

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
  const togglePermission = (permissionId: number) => {
    // ID is number
    const newSelected = new Set(selectedPermissionIds);
    if (newSelected.has(permissionId)) {
      newSelected.delete(permissionId);
    } else {
      newSelected.add(permissionId);
    }
    setSelectedPermissionIds(newSelected);
  };

  // 切换分组所有权限
  const toggleGroupPermissions = (
    group: PermissionGroupFE,
    checked: boolean
  ) => {
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
    const updatedRole = await syncPermissions(
      role.id,
      Array.from(selectedPermissionIds)
    );
    if (updatedRole) {
      onRoleUpdate(updatedRole); // Notify parent component
      // Optionally, show a success message
    } else {
      // 错误已在store中处理并显示toast，这里无需额外处理
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
    <motion.div
      variants={dialogVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                权限管理
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                为角色 {role.alias || role.name} ({role.name}) 分配权限
              </p>
            </motion.div>
            <AnimatePresence>
              {hasChanges() && (
                <motion.div
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetPermissions}
                    disabled={isSubmitting}
                  >
                    重置
                  </Button>
                  <Button
                    size="sm"
                    onClick={savePermissions}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "保存中..." : "保存变更"}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="by-group" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="by-group">按分组查看</TabsTrigger>
              <TabsTrigger value="selected">已选权限</TabsTrigger>
            </TabsList>

            <TabsContent value="by-group" className="space-y-6">
              {storePermissionGroups.map((group) => {
                // Use storePermissionGroups
                const groupPermissionIds = group.permissions.map((p) => p.id); // These are numbers
                const selectedInGroupCount = groupPermissionIds.filter((id) =>
                  selectedPermissionIds.has(id)
                ).length;
                const allSelectedInGroup =
                  selectedInGroupCount === groupPermissionIds.length &&
                  groupPermissionIds.length > 0;

                return (
                  <motion.div
                    key={group.name}
                    className="space-y-3"
                    variants={permissionGroupVariants}
                    initial="initial"
                    animate="animate"
                  >
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

                    <motion.div
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
                      variants={permissionGroupVariants}
                      initial="initial"
                      animate="animate"
                    >
                      {group.permissions.map((permission) => {
                        // permission.id is number
                        const Icon = getPermissionIcon(permission.groupName);
                        const isSelected = selectedPermissionIds.has(
                          permission.id
                        );

                        return (
                          <motion.div
                            key={permission.id}
                            variants={permissionItemVariants}
                            initial="initial"
                            animate="animate"
                            whileHover="hover"
                            whileTap="tap"
                            className={`
                            permission-item-enhanced p-3 sm:p-4 cursor-pointer
                            ${isSelected ? "selected" : ""}
                          `}
                            onClick={() => togglePermission(permission.id)}
                          >
                            <div className="flex items-start gap-2 sm:gap-3">
                              <div
                                className={`
                              permission-icon p-1.5 sm:p-2 rounded-md transition-colors flex-shrink-0
                              ${
                                isSelected
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground"
                              }
                            `}
                              >
                                <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium text-xs sm:text-sm truncate">
                                    {permission.name}
                                  </h4>
                                  {isSelected && (
                                    <Check className="h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                  {permission.description}
                                </p>
                                <div className="flex flex-wrap items-center gap-1 mt-2">
                                  <Badge variant="outline" className="text-xs">
                                    {permission.groupName || "N/A"}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  </motion.div>
                );
              })}
            </TabsContent>

            <TabsContent value="selected" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">已选择的权限</h3>
                <Badge variant="outline">
                  {selectedPermissionIds.size} 个权限
                </Badge>
              </div>

              {selectedPermissionIds.size === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>暂未选择任何权限</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {permissions // Iterate over all fetched permissions
                    .filter((p) => selectedPermissionIds.has(p.id)) // Filter by selected IDs
                    .map((permission) => {
                      const Icon = getPermissionIcon(permission.groupName); // 修复：使用 group_name

                      return (
                        <div
                          key={permission.id} // ID is number
                          className="p-3 sm:p-4 rounded-lg border border-primary bg-primary/5 ring-1 ring-primary/20"
                        >
                          <div className="flex items-start gap-2 sm:gap-3">
                            <div className="p-1.5 sm:p-2 rounded-md bg-primary text-primary-foreground flex-shrink-0">
                              <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-xs sm:text-sm truncate">
                                  {permission.name}
                                </h4>
                                <Button
                                  variant="ghost"
                                  size="icon" // Make it an icon button
                                  className="h-5 w-5 sm:h-6 sm:w-6 p-0 text-muted-foreground hover:text-destructive flex-shrink-0"
                                  onClick={() =>
                                    togglePermission(permission.id)
                                  } // ID is number
                                >
                                  <X className="h-3 w-3" />
                                  <span className="sr-only">取消选择</span>
                                </Button>
                              </div>
                              <p
                                className="text-xs text-muted-foreground mt-1 line-clamp-2"
                                title={permission.description}
                              >
                                {permission.description}
                              </p>
                              <div className="flex flex-wrap items-center gap-1 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {permission.groupName || "N/A"}
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
    </motion.div>
  );
}
