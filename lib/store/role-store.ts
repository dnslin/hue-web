import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Role, Permission } from "@/lib/types/roles"; // 统一使用 roles.ts 的类型
import {
  PaginatedResponse,
  ErrorResponse,
  SuccessResponse,
} from "@/lib/types/user"; // API响应类型保持不变
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
} from "@/lib/actions/roles/role.actions";
import { handleError } from "@/lib/utils/error-handler";
import { showToast } from "@/lib/utils/toast";
import { cacheManager, CACHE_KEYS, cacheUtils } from "@/lib/utils/cacheManager";

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
  createRole: (name: string) => Promise<Role | null>;
  updateRole: (id: number, name: string) => Promise<Role | null>;
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
  const groups: Record<string, PermissionGroupFE> = {};
  permissions.map(sanitizePermission).forEach((permission) => {
    // 使用蛇形命名的 group_name
    if (!groups[permission.group_name]) {
      groups[permission.group_name] = {
        name: permission.group_name,
        description: permission.description || "", // Or a predefined description for the group
        permissions: [],
      };
    }
    groups[permission.group_name].permissions.push(permission);
  });
  return Object.values(groups);
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
    group_name: permission.group_name || "Default",
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

          if ("data" in response && response.data && response.meta) {
            const paginatedResponse =
              response as unknown as PaginatedResponse<Role>;
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
            const errorResponse = response as ErrorResponse;
            const errorMessage = errorResponse.message || "获取角色列表失败";
            showToast.apiError(errorResponse, "获取角色列表失败");
            set({ error: errorMessage, isLoadingRoles: false });
          }
        } catch (err: any) {
          const errorMessage = err.message || "获取角色列表时发生意外错误";
          showToast.error(errorMessage);
          await handleError(err, "获取角色列表失败");
          set({ error: errorMessage, isLoadingRoles: false });
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

          if ("data" in response && response.data) {
            const role = (response as SuccessResponse<Role>).data as Role;
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
            const errorResponse = response as ErrorResponse;
            showToast.apiError(errorResponse, "获取角色详情失败");
            set({
              error: errorResponse.message || "获取角色详情失败",
              isLoadingRoles: false,
            });
            return null;
          }
        } catch (err: any) {
          const errorMessage = err.message || "获取角色详情时发生意外错误";
          showToast.error(errorMessage);
          await handleError(err, "获取角色详情失败");
          set({ error: errorMessage, isLoadingRoles: false });
          return null;
        }
      },

      createRole: async (name: string) => {
        set({ isSubmitting: true, error: null });
        try {
          const response = await createRoleAction({ name });
          if ("data" in response && response.data) {
            const newRole = (response as SuccessResponse<Role>).data as Role;
            showToast.success("角色创建成功");
            cacheUtils.clearRoleCache(); // Invalidate cache
            await get().fetchRoles(
              get().pagination.page,
              get().pagination.pageSize
            ); // Refresh list
            set({ isSubmitting: false });
            return sanitizeRole(newRole);
          } else {
            const errorResponse = response as ErrorResponse;
            showToast.apiError(errorResponse, "创建角色失败");
            set({
              error: errorResponse.message || "创建角色失败",
              isSubmitting: false,
            });
            return null;
          }
        } catch (err: any) {
          const errorMessage = err.message || "创建角色时发生意外错误";
          showToast.error(errorMessage);
          await handleError(err, "创建角色失败");
          set({ error: errorMessage, isSubmitting: false });
          return null;
        }
      },

      updateRole: async (id: number, name: string) => {
        set({ isSubmitting: true, error: null });
        try {
          const response = await updateRoleAction(id, { name });
          if ("data" in response && response.data) {
            const updatedRole = (response as SuccessResponse<Role>)
              .data as Role;
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
            const errorResponse = response as ErrorResponse;
            showToast.apiError(errorResponse, "更新角色失败");
            set({
              error: errorResponse.message || "更新角色失败",
              isSubmitting: false,
            });
            return null;
          }
        } catch (err: any) {
          const errorMessage = err.message || "更新角色时发生意外错误";
          showToast.error(errorMessage);
          await handleError(err, "更新角色失败");
          set({ error: errorMessage, isSubmitting: false });
          return null;
        }
      },

      deleteRole: async (id: number) => {
        set({ isSubmitting: true, error: null });
        try {
          const response = await deleteRoleAction(id);
          if (response.code >= 200 && response.code < 300) {
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
            const errorResponse = response as ErrorResponse;
            showToast.apiError(errorResponse, "删除角色失败");
            set({
              error: errorResponse.message || "删除角色失败",
              isSubmitting: false,
            });
            return false;
          }
        } catch (err: any) {
          const errorMessage = err.message || "删除角色时发生意外错误";
          showToast.error(errorMessage);
          await handleError(err, "删除角色失败");
          set({ error: errorMessage, isSubmitting: false });
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
          const newRole = await createRole(newName);

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
          const errorMessage = err.message || "复制角色时发生意外错误";
          showToast.error(errorMessage);
          await handleError(err, "复制角色失败");
          set({ error: errorMessage, isSubmitting: false });
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

          if ("data" in response && response.data) {
            const permissions = (
              response as PaginatedResponse<Permission>
            ).data.map(sanitizePermission);
            set({
              permissions,
              permissionGroups: groupPermissions(permissions),
              isLoadingPermissions: false,
            });
          } else {
            const errorResponse = response as ErrorResponse;
            showToast.apiError(errorResponse, "获取权限列表失败");
            set({
              error: errorResponse.message || "获取权限列表失败",
              isLoadingPermissions: false,
            });
          }
        } catch (err: any) {
          const errorMessage = err.message || "获取权限列表时发生意外错误";
          showToast.error(errorMessage);
          await handleError(err, "获取权限列表失败");
          set({ error: errorMessage, isLoadingPermissions: false });
        }
      },

      syncPermissions: async (roleId: number, permissionIds: number[]) => {
        set({ isSubmitting: true, error: null });
        try {
          const response = await syncRolePermissionsAction(
            roleId,
            permissionIds
          );
          if (response.code >= 200 && response.code < 300) {
            showToast.success("权限同步成功");
            cacheManager.invalidate(CACHE_KEYS.ROLE_DETAIL(roleId));
            const updatedRole = await get().fetchRoleById(roleId);
            set({ isSubmitting: false });
            return updatedRole;
          } else {
            const errorResponse = response as ErrorResponse;
            showToast.apiError(errorResponse, "同步权限失败");
            set({
              error: errorResponse.message || "同步权限失败",
              isSubmitting: false,
            });
            return null;
          }
        } catch (err: any) {
          const errorMessage = err.message || "同步权限时发生意外错误";
          showToast.error(errorMessage);
          await handleError(err, "同步权限失败");
          set({ error: errorMessage, isSubmitting: false });
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
          if (response.code >= 200 && response.code < 300) {
            showToast.success("分配权限成功");
            cacheManager.invalidate(CACHE_KEYS.ROLE_DETAIL(roleId));
            const updatedRole = await get().fetchRoleById(roleId);
            set({ isSubmitting: false });
            return updatedRole;
          } else {
            const errorResponse = response as ErrorResponse;
            showToast.apiError(errorResponse, "分配权限失败");
            set({
              error: errorResponse.message || "分配权限失败",
              isSubmitting: false,
            });
            return null;
          }
        } catch (err: any) {
          const errorMessage = err.message || "分配权限时发生意外错误";
          showToast.error(errorMessage);
          await handleError(err, "分配权限失败");
          set({ error: errorMessage, isSubmitting: false });
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
          if (response.code >= 200 && response.code < 300) {
            showToast.success("移除权限成功");
            cacheManager.invalidate(CACHE_KEYS.ROLE_DETAIL(roleId));
            await get().fetchRoleById(roleId);
            set({ isSubmitting: false });
            return true;
          } else {
            const errorResponse = response as ErrorResponse;
            showToast.apiError(errorResponse, "移除权限失败");
            set({
              error: errorResponse.message || "移除权限失败",
              isSubmitting: false,
            });
            return false;
          }
        } catch (err: any) {
          const errorMessage = err.message || "移除权限时发生意外错误";
          showToast.error(errorMessage);
          await handleError(err, "移除权限失败");
          set({ error: errorMessage, isSubmitting: false });
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
