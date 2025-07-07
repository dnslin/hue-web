import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  Role,
  Permission,
  CreateRoleRequest,
  UpdateRoleRequest,
} from "@/lib/types/roles";
import type {
  SuccessApiResponse,
  ErrorApiResponse,
  PaginatedApiResponse,
} from "@/lib/types/common";
import { isSuccessApiResponse } from "@/lib/types/common";
import {
  getRolesAction,
  getRoleByIdAction,
  createRoleAction,
  updateRoleAction,
  deleteRoleAction,
  getPermissionsAction,
  syncRolePermissionsAction,
  assignPermissionToRoleAction,
  removePermissionFromRoleAction,
} from "@/lib/actions/roles/role";
import { handleStoreError } from "@/lib/utils/error-handler";
import { showToast } from "@/lib/utils/toast";
import {
  cacheManager,
  CACHE_KEYS,
  cacheUtils,
} from "@/lib/utils/cache-manager";

// 权限分组的本地类型，因为后端不直接返回这个聚合结构
export interface PermissionGroupFE {
  name: string;
  description: string; // 可以从第一个权限的描述中获取或预定义
  permissions: Permission[];
}

interface RoleStoreState {
  roles: Role[];
  permissions: Permission[];
  permissionGroups: PermissionGroupFE[];
  selectedRole: Role | null;
  isLoadingRoles: boolean;
  isLoadingPermissions: boolean;
  isSubmitting: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };

  // 角色操作
  fetchRoles: (page?: number, pageSize?: number) => Promise<void>;
  fetchRoleById: (id: number) => Promise<Role | null>;
  createRole: (roleData: CreateRoleRequest) => Promise<Role | null>;
  updateRole: (id: number, roleData: UpdateRoleRequest) => Promise<Role | null>;
  deleteRole: (id: number) => Promise<boolean>;
  duplicateRole: (
    roleId: number,
    newNameSuffix?: string
  ) => Promise<Role | null>;

  // 权限操作
  fetchPermissions: (groupName?: string) => Promise<void>;
  syncPermissions: (
    roleId: number,
    permissionIds: number[]
  ) => Promise<Role | null>;
  assignPermission: (
    roleId: number,
    permissionId: number
  ) => Promise<Role | null>;
  removePermission: (roleId: number, permissionId: number) => Promise<boolean>; // 后端返回 SuccessResponse

  // UI辅助
  setSelectedRole: (role: Role | null) => void;
  clearError: () => void;
}

const initialState = {
  roles: [],
  permissions: [],
  permissionGroups: [],
  selectedRole: null,
  isLoadingRoles: false,
  isLoadingPermissions: false,
  isSubmitting: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: 10, // 或者从配置读取
    total: 0,
  },
};

// Helper to group permissions by group_name
const groupPermissions = (permissions: Permission[]): PermissionGroupFE[] => {
  console.log("🔍 权限分组处理开始，权限数量:", permissions.length);

  const groups: Record<string, PermissionGroupFE> = {};
  const sanitizedPermissions = permissions.map(sanitizePermission);

  sanitizedPermissions.forEach((permission, index) => {
    console.log(`📋 处理权限 ${index + 1}:`, {
      id: permission.id,
      name: permission.name,
      groupName: permission.groupName,
      description: permission.description,
    });

    // 使用驼峰命名的 groupName
    const groupName = permission.groupName || "Default";

    if (!groups[groupName]) {
      console.log(`🆕 创建新分组: ${groupName}`);
      groups[groupName] = {
        name: groupName,
        description: `${groupName}相关权限`, // 动态生成描述，不使用硬编码
        permissions: [],
      };
    }
    groups[groupName].permissions.push(permission);
  });

  const result = Object.values(groups);
  console.log("✅ 权限分组完成，分组数量:", result.length);
  console.log(
    "📊 分组详情:",
    result.map((g) => ({
      name: g.name,
      count: g.permissions.length,
      permissions: g.permissions.map((p) => p.name),
    }))
  );

  return result;
};

// Helper to ensure role.permissions is always an array
const sanitizeRole = (role: Role): Role => {
  if (!role) return role;
  return {
    ...role,
    permissions: Array.isArray(role.permissions)
      ? role.permissions.map(sanitizePermission)
      : [],
  };
};

const sanitizePermission = (permission: Permission): Permission => {
  if (!permission) return permission;
  return {
    ...permission,
    name: permission.name || "Unnamed Permission",
    groupName: permission.groupName || "Default",
    description: permission.description || "",
  };
};

export const useRoleStore = create<RoleStoreState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      fetchRoles: async (page = 1, pageSize = 10) => {
        set({ isLoadingRoles: true, error: null });
        const cacheKey = `${CACHE_KEYS.ROLES_LIST}:${page}:${pageSize}`;
        try {
          const response = await cacheManager.getOrSet(
            cacheKey,
            () => getRolesAction({ page, page_size: pageSize }),
            { ttl: 5 * 60 * 1000, storage: "memory" }
          );

          if (isSuccessApiResponse(response)) {
            const paginatedResponse = response as PaginatedApiResponse<Role>;
            if (paginatedResponse.data && paginatedResponse.meta) {
              set({
                roles: paginatedResponse.data.map(sanitizeRole),
                pagination: {
                  page: paginatedResponse.meta.page,
                  pageSize: paginatedResponse.meta.pageSize,
                  total: paginatedResponse.meta.total,
                },
                isLoadingRoles: false,
              });
            } else {
              console.error("❌ 角色列表数据格式错误");
              const errorResult = await handleStoreError(
                new Error("数据格式错误"),
                "获取角色列表"
              );
              set({ error: errorResult.error, isLoadingRoles: false });
            }
          } else {
            console.error("❌ 获取角色列表失败:", response.msg);
            const errorResult = await handleStoreError(
              response,
              "获取角色列表"
            );
            set({ error: errorResult.error, isLoadingRoles: false });
          }
        } catch (err: any) {
          console.error("❌ 获取角色列表时发生意外错误:", err);
          const errorResult = await handleStoreError(err, "获取角色列表");
          set({ error: errorResult.error, isLoadingRoles: false });
        }
      },

      fetchRoleById: async (id) => {
        set({ isLoadingRoles: true, error: null });
        const cacheKey = CACHE_KEYS.ROLE_DETAIL(id);
        try {
          const response = await cacheManager.getOrSet(
            cacheKey,
            () => getRoleByIdAction(id),
            { ttl: 5 * 60 * 1000, storage: "memory" }
          );

          if (isSuccessApiResponse(response)) {
            const role = response.data as Role;
            const sanitizedRole = sanitizeRole(role);
            set((state) => ({
              roles: state.roles.map((r) => (r.id === id ? sanitizedRole : r)),
              selectedRole:
                state.selectedRole?.id === id
                  ? sanitizedRole
                  : state.selectedRole,
              isLoadingRoles: false,
            }));
            return sanitizedRole;
          } else {
            console.error("❌ 获取角色详情失败:", response.msg);
            const errorResult = await handleStoreError(
              response,
              "获取角色详情"
            );
            set({
              error: errorResult.error,
              isLoadingRoles: false,
            });
            return null;
          }
        } catch (err: any) {
          console.error("❌ 获取角色详情时发生意外错误:", err);
          const errorResult = await handleStoreError(err, "获取角色详情");
          set({ error: errorResult.error, isLoadingRoles: false });
          return null;
        }
      },

      createRole: async (roleData: CreateRoleRequest) => {
        set({ isSubmitting: true, error: null });
        try {
          const response = await createRoleAction(roleData);
          if (isSuccessApiResponse(response)) {
            const newRole = response.data as Role;
            showToast.success("角色创建成功");
            cacheUtils.clearRoleCache(); // Invalidate cache
            await get().fetchRoles(
              get().pagination.page,
              get().pagination.pageSize
            ); // Refresh list
            set({ isSubmitting: false });
            return sanitizeRole(newRole);
          } else {
            console.error("❌ 创建角色失败:", response.msg);
            const errorResult = await handleStoreError(response, "创建角色");
            set({
              error: errorResult.error,
              isSubmitting: false,
            });
            return null;
          }
        } catch (err: any) {
          console.error("❌ 创建角色时发生意外错误:", err);
          const errorResult = await handleStoreError(err, "创建角色");
          set({ error: errorResult.error, isSubmitting: false });
          return null;
        }
      },

      updateRole: async (id: number, roleData: UpdateRoleRequest) => {
        set({ isSubmitting: true, error: null });
        try {
          const response = await updateRoleAction(id, roleData);
          if (isSuccessApiResponse(response)) {
            const updatedRole = response.data as Role;
            const sanitizedRole = sanitizeRole(updatedRole);
            showToast.success("角色更新成功");
            cacheUtils.clearRoleCache(); // Invalidate cache for list and detail
            set((state) => ({
              roles: state.roles.map((r) => (r.id === id ? sanitizedRole : r)),
              selectedRole:
                state.selectedRole?.id === id
                  ? sanitizedRole
                  : state.selectedRole,
              isSubmitting: false,
            }));
            return sanitizedRole;
          } else {
            console.error("❌ 更新角色失败:", response.msg);
            const errorResult = await handleStoreError(response, "更新角色");
            set({
              error: errorResult.error,
              isSubmitting: false,
            });
            return null;
          }
        } catch (err: any) {
          console.error("❌ 更新角色时发生意外错误:", err);
          const errorResult = await handleStoreError(err, "更新角色");
          set({ error: errorResult.error, isSubmitting: false });
          return null;
        }
      },

      deleteRole: async (id: number) => {
        set({ isSubmitting: true, error: null });
        try {
          const response = await deleteRoleAction(id);
          if (isSuccessApiResponse(response)) {
            showToast.success("角色删除成功");
            cacheUtils.clearRoleCache(); // Invalidate cache
            // Refresh list to reflect deletion
            await get().fetchRoles(
              get().pagination.page,
              get().pagination.pageSize
            );
            set((state) => ({
              selectedRole:
                state.selectedRole?.id === id ? null : state.selectedRole,
              isSubmitting: false,
            }));
            return true;
          } else {
            console.error("❌ 删除角色失败:", response.msg);
            const errorResult = await handleStoreError(response, "删除角色");
            set({
              error: errorResult.error,
              isSubmitting: false,
            });
            return false;
          }
        } catch (err: any) {
          console.error("❌ 删除角色时发生意外错误:", err);
          const errorResult = await handleStoreError(err, "删除角色");
          set({ error: errorResult.error, isSubmitting: false });
          return false;
        }
      },

      duplicateRole: async (roleId, newNameSuffix = "的副本") => {
        set({ isSubmitting: true, error: null });
        const { createRole, syncPermissions, fetchRoles, pagination } = get();
        try {
          // 1. 获取原始角色信息
          const originalRole = await get().fetchRoleById(roleId);
          if (!originalRole) {
            throw new Error("未找到要复制的原始角色。");
          }

          // 2. 创建新角色
          const newName = `${
            originalRole.alias || originalRole.name
          } ${newNameSuffix}`;
          const newRole = await createRole({ name: newName });

          if (!newRole) {
            throw new Error("创建新角色失败。");
          }

          // 3. 同步权限
          const permissionIds = originalRole.permissions.map((p) => p.id);
          const finalRole = await syncPermissions(newRole.id, permissionIds);

          if (finalRole) {
            showToast.success(`角色 "${newName}" 复制成功`);
            cacheUtils.clearRoleCache();
            await fetchRoles(pagination.page, pagination.pageSize); // 刷新列表
            set({ isSubmitting: false });
            return finalRole;
          } else {
            throw new Error("为新角色同步权限失败。");
          }
        } catch (err: any) {
          console.error("❌ 复制角色时发生意外错误:", err);
          const errorResult = await handleStoreError(err, "复制角色");
          set({ error: errorResult.error, isSubmitting: false });
          return null;
        }
      },

      fetchPermissions: async (groupName?: string) => {
        set({ isLoadingPermissions: true, error: null });
        const cacheKey = groupName
          ? `${CACHE_KEYS.PERMISSIONS_LIST}:${groupName}`
          : CACHE_KEYS.PERMISSIONS_LIST;
        try {
          const response = await cacheManager.getOrSet(
            cacheKey,
            () =>
              getPermissionsAction({ group_name: groupName, page_size: 1000 }),
            { ttl: 5 * 60 * 1000, storage: "memory" }
          );

          if (isSuccessApiResponse(response)) {
            const paginatedResponse =
              response as PaginatedApiResponse<Permission>;
            if (paginatedResponse.data) {
              const permissions =
                paginatedResponse.data.map(sanitizePermission);
              set({
                permissions,
                permissionGroups: groupPermissions(permissions),
                isLoadingPermissions: false,
              });
            } else {
              console.error("❌ 权限列表数据格式错误");
              const errorResult = await handleStoreError(
                new Error("数据格式错误"),
                "获取权限列表"
              );
              set({ error: errorResult.error, isLoadingPermissions: false });
            }
          } else {
            console.error("❌ 获取权限列表失败:", response.msg);
            const errorResult = await handleStoreError(
              response,
              "获取权限列表"
            );
            set({
              error: errorResult.error,
              isLoadingPermissions: false,
            });
          }
        } catch (err: any) {
          console.error("❌ 获取权限列表时发生意外错误:", err);
          const errorResult = await handleStoreError(err, "获取权限列表");
          set({ error: errorResult.error, isLoadingPermissions: false });
        }
      },

      syncPermissions: async (roleId: number, permissionIds: number[]) => {
        set({ isSubmitting: true, error: null });
        try {
          const response = await syncRolePermissionsAction(
            roleId,
            permissionIds
          );
          if (isSuccessApiResponse(response)) {
            showToast.success("权限同步成功");
            cacheManager.invalidate(CACHE_KEYS.ROLE_DETAIL(roleId));
            const updatedRole = await get().fetchRoleById(roleId);
            set({ isSubmitting: false });
            return updatedRole;
          } else {
            console.error("❌ 同步权限失败:", response.msg);
            const errorResult = await handleStoreError(response, "同步权限");
            set({
              error: errorResult.error,
              isSubmitting: false,
            });
            return null;
          }
        } catch (err: any) {
          console.error("❌ 同步权限时发生意外错误:", err);
          const errorResult = await handleStoreError(err, "同步权限");
          set({ error: errorResult.error, isSubmitting: false });
          return null;
        }
      },

      assignPermission: async (roleId: number, permissionId: number) => {
        set({ isSubmitting: true, error: null });
        try {
          const response = await assignPermissionToRoleAction(
            roleId,
            permissionId
          );
          if (isSuccessApiResponse(response)) {
            showToast.success("分配权限成功");
            cacheManager.invalidate(CACHE_KEYS.ROLE_DETAIL(roleId));
            const updatedRole = await get().fetchRoleById(roleId);
            set({ isSubmitting: false });
            return updatedRole;
          } else {
            console.error("❌ 分配权限失败:", response.msg);
            const errorResult = await handleStoreError(response, "分配权限");
            set({
              error: errorResult.error,
              isSubmitting: false,
            });
            return null;
          }
        } catch (err: any) {
          console.error("❌ 分配权限时发生意外错误:", err);
          const errorResult = await handleStoreError(err, "分配权限");
          set({ error: errorResult.error, isSubmitting: false });
          return null;
        }
      },

      removePermission: async (roleId: number, permissionId: number) => {
        set({ isSubmitting: true, error: null });
        try {
          const response = await removePermissionFromRoleAction(
            roleId,
            permissionId
          );
          if (isSuccessApiResponse(response)) {
            showToast.success("移除权限成功");
            cacheManager.invalidate(CACHE_KEYS.ROLE_DETAIL(roleId));
            await get().fetchRoleById(roleId);
            set({ isSubmitting: false });
            return true;
          } else {
            console.error("❌ 移除权限失败:", response.msg);
            const errorResult = await handleStoreError(response, "移除权限");
            set({
              error: errorResult.error,
              isSubmitting: false,
            });
            return false;
          }
        } catch (err: any) {
          console.error("❌ 移除权限时发生意外错误:", err);
          const errorResult = await handleStoreError(err, "移除权限");
          set({ error: errorResult.error, isSubmitting: false });
          return false;
        }
      },

      setSelectedRole: (role) => set({ selectedRole: role }),
      clearError: () => set({ error: null }),
    }),
    {
      name: "role-store",
    }
  )
);

