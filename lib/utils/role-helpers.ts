import { Role } from "@/lib/types/roles";

// --- 为动态角色设计的颜色和样式 ---

// 预定义的调色板，用于给新角色分配一致的颜色
const colorPalette = [
  "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
  "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
  "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200",
  "bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200",
  "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
];

const borderPalette = [
  "ring-cyan-500/20 ring-1",
  "ring-teal-500/20 ring-1",
  "ring-sky-500/20 ring-1",
  "ring-lime-500/20 ring-1",
  "ring-pink-500/20 ring-1",
  "ring-purple-500/20 ring-1",
  "ring-amber-500/20 ring-1",
  "ring-indigo-500/20 ring-1",
];

// 简单的哈希函数，将字符串转换为调色板内的索引
const getStringHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // 转换为32位有符号整数
  }
  return Math.abs(hash);
};

type BadgeVariant = "destructive" | "secondary" | "outline" | "default";

interface RoleBadgeInfo {
  variant: BadgeVariant;
  text: string;
}

/**
 * 根据角色对象获取徽章的显示信息。
 * @param role - 完整的角色对象，可能为 undefined。
 * @returns 返回一个包含徽章变体和显示文本的对象。
 */
export const getRoleBadgeInfo = (role?: Role): RoleBadgeInfo => {
  const roleName = role?.name?.toLowerCase() || "user";
  const displayName = role?.alias || role?.name || "用户";

  if (roleName === "admin") {
    return { variant: "destructive", text: displayName };
  }
  if (roleName === "banned_user") {
    return { variant: "secondary", text: displayName };
  }
  return { variant: "outline", text: displayName };
};

/**
 * 根据角色名称获取对应的 Tailwind CSS 颜色类名。
 * @param roleName - 角色的名称 (e.g., 'admin', 'banned_user')，可能为 undefined。
 * @returns 返回一个包含背景色和文本色的 Tailwind CSS 字符串。
 */
export const getRoleColor = (roleName?: string) => {
  const lowerCaseRoleName = roleName?.toLowerCase();
  switch (lowerCaseRoleName) {
    case "admin":
    case "管理员":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    case "banned_user":
    case "封禁用户":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "user":
    case "普通用户":
    case "default":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    default:
      if (!lowerCaseRoleName) {
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      }
      // 为未知角色分配一个一致的颜色
      const hash = getStringHash(lowerCaseRoleName);
      return colorPalette[hash % colorPalette.length];
  }
};

/**
 * 根据角色名称获取头像边框的 Tailwind CSS 类名。
 * @param roleName - 角色的名称 (e.g., 'admin', 'banned_user')，可能为 undefined。
 * @returns 返回一个代表边框样式的 Tailwind CSS 字符串。
 */
export const getRoleBorderColor = (roleName?: string) => {
  const lowerCaseRoleName = roleName?.toLowerCase();
  if (lowerCaseRoleName === "admin") {
    return "ring-red-500/20 ring-2";
  }
  if (lowerCaseRoleName === "banned_user") {
    return "ring-blue-500/20 ring-2";
  }
  if (lowerCaseRoleName === "user") {
    return "ring-gray-300/20 ring-1";
  }
  if (!lowerCaseRoleName) {
    return "ring-gray-300/20 ring-1";
  }
  // 为未知角色分配一个一致的边框颜色
  const hash = getStringHash(lowerCaseRoleName);
  return borderPalette[hash % borderPalette.length];
};
