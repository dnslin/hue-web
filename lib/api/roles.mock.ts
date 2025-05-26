import {
  Role,
  Permission,
  PermissionGroup,
  CreateRoleRequest,
  UpdateRoleRequest,
} from "@/lib/types/user";
import {
  getMockRoles,
  getMockRoleById,
  getMockPermissionGroups,
  getMockPermissions,
  createMockRole,
  updateMockRole,
  deleteMockRole,
  duplicateMockRole,
} from "@/lib/mock/roleData";

// 模拟网络延迟
const delay = (ms: number = 300) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// 获取角色列表
export async function getRoleList(): Promise<Role[]> {
  await delay();
  return getMockRoles();
}

// 根据ID获取角色
export async function getRoleById(id: string): Promise<Role> {
  await delay();

  const role = getMockRoleById(id);
  if (!role) {
    throw new Error(`角色不存在: ID ${id}`);
  }

  return role;
}

// 创建新角色
export async function createRole(roleData: CreateRoleRequest): Promise<Role> {
  await delay();

  return createMockRole(
    roleData.name,
    roleData.description || "",
    roleData.permissions
  );
}

// 更新角色
export async function updateRole(
  id: string,
  roleData: UpdateRoleRequest
): Promise<Role> {
  await delay();

  const updatedRole = updateMockRole(id, {
    name: roleData.name,
    description: roleData.description,
    permissionIds: roleData.permissions,
  });

  if (!updatedRole) {
    throw new Error(`角色不存在: ID ${id}`);
  }

  return updatedRole;
}

// 删除角色
export async function deleteRole(id: string): Promise<void> {
  await delay();

  const success = deleteMockRole(id);
  if (!success) {
    throw new Error(`角色不存在: ID ${id}`);
  }
}

// 复制角色
export async function duplicateRole(
  id: string,
  newName: string
): Promise<Role> {
  await delay();

  const duplicatedRole = duplicateMockRole(id, newName);
  if (!duplicatedRole) {
    throw new Error(`角色不存在: ID ${id}`);
  }

  return duplicatedRole;
}

// 获取权限分组
export async function getPermissionGroups(): Promise<PermissionGroup[]> {
  await delay();
  return getMockPermissionGroups();
}

// 获取所有权限
export async function getPermissionList(): Promise<Permission[]> {
  await delay();
  return getMockPermissions();
}

// 为角色分配权限
export async function assignPermissionsToRole(
  roleId: string,
  permissionIds: string[]
): Promise<Role> {
  await delay();

  const role = getMockRoleById(roleId);
  if (!role) {
    throw new Error(`角色不存在: ID ${roleId}`);
  }

  const currentPermissionIds = role.permissions.map((p) => p.id);
  const newPermissionIds = [
    ...new Set([...currentPermissionIds, ...permissionIds]),
  ];

  const updatedRole = updateMockRole(roleId, {
    permissionIds: newPermissionIds,
  });

  if (!updatedRole) {
    throw new Error(`更新角色权限失败: ID ${roleId}`);
  }

  return updatedRole;
}

// 从角色移除权限
export async function removePermissionsFromRole(
  roleId: string,
  permissionIds: string[]
): Promise<Role> {
  await delay();

  const role = getMockRoleById(roleId);
  if (!role) {
    throw new Error(`角色不存在: ID ${roleId}`);
  }

  const currentPermissionIds = role.permissions.map((p) => p.id);
  const newPermissionIds = currentPermissionIds.filter(
    (id) => !permissionIds.includes(id)
  );

  const updatedRole = updateMockRole(roleId, {
    permissionIds: newPermissionIds,
  });

  if (!updatedRole) {
    throw new Error(`更新角色权限失败: ID ${roleId}`);
  }

  return updatedRole;
}
