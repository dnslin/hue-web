import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  Role,
  Permission,
  BackendRoleResponse,
  convertBackendRolesToRoles,
  convertBackendPermissionToPermission,
} from "@/lib/types/roles";
import {
  PaginatedResponse,
  ErrorResponse,
  SuccessResponse,
} from "@/lib/types/user";
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
  permissions.forEach((permission) => {
    if (!groups[permission.groupName]) {
      // 更新: group_name -> groupName
      groups[permission.groupName] = {
        // 更新: group_name -> groupName
        name: permission.groupName, // 更新: group_name -> groupName
        description: permission.description, // Or a predefined description for the group
        permissions: [],
      };
    }
    groups[permission.groupName].permissions.push(permission); // 更新: group_name -> groupName
  });
  return Object.values(groups);
};

export const useRoleStore = create<RoleStoreState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      fetchRoles: async (page = 1, pageSize = 10) => {
        set({ isLoadingRoles: true, error: null });
        try {
          const response = await getRolesAction({ page, page_size: pageSize });

          // 处理后端直接返回角色数组的情况（不是标准的PaginatedResponse）
          if (Array.isArray(response)) {
            // 后端直接返回BackendRoleResponse数组，进行数据转换
            const backendRoles = response as BackendRoleResponse[];
            const convertedRoles = convertBackendRolesToRoles(backendRoles);
            set({
              roles: convertedRoles,
              pagination: {
                page: 1,
                pageSize: convertedRoles.length,
                total: convertedRoles.length,
              },
              isLoadingRoles: false,
            });
          } else if ("data" in response && response.data && response.meta) {
            // 标准的PaginatedResponse格式
            const paginatedResponse =
              response as unknown as PaginatedResponse<BackendRoleResponse>;
            const convertedRoles = convertBackendRolesToRoles(
              paginatedResponse.data
            );
            set({
              roles: convertedRoles,
              pagination: {
                page: paginatedResponse.meta.page,
                pageSize: paginatedResponse.meta.page_size,
                total: paginatedResponse.meta.total,
              },
              isLoadingRoles: false,
            });
          } else {
            const errorResponse = response as ErrorResponse;
            console.error("获取角色列表失败 (Store):", errorResponse.message);
            set({
              error: errorResponse.message || "获取角色列表失败",
              isLoadingRoles: false,
            });
          }
        } catch (err: any) {
          console.error("获取角色列表时发生意外错误 (Store):", err);
          set({
            error: err.message || "获取角色列表时发生意外错误",
            isLoadingRoles: false,
          });
        }
      },

      fetchRoleById: async (id) => {
        set({ isLoadingRoles: true, error: null });
        try {
          const response = await getRoleByIdAction(id);
          if ("data" in response && response.data) {
            const role = (response as SuccessResponse<Role>).data as Role;
            set((state) => ({
              roles: state.roles.map((r) => (r.id === id ? role : r)),
              selectedRole:
                state.selectedRole?.id === id ? role : state.selectedRole,
              isLoadingRoles: false,
            }));
            return role;
          } else {
            const errorResponse = response as ErrorResponse;
            set({
              error: errorResponse.message || "获取角色详情失败",
              isLoadingRoles: false,
            });
            return null;
          }
        } catch (err: any) {
          set({
            error: err.message || "获取角色详情时发生意外错误",
            isLoadingRoles: false,
          });
          return null;
        }
      },

      createRole: async (name: string) => {
        set({ isSubmitting: true, error: null });
        try {
          const response = await createRoleAction({ name });
          if ("data" in response && response.data) {
            const newRole = (response as SuccessResponse<Role>).data as Role;
            set((state) => ({
              roles: [...state.roles, newRole],
              isSubmitting: false,
            }));
            await get().fetchRoles(
              get().pagination.page,
              get().pagination.pageSize
            ); // Refresh list
            return newRole;
          } else {
            const errorResponse = response as ErrorResponse;
            set({
              error: errorResponse.message || "创建角色失败",
              isSubmitting: false,
            });
            return null;
          }
        } catch (err: any) {
          set({
            error: err.message || "创建角色时发生意外错误",
            isSubmitting: false,
          });
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
            set((state) => ({
              roles: state.roles.map((r) => (r.id === id ? updatedRole : r)),
              selectedRole:
                state.selectedRole?.id === id
                  ? updatedRole
                  : state.selectedRole,
              isSubmitting: false,
            }));
            return updatedRole;
          } else {
            const errorResponse = response as ErrorResponse;
            set({
              error: errorResponse.message || "更新角色失败",
              isSubmitting: false,
            });
            return null;
          }
        } catch (err: any) {
          set({
            error: err.message || "更新角色时发生意外错误",
            isSubmitting: false,
          });
          return null;
        }
      },

      deleteRole: async (id: number) => {
        set({ isSubmitting: true, error: null });
        try {
          const response = await deleteRoleAction(id);
          if (
            !("code" in response) ||
            (response.code >= 200 && response.code < 300)
          ) {
            // Success has no specific data, just success code
            set((state) => ({
              roles: state.roles.filter((r) => r.id !== id),
              selectedRole:
                state.selectedRole?.id === id ? null : state.selectedRole,
              isSubmitting: false,
            }));
            await get().fetchRoles(
              get().pagination.page,
              get().pagination.pageSize
            ); // Refresh list
            return true;
          } else {
            const errorResponse = response as ErrorResponse;
            set({
              error: errorResponse.message || "删除角色失败",
              isSubmitting: false,
            });
            return false;
          }
        } catch (err: any) {
          set({
            error: err.message || "删除角色时发生意外错误",
            isSubmitting: false,
          });
          return false;
        }
      },

      // TODO: Implement duplicateRole if needed, potentially by:
      // 1. Fetching the role to duplicate (getRoleByIdAction)
      // 2. Creating a new role with a modified name and the fetched permissions (createRoleAction, then syncPermissionsAction)

      fetchPermissions: async (groupName?: string) => {
        set({ isLoadingPermissions: true, error: null });
        try {
          // Fetch all pages of permissions if pagination is involved, or assume backend returns all if not paginated by default
          // For simplicity, assuming getPermissionsAction can fetch all or by group
          const response = await getPermissionsAction({
            group_name: groupName,
            page_size: 1000,
          }); // Fetch a large number to get all
          if ("data" in response && response.data) {
            const permissions = (response as PaginatedResponse<Permission>)
              .data;
            set({
              permissions,
              permissionGroups: groupPermissions(permissions),
              isLoadingPermissions: false,
            });
          } else {
            const errorResponse = response as ErrorResponse;
            set({
              error: errorResponse.message || "获取权限列表失败",
              isLoadingPermissions: false,
            });
          }
        } catch (err: any) {
          set({
            error: err.message || "获取权限列表时发生意外错误",
            isLoadingPermissions: false,
          });
        }
      },

      syncPermissions: async (roleId: number, permissionIds: number[]) => {
        set({ isSubmitting: true, error: null });
        try {
          const response = await syncRolePermissionsAction(
            roleId,
            permissionIds
          );
          if ("data" in response && response.data) {
            const updatedRole = (response as SuccessResponse<Role>)
              .data as Role;
            set((state) => ({
              roles: state.roles.map((r) =>
                r.id === roleId ? updatedRole : r
              ),
              selectedRole:
                state.selectedRole?.id === roleId
                  ? updatedRole
                  : state.selectedRole,
              isSubmitting: false,
            }));
            return updatedRole;
          } else {
            const errorResponse = response as ErrorResponse;
            set({
              error: errorResponse.message || "同步权限失败",
              isSubmitting: false,
            });
            return null;
          }
        } catch (err: any) {
          set({
            error: err.message || "同步权限时发生意外错误",
            isSubmitting: false,
          });
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
          if ("data" in response && response.data) {
            const updatedRole = (response as SuccessResponse<Role>)
              .data as Role;
            set((state) => ({
              roles: state.roles.map((r) =>
                r.id === roleId ? updatedRole : r
              ),
              selectedRole:
                state.selectedRole?.id === roleId
                  ? updatedRole
                  : state.selectedRole,
              isSubmitting: false,
            }));
            return updatedRole;
          } else {
            const errorResponse = response as ErrorResponse;
            set({
              error: errorResponse.message || "分配权限失败",
              isSubmitting: false,
            });
            return null;
          }
        } catch (err: any) {
          set({
            error: err.message || "分配权限时发生意外错误",
            isSubmitting: false,
          });
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
          if (
            !("code" in response) ||
            (response.code >= 200 && response.code < 300)
          ) {
            // Successfully removed, now fetch the updated role to reflect changes
            const updatedRole = await get().fetchRoleById(roleId);
            if (updatedRole) {
              set((state) => ({
                roles: state.roles.map((r) =>
                  r.id === roleId ? updatedRole : r
                ),
                selectedRole:
                  state.selectedRole?.id === roleId
                    ? updatedRole
                    : state.selectedRole,
                isSubmitting: false,
              }));
            } else {
              // Fallback: refresh all roles if fetching single role fails
              await get().fetchRoles(
                get().pagination.page,
                get().pagination.pageSize
              );
            }
            set({ isSubmitting: false });
            return true;
          } else {
            const errorResponse = response as ErrorResponse;
            set({
              error: errorResponse.message || "移除权限失败",
              isSubmitting: false,
            });
            return false;
          }
        } catch (err: any) {
          set({
            error: err.message || "移除权限时发生意外错误",
            isSubmitting: false,
          });
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
