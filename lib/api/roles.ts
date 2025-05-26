import {
  Role,
  Permission,
  PermissionGroup,
  CreateRoleRequest,
  UpdateRoleRequest,
} from "@/lib/types/user";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

// 获取所有角色列表
export async function getRoleList(): Promise<Role[]> {
  const response = await fetch(`${API_BASE}/roles`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`获取角色列表失败: ${response.statusText}`);
  }

  return response.json();
}

// 获取单个角色详情
export async function getRoleById(id: string): Promise<Role> {
  const response = await fetch(`${API_BASE}/roles/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`获取角色详情失败: ${response.statusText}`);
  }

  return response.json();
}

// 创建新角色
export async function createRole(roleData: CreateRoleRequest): Promise<Role> {
  const response = await fetch(`${API_BASE}/roles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(roleData),
  });

  if (!response.ok) {
    throw new Error(`创建角色失败: ${response.statusText}`);
  }

  return response.json();
}

// 更新角色信息
export async function updateRole(
  id: string,
  roleData: UpdateRoleRequest
): Promise<Role> {
  const response = await fetch(`${API_BASE}/roles/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(roleData),
  });

  if (!response.ok) {
    throw new Error(`更新角色失败: ${response.statusText}`);
  }

  return response.json();
}

// 删除角色
export async function deleteRole(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/roles/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`删除角色失败: ${response.statusText}`);
  }
}

// 获取所有权限列表
export async function getPermissionList(): Promise<Permission[]> {
  const response = await fetch(`${API_BASE}/permissions`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`获取权限列表失败: ${response.statusText}`);
  }

  return response.json();
}

// 获取权限分组
export async function getPermissionGroups(): Promise<PermissionGroup[]> {
  const response = await fetch(`${API_BASE}/permissions/groups`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`获取权限分组失败: ${response.statusText}`);
  }

  return response.json();
}

// 为角色分配权限
export async function assignPermissionsToRole(
  roleId: string,
  permissionIds: string[]
): Promise<Role> {
  const response = await fetch(`${API_BASE}/roles/${roleId}/permissions`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ permissions: permissionIds }),
  });

  if (!response.ok) {
    throw new Error(`分配权限失败: ${response.statusText}`);
  }

  return response.json();
}

// 移除角色权限
export async function removePermissionsFromRole(
  roleId: string,
  permissionIds: string[]
): Promise<Role> {
  const response = await fetch(`${API_BASE}/roles/${roleId}/permissions`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ permissions: permissionIds }),
  });

  if (!response.ok) {
    throw new Error(`移除权限失败: ${response.statusText}`);
  }

  return response.json();
}

// 检查角色是否有特定权限
export async function checkRolePermission(
  roleId: string,
  permissionId: string
): Promise<boolean> {
  const response = await fetch(
    `${API_BASE}/roles/${roleId}/permissions/${permissionId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error(`检查权限失败: ${response.statusText}`);
  }

  const result = await response.json();
  return result.hasPermission;
}

// 复制角色权限
export async function duplicateRole(
  sourceRoleId: string,
  newRoleName: string
): Promise<Role> {
  const response = await fetch(`${API_BASE}/roles/${sourceRoleId}/duplicate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ name: newRoleName }),
  });

  if (!response.ok) {
    throw new Error(`复制角色失败: ${response.statusText}`);
  }

  return response.json();
}
