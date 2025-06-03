/**
 * 用户API适配器
 * 提供新旧接口的兼容性，支持渐进式迁移
 */

import {
  User,
  UserListParams,
  UserListResponse,
  UserUpdateRequest,
  AdminUserCreateRequest,
  SuccessResponse,
  BatchOperationResult,
  UserStatus,
  getRoleId,
  getRoleFromId,
} from "@/lib/types/user";

// 导入新的管理员API
import * as adminAPI from "./adminUsers";

// 导入旧的用户API
import * as userAPI from "./users";

/**
 * 数据转换工具
 */
export const dataTransformers = {
  /**
   * 将前端用户数据转换为后端格式
   */
  transformUserForBackend(user: Partial<User>): Record<string, unknown> {
    const transformed: Record<string, unknown> = {};

    // 基础字段直接复制
    if (user.username) transformed.username = user.username;
    if (user.email) transformed.email = user.email;
    if (user.nickname) transformed.nickname = user.nickname;
    if (user.avatar) transformed.avatar = user.avatar;

    // 状态转换
    if (user.status !== undefined) {
      transformed.status = user.status;
    }

    // 角色转换：从角色名称转换为role_id
    if (user.role) {
      transformed.role_id = getRoleId(user.role);
    }

    return transformed;
  },

  /**
   * 将后端用户数据转换为前端格式
   */
  transformUserFromBackend(backendUser: Record<string, unknown>): User {
    return {
      id: backendUser.id as number,
      username: backendUser.username as string,
      email: backendUser.email as string,
      nickname: backendUser.nickname as string,
      avatar: backendUser.avatar as string,
      status: backendUser.status as UserStatus,
      role: getRoleFromId(backendUser.role_id as number),
      roleID: backendUser.role_id as number,
      originalRoleID: backendUser.original_role_id as number,
      created_at: backendUser.created_at as string,
      updated_at: backendUser.updated_at as string,
      last_login: backendUser.last_login as string,
      storage_used: backendUser.storage_used as number,
      storage_limit: backendUser.storage_limit as number,
      upload_count: backendUser.upload_count as number,
      passwordHash: backendUser.password_hash as string,
    };
  },

  /**
   * 转换查询参数
   */
  transformListParams(params: UserListParams): Record<string, unknown> {
    const transformed: Record<string, unknown> = { ...params };

    // 处理角色筛选：从角色名称转换为role_id
    if (params.role) {
      transformed.role_id = getRoleId(params.role);
      delete transformed.role;
    }

    // 处理搜索字段：将search映射到username或email
    if (params.search) {
      // 如果包含@符号，认为是邮箱搜索
      if (params.search.includes("@")) {
        transformed.email = params.search;
      } else {
        transformed.username = params.search;
      }
      delete transformed.search;
    }

    // 处理排序方向别名
    if (params.sort_order) {
      transformed.order = params.sort_order;
      delete transformed.sort_order;
    }

    // 移除前端专用字段
    delete transformed.isFilterOpen;
    delete transformed.hasActiveFilters;

    return transformed;
  },
};

/**
 * 统一的用户API接口
 * 根据配置自动选择使用新的管理员API或旧的用户API
 */
export class UserAPIAdapter {
  private useAdminAPI: boolean;

  constructor(useAdminAPI = true) {
    this.useAdminAPI = useAdminAPI;
  }

  /**
   * 切换API模式
   */
  setUseAdminAPI(useAdminAPI: boolean): void {
    this.useAdminAPI = useAdminAPI;
  }

  /**
   * 获取用户列表
   */
  async getUserList(params: UserListParams = {}): Promise<UserListResponse> {
    if (this.useAdminAPI) {
      const transformedParams = dataTransformers.transformListParams(params);
      return await adminAPI.getAdminUserList(transformedParams);
    } else {
      return await userAPI.getUserList(params);
    }
  }

  /**
   * 创建用户
   */
  async createUser(
    userData: AdminUserCreateRequest
  ): Promise<SuccessResponse<User>> {
    if (this.useAdminAPI) {
      return await adminAPI.createAdminUser(userData);
    } else {
      // 旧API不支持管理员创建，抛出错误
      throw new Error("旧API不支持管理员创建用户功能");
    }
  }

  /**
   * 更新用户
   */
  async updateUser(
    id: number,
    userData: UserUpdateRequest
  ): Promise<SuccessResponse<User>> {
    if (this.useAdminAPI) {
      return await adminAPI.updateAdminUser(id, userData);
    } else {
      // 使用旧API，需要转换响应格式
      const user = await userAPI.updateUser(id, userData);
      return {
        code: 200,
        message: "更新成功",
        data: user,
      };
    }
  }

  /**
   * 删除用户
   */
  async deleteUser(id: number): Promise<SuccessResponse> {
    if (this.useAdminAPI) {
      return await adminAPI.deleteAdminUser(id);
    } else {
      await userAPI.deleteUser(id);
      return {
        code: 200,
        message: "删除成功",
      };
    }
  }

  /**
   * 更改用户状态
   */
  async changeUserStatus(
    userId: number,
    fromStatus: UserStatus,
    toStatus: UserStatus,
    reason?: string
  ): Promise<SuccessResponse<User>> {
    if (this.useAdminAPI) {
      return await adminAPI.changeUserStatus(
        userId,
        fromStatus,
        toStatus,
        reason
      );
    } else {
      // 使用旧API的状态切换
      const user = await userAPI.toggleUserStatus(userId, toStatus);
      return {
        code: 200,
        message: "状态更新成功",
        data: user,
      };
    }
  }

  /**
   * 批量操作 - 仅新API支持
   */
  async batchApprove(
    userIds: number[]
  ): Promise<SuccessResponse<BatchOperationResult>> {
    if (!this.useAdminAPI) {
      throw new Error("批量操作仅在新API中支持");
    }
    return await adminAPI.batchApproveUsers(userIds);
  }

  async batchReject(
    userIds: number[],
    reason?: string
  ): Promise<SuccessResponse<BatchOperationResult>> {
    if (!this.useAdminAPI) {
      throw new Error("批量操作仅在新API中支持");
    }
    return await adminAPI.batchRejectUsers(userIds, reason);
  }

  async batchBan(
    userIds: number[]
  ): Promise<SuccessResponse<BatchOperationResult>> {
    if (!this.useAdminAPI) {
      throw new Error("批量操作仅在新API中支持");
    }
    return await adminAPI.batchBanUsers(userIds);
  }

  async batchUnban(
    userIds: number[]
  ): Promise<SuccessResponse<BatchOperationResult>> {
    if (!this.useAdminAPI) {
      throw new Error("批量操作仅在新API中支持");
    }
    return await adminAPI.batchUnbanUsers(userIds);
  }

  /**
   * 获取待审核用户 - 仅新API支持
   */
  async getPendingUsers(page = 1, pageSize = 10): Promise<UserListResponse> {
    if (!this.useAdminAPI) {
      throw new Error("获取待审核用户仅在新API中支持");
    }
    return await adminAPI.getPendingUsers(page, pageSize);
  }

  /**
   * 导出用户数据
   */
  async exportUsers(params: UserListParams = {}): Promise<Blob> {
    if (this.useAdminAPI) {
      const transformedParams = dataTransformers.transformListParams(params);
      return await adminAPI.exportAdminUsers(transformedParams);
    } else {
      return await userAPI.exportUsers(params);
    }
  }

  /**
   * 获取用户统计
   */
  async getUserStats(): Promise<Record<string, unknown>> {
    if (this.useAdminAPI) {
      return await adminAPI.getAdminUserStats();
    } else {
      const stats = await userAPI.getUserStats();
      return stats as unknown as Record<string, unknown>;
    }
  }
}

// 创建默认适配器实例
export const userAdapter = new UserAPIAdapter(true);

// 便捷函数，使用默认适配器
export const getUserList = (params?: UserListParams) =>
  userAdapter.getUserList(params);

export const createUser = (userData: AdminUserCreateRequest) =>
  userAdapter.createUser(userData);

export const updateUser = (id: number, userData: UserUpdateRequest) =>
  userAdapter.updateUser(id, userData);

export const deleteUser = (id: number) => userAdapter.deleteUser(id);

export const changeUserStatus = (
  userId: number,
  fromStatus: UserStatus,
  toStatus: UserStatus,
  reason?: string
) => userAdapter.changeUserStatus(userId, fromStatus, toStatus, reason);

export const batchApprove = (userIds: number[]) =>
  userAdapter.batchApprove(userIds);

export const batchReject = (userIds: number[], reason?: string) =>
  userAdapter.batchReject(userIds, reason);

export const batchBan = (userIds: number[]) => userAdapter.batchBan(userIds);

export const batchUnban = (userIds: number[]) =>
  userAdapter.batchUnban(userIds);

export const getPendingUsers = (page?: number, pageSize?: number) =>
  userAdapter.getPendingUsers(page, pageSize);

export const exportUsers = (params?: UserListParams) =>
  userAdapter.exportUsers(params);

export const getUserStats = () => userAdapter.getUserStats();

/**
 * API兼容性检查工具
 */
export const apiCompatibility = {
  /**
   * 检查功能是否在当前API模式下可用
   */
  isFeatureAvailable(feature: string, useAdminAPI: boolean): boolean {
    const adminOnlyFeatures = [
      "batchApprove",
      "batchReject",
      "batchBan",
      "batchUnban",
      "getPendingUsers",
      "adminCreate",
      "statusTransitions",
    ];

    if (adminOnlyFeatures.includes(feature)) {
      return useAdminAPI;
    }

    return true;
  },

  /**
   * 获取不可用功能列表
   */
  getUnavailableFeatures(useAdminAPI: boolean): string[] {
    if (useAdminAPI) {
      return []; // 新API支持所有功能
    }

    return [
      "batchApprove",
      "batchReject",
      "batchBan",
      "batchUnban",
      "getPendingUsers",
      "adminCreate",
      "statusTransitions",
    ];
  },

  /**
   * 获取API模式描述
   */
  getAPIDescription(useAdminAPI: boolean): string {
    return useAdminAPI
      ? "管理员API模式 - 支持所有高级功能"
      : "兼容模式 - 基础功能可用，部分高级功能不可用";
  },
};

/**
 * 迁移工具
 */
export const migrationUtils = {
  /**
   * 测试新API连接
   */
  async testAdminAPI(): Promise<boolean> {
    try {
      await adminAPI.getAdminUserList({ page: 1, pageSize: 1 });
      return true;
    } catch (error) {
      console.warn("新API连接测试失败:", error);
      return false;
    }
  },

  /**
   * 测试旧API连接
   */
  async testLegacyAPI(): Promise<boolean> {
    try {
      await userAPI.getUserList({ page: 1, pageSize: 1 });
      return true;
    } catch (error) {
      console.warn("旧API连接测试失败:", error);
      return false;
    }
  },

  /**
   * 自动选择最佳API模式
   */
  async selectBestAPI(): Promise<boolean> {
    const adminAPIAvailable = await this.testAdminAPI();
    const legacyAPIAvailable = await this.testLegacyAPI();

    if (adminAPIAvailable) {
      console.log("检测到新管理员API可用，使用新API模式");
      return true;
    } else if (legacyAPIAvailable) {
      console.log("新API不可用，降级到兼容模式");
      return false;
    } else {
      throw new Error("所有API都不可用");
    }
  },
};
