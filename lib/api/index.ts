// API调用的统一入口
// 根据环境变量选择使用mock或真实API

const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === "true";

// 调试信息
if (typeof window !== "undefined") {
  console.log("🔧 API配置:", {
    NEXT_PUBLIC_USE_MOCK_API: process.env.NEXT_PUBLIC_USE_MOCK_API,
    USE_MOCK_API,
    mode: USE_MOCK_API ? "Mock API" : "Real API",
  });
}

// 用户API
export const userApi = USE_MOCK_API
  ? import("./users.mock")
  : import("./users");

// 角色API
export const roleApi = USE_MOCK_API
  ? import("./roles.mock")
  : import("./roles");

// 导出用户API函数
export async function getUserList(
  ...args: Parameters<typeof import("./users").getUserList>
) {
  const api = await userApi;
  return api.getUserList(...args);
}

export async function getUserById(
  ...args: Parameters<typeof import("./users").getUserById>
) {
  const api = await userApi;
  return api.getUserById(...args);
}

export async function createUser(
  ...args: Parameters<typeof import("./users").createUser>
) {
  const api = await userApi;
  return api.createUser(...args);
}

export async function updateUser(
  ...args: Parameters<typeof import("./users").updateUser>
) {
  const api = await userApi;
  return api.updateUser(...args);
}

export async function deleteUser(
  ...args: Parameters<typeof import("./users").deleteUser>
) {
  const api = await userApi;
  return api.deleteUser(...args);
}

export async function batchDeleteUsers(
  ...args: Parameters<typeof import("./users").batchDeleteUsers>
) {
  const api = await userApi;
  return api.batchDeleteUsers(...args);
}

export async function toggleUserStatus(
  ...args: Parameters<typeof import("./users").toggleUserStatus>
) {
  const api = await userApi;
  return api.toggleUserStatus(...args);
}

export async function resetUserPassword(
  ...args: Parameters<typeof import("./users").resetUserPassword>
) {
  const api = await userApi;
  return api.resetUserPassword(...args);
}

export async function getUserStats(
  ...args: Parameters<typeof import("./users").getUserStats>
) {
  const api = await userApi;
  return api.getUserStats(...args);
}

export async function exportUsers(
  ...args: Parameters<typeof import("./users").exportUsers>
) {
  const api = await userApi;
  return api.exportUsers(...args);
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
