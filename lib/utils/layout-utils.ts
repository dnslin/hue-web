/**
 * 布局工具函数
 * 用于判断当前路径应该使用哪种布局
 * 已优化SSR兼容性和路径检测准确性
 */

/**
 * 规范化路径，移除查询参数和hash，确保检测准确性
 * @param pathname 原始路径
 * @returns 规范化后的路径
 */
function normalizePath(pathname: string): string {
  if (!pathname || typeof pathname !== "string") {
    return "/";
  }

  // 移除查询参数和hash
  const cleanPath = pathname.split("?")[0].split("#")[0];

  // 确保以 / 开头
  const normalizedPath = cleanPath.startsWith("/")
    ? cleanPath
    : `/${cleanPath}`;

  // 移除末尾的 / (除非是根路径)
  return normalizedPath === "/" ? "/" : normalizedPath.replace(/\/$/, "");
}

/**
 * 开发环境调试日志
 * @param pathname 路径
 * @param result 检测结果
 * @param matchedPattern 匹配的模式
 */
function debugLog(pathname: string, result: boolean, matchedPattern?: string) {
  if (process.env.NODE_ENV === "development") {
    console.debug(
      `[布局检测] 路径: ${pathname}, 结果: ${result ? "管理后台" : "前台"}${
        matchedPattern ? `, 匹配模式: ${matchedPattern}` : ""
      }`
    );
  }
}

/**
 * 判断给定路径是否为管理后台路由
 * @param pathname 当前路径
 * @returns 是否为管理后台路由
 */
export function isAdminRoute(pathname: string): boolean {
  // 路径规范化处理
  const normalizedPath = normalizePath(pathname);

  // 管理后台路径模式
  const adminPatterns = [
    "/dashboard", // 控制台首页
    "/admin", // 管理后台根路径
    "/users", // 用户管理页面
    "/settings", // 系统设置页面
  ];

  // 管理后台路径前缀
  const adminPrefixes = [
    "/admin/", // 以 /admin/ 开头的路径
    "/users/", // 以 /users/ 开头的路径
  ];

  // 路由组模式 - 检查是否包含 (admin) 路由组
  const adminRouteGroups = [
    "/(admin)/", // (admin) 路由组
  ];

  // 精确匹配
  for (const pattern of adminPatterns) {
    if (normalizedPath === pattern) {
      debugLog(pathname, true, `精确匹配: ${pattern}`);
      return true;
    }
  }

  // 前缀匹配
  for (const prefix of adminPrefixes) {
    if (normalizedPath.startsWith(prefix)) {
      debugLog(pathname, true, `前缀匹配: ${prefix}`);
      return true;
    }
  }

  // 路由组匹配
  for (const pattern of adminRouteGroups) {
    if (normalizedPath.includes(pattern)) {
      debugLog(pathname, true, `路由组匹配: ${pattern}`);
      return true;
    }
  }

  debugLog(pathname, false);
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

/**
 * 批量检测多个路径的布局类型
 * @param pathnames 路径数组
 * @returns 布局类型映射
 */
export function getLayoutTypes(
  pathnames: string[]
): Record<string, LayoutType> {
  return pathnames.reduce((acc, pathname) => {
    acc[pathname] = getLayoutType(pathname);
    return acc;
  }, {} as Record<string, LayoutType>);
}
