"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Shield, Check, X } from "lucide-react";

interface PasswordStrengthIndicatorProps {
  minLength: number;
  requiresUppercase: boolean;
  requiresLowercase: boolean;
  requiresNumber: boolean;
  requiresSpecialChar: boolean;
  className?: string;
}

// 强度级别定义
const STRENGTH_LEVELS = {
  WEAK: { level: 1, label: "弱", color: "text-red-500", bgColor: "bg-red-500" },
  FAIR: {
    level: 2,
    label: "一般",
    color: "text-orange-500",
    bgColor: "bg-orange-500",
  },
  GOOD: {
    level: 3,
    label: "良好",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500",
  },
  STRONG: {
    level: 4,
    label: "强",
    color: "text-green-500",
    bgColor: "bg-green-500",
  },
  VERY_STRONG: {
    level: 5,
    label: "很强",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500",
  },
};

export const PasswordStrengthIndicator = React.memo(
  ({
    minLength,
    requiresUppercase,
    requiresLowercase,
    requiresNumber,
    requiresSpecialChar,
    className,
  }: PasswordStrengthIndicatorProps) => {
    // 确保 minLength 是有效数字
    const validMinLength = typeof minLength === 'number' && !isNaN(minLength) ? minLength : 8;
    // 计算密码强度级别
    const calculateStrength = () => {
      let score = 0;

      // 基于五个策略要求计算分数
      // 1. 长度要求
      if (validMinLength >= 6) score += 1;
      // 2. 大写字母要求
      if (requiresUppercase) score += 1;
      // 3. 小写字母要求
      if (requiresLowercase) score += 1;
      // 4. 数字要求
      if (requiresNumber) score += 1;
      // 5. 特殊字符要求
      if (requiresSpecialChar) score += 1;

      // 映射到强度级别（基于满足的策略要求数量）
      if (score <= 1) return STRENGTH_LEVELS.WEAK;
      if (score === 2) return STRENGTH_LEVELS.FAIR;
      if (score === 3) return STRENGTH_LEVELS.GOOD;
      if (score === 4) return STRENGTH_LEVELS.STRONG;
      return STRENGTH_LEVELS.VERY_STRONG;
    };

    const currentStrength = calculateStrength();
    
    // 计算满足的策略要求数量
    const satisfiedRequirements = [
      validMinLength >= 6,
      requiresUppercase,
      requiresLowercase,
      requiresNumber,
      requiresSpecialChar,
    ].filter(Boolean).length;
    
    // 进度条基于满足的策略要求数量计算
    const progressValue = (satisfiedRequirements / 5) * 100;

    // 策略要求列表
    const requirements = [
      {
        label: `最少 ${validMinLength} 个字符`,
        met: validMinLength >= 8, // 基本要求
        icon: validMinLength >= 8 ? Check : X,
      },
      {
        label: "包含大写字母 (A-Z)",
        met: requiresUppercase,
        icon: requiresUppercase ? Check : X,
      },
      {
        label: "包含小写字母 (a-z)",
        met: requiresLowercase,
        icon: requiresLowercase ? Check : X,
      },
      {
        label: "包含数字 (0-9)",
        met: requiresNumber,
        icon: requiresNumber ? Check : X,
      },
      {
        label: "包含特殊字符 (!@#$%^&*)",
        met: requiresSpecialChar,
        icon: requiresSpecialChar ? Check : X,
      },
    ];

    return (
      <div className={cn("space-y-4", className)}>
        {/* 强度指示器标题 */}
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">密码强度策略</span>
        </div>

        {/* 强度进度条 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">当前强度级别</span>
            <span className={cn("text-sm font-medium", currentStrength.color)}>
              {currentStrength.label}
            </span>
          </div>
          <div className="relative h-2 w-full bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-300 rounded-full",
                currentStrength.bgColor
              )}
              style={{ width: `${progressValue}%` }}
            />
          </div>
        </div>

        {/* 策略要求列表 */}
        <div className="space-y-2">
          <span className="text-sm font-medium text-muted-foreground">
            策略要求
          </span>
          <div className="space-y-2">
            {requirements.map((req, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <req.icon
                  className={cn(
                    "h-4 w-4",
                    req.met ? "text-green-500" : "text-muted-foreground"
                  )}
                />
                <span
                  className={cn(
                    req.met ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {req.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 强度说明 */}
        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground">
            密码强度基于长度要求和字符类型多样性计算。启用更多策略要求可以提高系统安全性。
          </p>
        </div>
      </div>
    );
  }
);
