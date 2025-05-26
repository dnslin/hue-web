import { Role, Permission, PermissionGroup } from "@/lib/types/user";

// Mock权限数据
const mockPermissions: Permission[] = [
  // 用户管理权限
  {
    id: "user.view",
    name: "查看用户",
    description: "查看用户列表和详细信息",
    resource: "user",
    action: "view",
  },
  {
    id: "user.create",
    name: "创建用户",
    description: "创建新用户账户",
    resource: "user",
    action: "create",
  },
  {
    id: "user.update",
    name: "编辑用户",
    description: "修改用户信息和设置",
    resource: "user",
    action: "update",
  },
  {
    id: "user.delete",
    name: "删除用户",
    description: "删除用户账户",
    resource: "user",
    action: "delete",
  },
  {
    id: "user.manage_status",
    name: "管理用户状态",
    description: "启用、禁用或封禁用户",
    resource: "user",
    action: "manage_status",
  },
  {
    id: "user.reset_password",
    name: "重置密码",
    description: "重置用户密码",
    resource: "user",
    action: "reset_password",
  },

  // 角色权限管理
  {
    id: "role.view",
    name: "查看角色",
    description: "查看角色列表和权限配置",
    resource: "role",
    action: "view",
  },
  {
    id: "role.create",
    name: "创建角色",
    description: "创建新的用户角色",
    resource: "role",
    action: "create",
  },
  {
    id: "role.update",
    name: "编辑角色",
    description: "修改角色权限配置",
    resource: "role",
    action: "update",
  },
  {
    id: "role.delete",
    name: "删除角色",
    description: "删除用户角色",
    resource: "role",
    action: "delete",
  },

  // 文件管理权限
  {
    id: "file.view",
    name: "查看文件",
    description: "查看文件列表和详细信息",
    resource: "file",
    action: "view",
  },
  {
    id: "file.upload",
    name: "上传文件",
    description: "上传新文件",
    resource: "file",
    action: "upload",
  },
  {
    id: "file.download",
    name: "下载文件",
    description: "下载文件",
    resource: "file",
    action: "download",
  },
  {
    id: "file.delete",
    name: "删除文件",
    description: "删除文件",
    resource: "file",
    action: "delete",
  },
  {
    id: "file.manage_others",
    name: "管理他人文件",
    description: "管理其他用户的文件",
    resource: "file",
    action: "manage_others",
  },

  // 系统设置权限
  {
    id: "system.view_settings",
    name: "查看系统设置",
    description: "查看系统配置信息",
    resource: "system",
    action: "view_settings",
  },
  {
    id: "system.update_settings",
    name: "修改系统设置",
    description: "修改系统配置",
    resource: "system",
    action: "update_settings",
  },
  {
    id: "system.view_logs",
    name: "查看系统日志",
    description: "查看系统操作日志",
    resource: "system",
    action: "view_logs",
  },
  {
    id: "system.manage_storage",
    name: "存储管理",
    description: "管理存储策略和配置",
    resource: "system",
    action: "manage_storage",
  },

  // 数据统计权限
  {
    id: "analytics.view",
    name: "查看统计数据",
    description: "查看系统统计和分析数据",
    resource: "analytics",
    action: "view",
  },
  {
    id: "analytics.export",
    name: "导出数据",
    description: "导出统计和用户数据",
    resource: "analytics",
    action: "export",
  },
];

// Mock权限分组
export const mockPermissionGroups: PermissionGroup[] = [
  {
    name: "用户管理",
    description: "用户账户相关的权限",
    permissions: mockPermissions.filter((p) => p.resource === "user"),
  },
  {
    name: "角色权限",
    description: "角色和权限管理相关的权限",
    permissions: mockPermissions.filter((p) => p.resource === "role"),
  },
  {
    name: "文件管理",
    description: "文件上传、下载和管理相关的权限",
    permissions: mockPermissions.filter((p) => p.resource === "file"),
  },
  {
    name: "系统管理",
    description: "系统设置和配置相关的权限",
    permissions: mockPermissions.filter((p) => p.resource === "system"),
  },
  {
    name: "数据统计",
    description: "数据分析和导出相关的权限",
    permissions: mockPermissions.filter((p) => p.resource === "analytics"),
  },
];

// Mock角色数据
const mockRoles: Role[] = [
  {
    id: "admin",
    name: "管理员",
    description: "系统管理员，拥有所有权限",
    permissions: mockPermissions, // 管理员拥有所有权限
    user_count: 1,
    created_at: "2024-01-15T08:30:00Z",
    updated_at: "2024-01-15T08:30:00Z",
  },
  {
    id: "moderator",
    name: "版主",
    description: "版主，拥有用户管理和内容管理权限",
    permissions: mockPermissions.filter((p) =>
      [
        "user.view",
        "user.update",
        "user.manage_status",
        "file.view",
        "file.manage_others",
        "analytics.view",
      ].includes(p.id)
    ),
    user_count: 1,
    created_at: "2024-02-20T14:20:00Z",
    updated_at: "2024-02-20T14:20:00Z",
  },
  {
    id: "user",
    name: "普通用户",
    description: "普通用户，拥有基础的文件操作权限",
    permissions: mockPermissions.filter((p) =>
      ["file.view", "file.upload", "file.download", "file.delete"].includes(
        p.id
      )
    ),
    user_count: 8,
    created_at: "2024-01-15T08:30:00Z",
    updated_at: "2024-01-15T08:30:00Z",
  },
];

// 获取所有角色
export function getMockRoles(): Role[] {
  return [...mockRoles];
}

// 根据ID获取角色
export function getMockRoleById(id: string): Role | undefined {
  return mockRoles.find((role) => role.id === id);
}

// 获取权限分组
export function getMockPermissionGroups(): PermissionGroup[] {
  return [...mockPermissionGroups];
}

// 获取所有权限
export function getMockPermissions(): Permission[] {
  return [...mockPermissions];
}

// 创建新角色
export function createMockRole(
  name: string,
  description: string,
  permissionIds: string[]
): Role {
  const permissions = mockPermissions.filter((p) =>
    permissionIds.includes(p.id)
  );

  const newRole: Role = {
    id: `role_${Date.now()}`,
    name,
    description,
    permissions,
    user_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  mockRoles.push(newRole);
  return newRole;
}

// 更新角色
export function updateMockRole(
  id: string,
  updates: {
    name?: string;
    description?: string;
    permissionIds?: string[];
  }
): Role | null {
  const roleIndex = mockRoles.findIndex((role) => role.id === id);
  if (roleIndex === -1) return null;

  const role = mockRoles[roleIndex];

  if (updates.name) role.name = updates.name;
  if (updates.description) role.description = updates.description;
  if (updates.permissionIds) {
    role.permissions = mockPermissions.filter((p) =>
      updates.permissionIds!.includes(p.id)
    );
  }

  role.updated_at = new Date().toISOString();

  return role;
}

// 删除角色
export function deleteMockRole(id: string): boolean {
  const roleIndex = mockRoles.findIndex((role) => role.id === id);
  if (roleIndex === -1) return false;

  mockRoles.splice(roleIndex, 1);
  return true;
}

// 复制角色
export function duplicateMockRole(id: string, newName: string): Role | null {
  const originalRole = getMockRoleById(id);
  if (!originalRole) return null;

  const duplicatedRole: Role = {
    id: `role_${Date.now()}`,
    name: newName,
    description: `${originalRole.description} (副本)`,
    permissions: [...originalRole.permissions],
    user_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  mockRoles.push(duplicatedRole);
  return duplicatedRole;
}
