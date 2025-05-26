import { User, UserStatus, UserRole, UserListResponse } from "@/lib/types/user";

// Mock用户数据
const mockUsers: User[] = [
  {
    id: 1,
    username: "admin",
    email: "admin@lskypro.com",
    nickname: "系统管理员",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
    status: UserStatus.ACTIVE,
    role: UserRole.ADMIN,
    created_at: "2024-01-15T08:30:00Z",
    updated_at: "2024-12-19T10:15:00Z",
    last_login: "2024-12-19T09:45:00Z",
    storage_used: 2147483648, // 2GB
    storage_limit: 10737418240, // 10GB
    upload_count: 1250,
  },
  {
    id: 2,
    username: "moderator01",
    email: "mod@lskypro.com",
    nickname: "版主小王",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=moderator01",
    status: UserStatus.ACTIVE,
    role: UserRole.MODERATOR,
    created_at: "2024-02-20T14:20:00Z",
    updated_at: "2024-12-18T16:30:00Z",
    last_login: "2024-12-18T16:30:00Z",
    storage_used: 536870912, // 512MB
    storage_limit: 5368709120, // 5GB
    upload_count: 320,
  },
  {
    id: 3,
    username: "user001",
    email: "zhang.san@example.com",
    nickname: "张三",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user001",
    status: UserStatus.ACTIVE,
    role: UserRole.USER,
    created_at: "2024-03-10T09:15:00Z",
    updated_at: "2024-12-17T20:45:00Z",
    last_login: "2024-12-17T20:45:00Z",
    storage_used: 104857600, // 100MB
    storage_limit: 1073741824, // 1GB
    upload_count: 45,
  },
  {
    id: 4,
    username: "user002",
    email: "li.si@example.com",
    nickname: "李四",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user002",
    status: UserStatus.INACTIVE,
    role: UserRole.USER,
    created_at: "2024-04-05T11:30:00Z",
    updated_at: "2024-04-05T11:30:00Z",
    last_login: undefined,
    storage_used: 0,
    storage_limit: 1073741824, // 1GB
    upload_count: 0,
  },
  {
    id: 5,
    username: "user003",
    email: "wang.wu@example.com",
    nickname: "王五",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user003",
    status: UserStatus.BANNED,
    role: UserRole.USER,
    created_at: "2024-05-12T16:45:00Z",
    updated_at: "2024-11-20T14:20:00Z",
    last_login: "2024-11-15T10:30:00Z",
    storage_used: 52428800, // 50MB
    storage_limit: 1073741824, // 1GB
    upload_count: 12,
  },
  {
    id: 6,
    username: "photographer",
    email: "photo@example.com",
    nickname: "摄影师小刘",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=photographer",
    status: UserStatus.ACTIVE,
    role: UserRole.USER,
    created_at: "2024-06-18T13:20:00Z",
    updated_at: "2024-12-19T08:15:00Z",
    last_login: "2024-12-19T08:15:00Z",
    storage_used: 3221225472, // 3GB
    storage_limit: 5368709120, // 5GB
    upload_count: 890,
  },
  {
    id: 7,
    username: "designer",
    email: "design@example.com",
    nickname: "设计师小陈",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=designer",
    status: UserStatus.ACTIVE,
    role: UserRole.USER,
    created_at: "2024-07-22T10:10:00Z",
    updated_at: "2024-12-18T22:30:00Z",
    last_login: "2024-12-18T22:30:00Z",
    storage_used: 1610612736, // 1.5GB
    storage_limit: 2147483648, // 2GB
    upload_count: 567,
  },
  {
    id: 8,
    username: "blogger",
    email: "blog@example.com",
    nickname: "博主小赵",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=blogger",
    status: UserStatus.ACTIVE,
    role: UserRole.USER,
    created_at: "2024-08-30T15:40:00Z",
    updated_at: "2024-12-16T19:20:00Z",
    last_login: "2024-12-16T19:20:00Z",
    storage_used: 268435456, // 256MB
    storage_limit: 1073741824, // 1GB
    upload_count: 123,
  },
  {
    id: 9,
    username: "newuser",
    email: "new@example.com",
    nickname: "新用户",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=newuser",
    status: UserStatus.INACTIVE,
    role: UserRole.USER,
    created_at: "2024-12-18T20:00:00Z",
    updated_at: "2024-12-18T20:00:00Z",
    last_login: undefined,
    storage_used: 0,
    storage_limit: 1073741824, // 1GB
    upload_count: 0,
  },
  {
    id: 10,
    username: "testuser",
    email: "test@example.com",
    nickname: "测试用户",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=testuser",
    status: UserStatus.ACTIVE,
    role: UserRole.USER,
    created_at: "2024-09-15T12:25:00Z",
    updated_at: "2024-12-19T07:50:00Z",
    last_login: "2024-12-19T07:50:00Z",
    storage_used: 73400320, // 70MB
    storage_limit: 1073741824, // 1GB
    upload_count: 28,
  },
];

// 生成分页用户列表
export function generateMockUserList(
  page: number = 1,
  limit: number = 20,
  search?: string,
  status?: UserStatus,
  role?: UserRole,
  sortBy?: string,
  sortOrder?: "asc" | "desc"
): UserListResponse {
  let filteredUsers = [...mockUsers];

  // 搜索过滤
  if (search) {
    const searchLower = search.toLowerCase();
    filteredUsers = filteredUsers.filter(
      (user) =>
        user.username.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.nickname?.toLowerCase().includes(searchLower)
    );
  }

  // 状态过滤
  if (status !== undefined) {
    filteredUsers = filteredUsers.filter((user) => user.status === status);
  }

  // 角色过滤
  if (role) {
    filteredUsers = filteredUsers.filter((user) => user.role === role);
  }

  // 排序
  if (sortBy) {
    filteredUsers.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case "created_at":
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case "updated_at":
          aValue = new Date(a.updated_at);
          bValue = new Date(b.updated_at);
          break;
        case "last_login":
          aValue = a.last_login ? new Date(a.last_login) : new Date(0);
          bValue = b.last_login ? new Date(b.last_login) : new Date(0);
          break;
        case "upload_count":
          aValue = a.upload_count || 0;
          bValue = b.upload_count || 0;
          break;
        default:
          aValue = a.id;
          bValue = b.id;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }

  // 分页
  const total = filteredUsers.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const data = filteredUsers.slice(startIndex, endIndex);

  return {
    data,
    total,
    page,
    limit,
    total_pages: totalPages,
  };
}

// 根据ID获取用户
export function getMockUserById(id: number): User | undefined {
  return mockUsers.find((user) => user.id === id);
}

// 更新用户数据
export function updateMockUser(
  id: number,
  updates: Partial<User>
): User | null {
  const userIndex = mockUsers.findIndex((user) => user.id === id);
  if (userIndex === -1) return null;

  mockUsers[userIndex] = {
    ...mockUsers[userIndex],
    ...updates,
    updated_at: new Date().toISOString(),
  };

  return mockUsers[userIndex];
}

// 删除用户
export function deleteMockUser(id: number): boolean {
  const userIndex = mockUsers.findIndex((user) => user.id === id);
  if (userIndex === -1) return false;

  mockUsers.splice(userIndex, 1);
  return true;
}

// 获取用户统计
export function getMockUserStats() {
  const total = mockUsers.length;
  const active = mockUsers.filter((u) => u.status === UserStatus.ACTIVE).length;
  const inactive = mockUsers.filter(
    (u) => u.status === UserStatus.INACTIVE
  ).length;
  const banned = mockUsers.filter((u) => u.status === UserStatus.BANNED).length;

  const today = new Date();
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const newToday = mockUsers.filter(
    (u) => new Date(u.created_at) >= new Date(today.toDateString())
  ).length;

  const newThisWeek = mockUsers.filter(
    (u) => new Date(u.created_at) >= weekAgo
  ).length;

  const newThisMonth = mockUsers.filter(
    (u) => new Date(u.created_at) >= monthAgo
  ).length;

  return {
    total_users: total,
    active_users: active,
    inactive_users: inactive,
    banned_users: banned,
    new_users_today: newToday,
    new_users_this_week: newThisWeek,
    new_users_this_month: newThisMonth,
  };
}
