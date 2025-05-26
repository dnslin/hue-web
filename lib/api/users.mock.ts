import {
  User,
  UserListParams,
  UserListResponse,
  CreateUserRequest,
  UpdateUserRequest,
  UserStats,
  UserStatus,
} from "@/lib/types/user";
import {
  generateMockUserList,
  getMockUserById,
  updateMockUser,
  deleteMockUser,
  getMockUserStats,
} from "@/lib/mock/userData";

// 模拟网络延迟
const delay = (ms: number = 300) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// 获取用户列表
export async function getUserList(
  params: UserListParams = {}
): Promise<UserListResponse> {
  await delay();

  return generateMockUserList(
    params.page,
    params.limit,
    params.search,
    params.status,
    params.role,
    params.sort_by,
    params.sort_order
  );
}

// 获取单个用户详情
export async function getUserById(id: number): Promise<User> {
  await delay();

  const user = getMockUserById(id);
  if (!user) {
    throw new Error(`用户不存在: ID ${id}`);
  }

  return user;
}

// 创建新用户
export async function createUser(userData: CreateUserRequest): Promise<User> {
  await delay();

  // 模拟创建用户
  const newUser: User = {
    id: Date.now(), // 简单的ID生成
    username: userData.username,
    email: userData.email,
    nickname: userData.nickname,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`,
    status: userData.status || UserStatus.ACTIVE,
    role: userData.role || ("user" as any),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_login: undefined,
    storage_used: 0,
    storage_limit: 1073741824, // 1GB 默认
    upload_count: 0,
  };

  return newUser;
}

// 更新用户信息
export async function updateUser(
  id: number,
  userData: UpdateUserRequest
): Promise<User> {
  await delay();

  const updatedUser = updateMockUser(id, userData);
  if (!updatedUser) {
    throw new Error(`用户不存在: ID ${id}`);
  }

  return updatedUser;
}

// 删除用户
export async function deleteUser(id: number): Promise<void> {
  await delay();

  const success = deleteMockUser(id);
  if (!success) {
    throw new Error(`用户不存在: ID ${id}`);
  }
}

// 批量删除用户
export async function batchDeleteUsers(ids: number[]): Promise<void> {
  await delay();

  for (const id of ids) {
    deleteMockUser(id);
  }
}

// 启用/禁用用户
export async function toggleUserStatus(
  id: number,
  status: UserStatus
): Promise<User> {
  await delay();

  const updatedUser = updateMockUser(id, { status });
  if (!updatedUser) {
    throw new Error(`用户不存在: ID ${id}`);
  }

  return updatedUser;
}

// 重置用户密码
export async function resetUserPassword(
  id: number,
  newPassword: string
): Promise<void> {
  await delay();

  const user = getMockUserById(id);
  if (!user) {
    throw new Error(`用户不存在: ID ${id}`);
  }

  // 模拟密码重置成功
  console.log(`用户 ${user.username} 的密码已重置为: ${newPassword}`);
}

// 获取用户统计信息
export async function getUserStats(): Promise<UserStats> {
  await delay();

  return getMockUserStats();
}

// 导出用户数据
export async function exportUsers(params: UserListParams = {}): Promise<Blob> {
  await delay();

  const userList = generateMockUserList(
    1,
    1000, // 导出所有数据
    params.search,
    params.status,
    params.role,
    params.sort_by,
    params.sort_order
  );

  // 生成CSV格式的数据
  const headers = [
    "ID",
    "用户名",
    "邮箱",
    "昵称",
    "状态",
    "角色",
    "注册时间",
    "最后登录",
    "上传数量",
    "存储使用",
    "存储限制",
  ];

  const csvContent = [
    headers.join(","),
    ...userList.data.map((user) =>
      [
        user.id,
        user.username,
        user.email,
        user.nickname || "",
        user.status === UserStatus.ACTIVE
          ? "正常"
          : user.status === UserStatus.INACTIVE
          ? "未激活"
          : "已封禁",
        user.role === "admin"
          ? "管理员"
          : user.role === "moderator"
          ? "版主"
          : "普通用户",
        new Date(user.created_at).toLocaleString("zh-CN"),
        user.last_login
          ? new Date(user.last_login).toLocaleString("zh-CN")
          : "从未登录",
        user.upload_count || 0,
        user.storage_used || 0,
        user.storage_limit || 0,
      ].join(",")
    ),
  ].join("\n");

  // 添加BOM以支持中文
  const bom = "\uFEFF";
  return new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" });
}
