import {
  User,
  UserListParams,
  UserListResponse,
  CreateUserRequest,
  UpdateUserRequest,
  UserStats,
} from "@/lib/types/user";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

// 获取用户列表
export async function getUserList(
  params: UserListParams = {}
): Promise<UserListResponse> {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, value.toString());
    }
  });

  const response = await fetch(`${API_BASE}/users?${searchParams}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`获取用户列表失败: ${response.statusText}`);
  }

  return response.json();
}

// 获取单个用户详情
export async function getUserById(id: number): Promise<User> {
  const response = await fetch(`${API_BASE}/users/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`获取用户详情失败: ${response.statusText}`);
  }

  return response.json();
}

// 创建新用户
export async function createUser(userData: CreateUserRequest): Promise<User> {
  const response = await fetch(`${API_BASE}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    throw new Error(`创建用户失败: ${response.statusText}`);
  }

  return response.json();
}

// 更新用户信息
export async function updateUser(
  id: number,
  userData: UpdateUserRequest
): Promise<User> {
  const response = await fetch(`${API_BASE}/users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    throw new Error(`更新用户失败: ${response.statusText}`);
  }

  return response.json();
}

// 删除用户
export async function deleteUser(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/users/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`删除用户失败: ${response.statusText}`);
  }
}

// 批量删除用户
export async function batchDeleteUsers(ids: number[]): Promise<void> {
  const response = await fetch(`${API_BASE}/users/batch`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    throw new Error(`批量删除用户失败: ${response.statusText}`);
  }
}

// 启用/禁用用户
export async function toggleUserStatus(
  id: number,
  status: number
): Promise<User> {
  const response = await fetch(`${API_BASE}/users/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error(`更新用户状态失败: ${response.statusText}`);
  }

  return response.json();
}

// 重置用户密码
export async function resetUserPassword(
  id: number,
  newPassword: string
): Promise<void> {
  const response = await fetch(`${API_BASE}/users/${id}/password`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ password: newPassword }),
  });

  if (!response.ok) {
    throw new Error(`重置密码失败: ${response.statusText}`);
  }
}

// 获取用户统计信息
export async function getUserStats(): Promise<UserStats> {
  const response = await fetch(`${API_BASE}/users/stats`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`获取用户统计失败: ${response.statusText}`);
  }

  return response.json();
}

// 导出用户数据
export async function exportUsers(params: UserListParams = {}): Promise<Blob> {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, value.toString());
    }
  });

  const response = await fetch(`${API_BASE}/users/export?${searchParams}`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`导出用户数据失败: ${response.statusText}`);
  }

  return response.blob();
}
