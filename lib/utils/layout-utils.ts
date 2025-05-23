/**
 * 布局工具函数
 * 用于判断当前路径应该使用哪种布局
 */

/**
 * 判断给定路径是否为管理后台路由
 * @param pathname 当前路径
 * @returns 是否为管理后台路由
 */
export function isAdminRoute(pathname: string): boolean {
  // 管理后台路径模式
  const adminPatterns = [
    "/dashboard", // 控制台首页
    "/admin", // 管理后台根路径
  ];

  // 管理后台路径前缀
  const adminPrefixes = [
    "/admin/", // 以 /admin/ 开头的路径
  ];

  // 路由组模式 - 检查是否包含 (admin) 路由组
  const adminRouteGroups = [
    "/(admin)/", // (admin) 路由组
  ];

  // 精确匹配
  if (adminPatterns.includes(pathname)) {
    return true;
  }

  // 前缀匹配
  if (adminPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return true;
  }

  // 路由组匹配
  if (adminRouteGroups.some((pattern) => pathname.includes(pattern))) {
    return true;
  }

  return false;
}

/**
 * 判断给定路径是否为前台路由
 * @param pathname 当前路径
 * @returns 是否为前台路由
 */
export function isFrontendRoute(pathname: string): boolean {
  return !isAdminRoute(pathname);
}

/**
 * 获取布局类型
 * @param pathname 当前路径
 * @returns 布局类型
 */
export type LayoutType = "admin" | "frontend";

export function getLayoutType(pathname: string): LayoutType {
  return isAdminRoute(pathname) ? "admin" : "frontend";
}
