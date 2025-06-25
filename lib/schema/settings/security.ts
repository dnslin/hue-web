import { z } from "zod";

// 辅助函数：验证单个IP地址或CIDR的有效性
const isValidIpOrCidr = (item: string): boolean => {
  if (!item) return true; // 由 filter(ip => ip.length > 0) 处理分割后产生的空字符串
  const parts = item.split("/");
  const ip = parts[0];
  const mask = parts[1];

  // 验证IP地址部分 (基础IPv4正则)
  const ipRegex =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  if (!ipRegex.test(ip)) {
    console.log(`[调试日志] 无效的 IP 地址部分: ${ip} (完整条目: ${item})`);
    return false;
  }

  if (mask !== undefined) {
    // 验证掩码部分
    const maskNum = parseInt(mask, 10);
    if (isNaN(maskNum) || maskNum < 0 || maskNum > 32) {
      console.log(`[调试日志] 无效的 CIDR 掩码: ${mask} (完整条目: ${item})`);
      return false;
    }
  }
  return true;
};

/**
 * 安全设置表单验证Schema
 */
export const securitySettingsSchema = z.object({
  passwordMinLength: z
    .number()
    .min(6, "密码最小长度不能少于6位")
    .max(64, "密码最小长度不能超过64位")
    .default(8),
  passwordRequiresUppercase: z.boolean().default(true),
  passwordRequiresLowercase: z.boolean().default(true),
  passwordRequiresNumber: z.boolean().default(true),
  passwordRequiresSpecialChar: z.boolean().default(false),
  loginMaxAttempts: z
    .number()
    .min(3, "最大登录尝试次数不能少于3次")
    .max(20, "最大登录尝试次数不能超过20次")
    .default(5),
  accountLockoutDurationMinutes: z
    .number()
    .min(5, "账户锁定时间不能少于5分钟")
    .max(1440, "账户锁定时间不能超过24小时")
    .default(30),
  ipWhitelist: z
    .string()
    .default("")
    .transform((val) =>
      val
        .split("\n")
        .map((ip) => ip.trim())
        .filter((ip) => ip.length > 0)
    )
    .refine((ips) => ips.every(isValidIpOrCidr), {
      message:
        "IP白名单包含无效的IP地址或CIDR格式。请确保每行一个有效的IPv4地址或IPv4 CIDR (例如 192.168.1.1 或 10.0.0.0/24)，并且掩码在0-32之间。",
    }),
  ipBlacklist: z
    .string()
    .default("")
    .transform((val) =>
      val
        .split("\n")
        .map((ip) => ip.trim())
        .filter((ip) => ip.length > 0)
    )
    .refine((ips) => ips.every(isValidIpOrCidr), {
      message:
        "IP黑名单包含无效的IP地址或CIDR格式。请确保每行一个有效的IPv4地址或IPv4 CIDR (例如 192.168.1.1 或 10.0.0.0/24)，并且掩码在0-32之间。",
    }),
});

/**
 * 安全设置表单数据类型
 */
export type SecuritySettingsFormData = z.infer<typeof securitySettingsSchema>;
