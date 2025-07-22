import { z } from "zod";

// 验证结果接口
interface IpValidationResult {
  isValid: boolean;
  errors: string[];
}

// 辅助函数：验证单个IP地址或CIDR的有效性（增强版）
const validateSingleIpOrCidr = (
  item: string,
  lineNumber: number
): { isValid: boolean; error?: string } => {
  if (!item) return { isValid: true }; // 空字符串是有效的（会被过滤掉）

  const parts = item.split("/");
  const ip = parts[0];
  const mask = parts[1];

  // 验证IP地址部分（精确的IPv4正则）
  const ipRegex =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

  if (!ipRegex.test(ip)) {
    return {
      isValid: false,
      error: `第${lineNumber}行：IP地址格式不正确 "${ip}"（应为xxx.xxx.xxx.xxx格式）`,
    };
  }

  // 验证IP地址范围
  const ipParts = ip.split(".");
  for (let i = 0; i < ipParts.length; i++) {
    const num = parseInt(ipParts[i], 10);
    if (num < 0 || num > 255) {
      return {
        isValid: false,
        error: `第${lineNumber}行：IP地址数值超出范围 "${ip}"（每段数值应在0-255之间）`,
      };
    }
  }

  // 如果有CIDR掩码，验证掩码部分
  if (mask !== undefined) {
    const maskNum = parseInt(mask, 10);
    if (isNaN(maskNum) || maskNum < 0 || maskNum > 32) {
      return {
        isValid: false,
        error: `第${lineNumber}行：CIDR掩码不正确 "/${mask}"（应在0-32之间）`,
      };
    }
  }

  return { isValid: true };
};

// 验证IP列表并返回详细错误信息
const validateIpListWithDetails = (ipList: string[]): IpValidationResult => {
  const errors: string[] = [];

  for (let i = 0; i < ipList.length; i++) {
    const item = ipList[i];
    const result = validateSingleIpOrCidr(item, i + 1);
    if (!result.isValid && result.error) {
      errors.push(result.error);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// 处理输入字符串，只支持逗号分割
const parseIpListInput = (input: string): string[] => {
  if (!input.trim()) return [];

  // 使用逗号分割
  return input
    .split(",")
    .map((ip) => ip.trim())
    .filter((ip) => ip.length > 0);
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
    .refine(
      (val) => {
        if (!val || val.trim() === "") return true; // 空字符串是有效的
        const ips = parseIpListInput(val);
        const result = validateIpListWithDetails(ips);
        return result.isValid;
      },
      {
        message: "IP白名单包含无效的IP地址或CIDR格式",
      }
    ),
  ipBlacklist: z
    .string()
    .default("")
    .refine(
      (val) => {
        if (!val || val.trim() === "") return true; // 空字符串是有效的
        const ips = parseIpListInput(val);
        const result = validateIpListWithDetails(ips);
        return result.isValid;
      },
      {
        message: "IP黑名单包含无效的IP地址或CIDR格式",
      }
    ),
});

/**
 * 安全设置表单数据类型
 */
export type SecuritySettingsFormData = z.infer<typeof securitySettingsSchema>;

