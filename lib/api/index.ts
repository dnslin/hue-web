// API调用的统一入口
// 直接使用真实的管理员API

// 用户API - 使用管理员API
export const userApi = import("./adminUsers");

// 角色API - 使用真实API
export const roleApi = import("./roles");

// 导出用户API函数 - 映射到管理员API
export async function getUserList(
  ...args: Parameters<typeof import("./adminUsers").getAdminUserList>
) {
  const api = await userApi;
  return api.getAdminUserList(...args);
}

export async function createUser(
  ...args: Parameters<typeof import("./adminUsers").createAdminUser>
) {
  const api = await userApi;
  return api.createAdminUser(...args);
}

export async function updateUser(
  ...args: Parameters<typeof import("./adminUsers").updateAdminUser>
) {
  const api = await userApi;
  return api.updateAdminUser(...args);
}

export async function deleteUser(
  ...args: Parameters<typeof import("./adminUsers").deleteAdminUser>
) {
  const api = await userApi;
  return api.deleteAdminUser(...args);
}

export async function changeUserStatus(
  ...args: Parameters<typeof import("./adminUsers").changeUserStatus>
) {
  const api = await userApi;
  return api.changeUserStatus(...args);
}

export async function exportUsers(
  ...args: Parameters<typeof import("./adminUsers").exportAdminUsers>
) {
  const api = await userApi;
  return api.exportAdminUsers(...args);
}

// 批量操作函数
export async function batchApproveUsers(
  ...args: Parameters<typeof import("./adminUsers").batchApproveUsers>
) {
  const api = await userApi;
  return api.batchApproveUsers(...args);
}

export async function batchRejectUsers(
  ...args: Parameters<typeof import("./adminUsers").batchRejectUsers>
) {
  const api = await userApi;
  return api.batchRejectUsers(...args);
}

export async function batchBanUsers(
  ...args: Parameters<typeof import("./adminUsers").batchBanUsers>
) {
  const api = await userApi;
  return api.batchBanUsers(...args);
}

export async function batchUnbanUsers(
  ...args: Parameters<typeof import("./adminUsers").batchUnbanUsers>
) {
  const api = await userApi;
  return api.batchUnbanUsers(...args);
}

// 兼容性函数 - 映射到新的API
export async function toggleUserStatus(userId: number, status: number) {
  const api = await userApi;
  // 根据状态选择合适的API调用
  if (status === 0) {
    // 激活用户 - 可能是从禁用状态恢复
    return api.unbanUser(userId);
  } else if (status === 1) {
    // 禁用用户
    return api.banUser(userId);
  } else {
    throw new Error(`不支持的状态值: ${status}`);
  }
}

// 重置密码功能 - 暂时不支持，返回错误
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function resetUserPassword(_userId: number, _newPassword: string) {
  throw new Error("重置密码功能暂未实现，请联系系统管理员");
}

// 导出角色API函数
export async function getRoleList(
  ...args: Parameters<typeof import("./roles").getRoleList>
) {
  const api = await roleApi;
  return api.getRoleList(...args);
}

export async function getRoleById(
  ...args: Parameters<typeof import("./roles").getRoleById>
) {
  const api = await roleApi;
  return api.getRoleById(...args);
}

export async function createRole(
  ...args: Parameters<typeof import("./roles").createRole>
) {
  const api = await roleApi;
  return api.createRole(...args);
}

export async function updateRole(
  ...args: Parameters<typeof import("./roles").updateRole>
) {
  const api = await roleApi;
  return api.updateRole(...args);
}

export async function deleteRole(
  ...args: Parameters<typeof import("./roles").deleteRole>
) {
  const api = await roleApi;
  return api.deleteRole(...args);
}

export async function duplicateRole(
  ...args: Parameters<typeof import("./roles").duplicateRole>
) {
  const api = await roleApi;
  return api.duplicateRole(...args);
}

export async function getPermissionGroups(
  ...args: Parameters<typeof import("./roles").getPermissionGroups>
) {
  const api = await roleApi;
  return api.getPermissionGroups(...args);
}

export async function getPermissionList(
  ...args: Parameters<typeof import("./roles").getPermissionList>
) {
  const api = await roleApi;
  return api.getPermissionList(...args);
}

export async function assignPermissionsToRole(
  ...args: Parameters<typeof import("./roles").assignPermissionsToRole>
) {
  const api = await roleApi;
  return api.assignPermissionsToRole(...args);
}

export async function removePermissionsFromRole(
  ...args: Parameters<typeof import("./roles").removePermissionsFromRole>
) {
  const api = await roleApi;
  return api.removePermissionsFromRole(...args);
}
