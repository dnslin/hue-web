/**
 * 密码生成工具函数
 */

// 字符集定义
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?";

// 排除容易混淆的字符
const SAFE_LOWERCASE = "abcdefghijkmnpqrstuvwxyz"; // 排除 l, o
const SAFE_UPPERCASE = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // 排除 I, O
const SAFE_NUMBERS = "23456789"; // 排除 0, 1
const SAFE_SYMBOLS = "!@#$%^&*+-=?"; // 排除容易混淆的符号

export interface PasswordOptions {
  length?: number;
  includeLowercase?: boolean;
  includeUppercase?: boolean;
  includeNumbers?: boolean;
  includeSymbols?: boolean;
  excludeSimilar?: boolean; // 排除相似字符
}

/**
 * 生成安全的随机密码
 */
export function generatePassword(options: PasswordOptions = {}): string {
  const {
    length = 12,
    includeLowercase = true,
    includeUppercase = true,
    includeNumbers = true,
    includeSymbols = true,
    excludeSimilar = true,
  } = options;

  let charset = "";

  if (includeLowercase) {
    charset += excludeSimilar ? SAFE_LOWERCASE : LOWERCASE;
  }

  if (includeUppercase) {
    charset += excludeSimilar ? SAFE_UPPERCASE : UPPERCASE;
  }

  if (includeNumbers) {
    charset += excludeSimilar ? SAFE_NUMBERS : NUMBERS;
  }

  if (includeSymbols) {
    charset += excludeSimilar ? SAFE_SYMBOLS : SYMBOLS;
  }

  if (charset === "") {
    throw new Error("至少需要选择一种字符类型");
  }

  // 确保至少包含每种要求的字符类型
  const requiredChars: string[] = [];

  if (includeLowercase) {
    const chars = excludeSimilar ? SAFE_LOWERCASE : LOWERCASE;
    requiredChars.push(chars[Math.floor(Math.random() * chars.length)]);
  }

  if (includeUppercase) {
    const chars = excludeSimilar ? SAFE_UPPERCASE : UPPERCASE;
    requiredChars.push(chars[Math.floor(Math.random() * chars.length)]);
  }

  if (includeNumbers) {
    const chars = excludeSimilar ? SAFE_NUMBERS : NUMBERS;
    requiredChars.push(chars[Math.floor(Math.random() * chars.length)]);
  }

  if (includeSymbols) {
    const chars = excludeSimilar ? SAFE_SYMBOLS : SYMBOLS;
    requiredChars.push(chars[Math.floor(Math.random() * chars.length)]);
  }

  // 生成剩余的随机字符
  for (let i = requiredChars.length; i < length; i++) {
    requiredChars.push(charset[Math.floor(Math.random() * charset.length)]);
  }

  // 打乱字符顺序
  for (let i = requiredChars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [requiredChars[i], requiredChars[j]] = [requiredChars[j], requiredChars[i]];
  }

  return requiredChars.join("");
}

/**
 * 生成适合用户的默认密码
 * 8-12位长度，包含大小写字母和数字，排除相似字符
 */
export function generateUserPassword(): string {
  return generatePassword({
    length: 10,
    includeLowercase: true,
    includeUppercase: true,
    includeNumbers: true,
    includeSymbols: false, // 避免特殊符号造成用户困扰
    excludeSimilar: true,
  });
}

/**
 * 验证密码强度
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  score: number; // 0-5分
  issues: string[];
} {
  const issues: string[] = [];
  let score = 0;

  if (password.length < 8) {
    issues.push("密码长度至少8位");
  } else if (password.length >= 8) {
    score += 1;
  }

  if (password.length >= 12) {
    score += 1;
  }

  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    issues.push("缺少小写字母");
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    issues.push("缺少大写字母");
  }

  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    issues.push("缺少数字");
  }

  if (/[^a-zA-Z0-9]/.test(password)) {
    score += 1;
  }

  return {
    isValid: issues.length === 0 && score >= 3,
    score,
    issues,
  };
}
