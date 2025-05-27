"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { UserInfo } from "@/lib/store/authStore";
import {
  getGravatarUrl,
  getUserInitials,
  getDiceBearUrl,
} from "@/lib/utils/gravatar";

// 头像尺寸配置
const sizeConfig = {
  sm: {
    container: "size-6",
    text: "text-xs",
    pixels: 24,
  },
  md: {
    container: "size-8",
    text: "text-sm",
    pixels: 32,
  },
  lg: {
    container: "size-10",
    text: "text-base",
    pixels: 40,
  },
} as const;

// 用户角色对应的边框颜色
const roleColors = {
  admin: "ring-red-500/20 ring-2",
  moderator: "ring-blue-500/20 ring-2",
  user: "ring-gray-300/20 ring-1",
} as const;

interface UserAvatarProps {
  user: UserInfo;
  size?: keyof typeof sizeConfig;
  className?: string;
  showTooltip?: boolean;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = "md",
  className,
  showTooltip = false,
}) => {
  const [avatarSrc, setAvatarSrc] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const config = sizeConfig[size];
  const userInitials = getUserInitials(user.username);

  // 获取用户角色对应的边框样式
  const roleColor =
    roleColors[user.role as keyof typeof roleColors] || roleColors.user;

  // 渐进式加载头像
  useEffect(() => {
    if (!user.email) {
      // 如果没有邮箱，直接使用 DiceBear 作为回退
      setAvatarSrc(getDiceBearUrl(user.username));
      setIsLoading(false);
      return;
    }

    // 异步加载 Gravatar
    const loadGravatar = async () => {
      try {
        const gravatarUrl = getGravatarUrl(user.email, config.pixels, "404");

        // 预加载图片以检查是否存在
        const img = new Image();
        img.onload = () => {
          setAvatarSrc(gravatarUrl);
          setIsLoading(false);
          setHasError(false);
        };
        img.onerror = () => {
          // Gravatar 不存在，回退到 DiceBear
          const fallbackUrl = getDiceBearUrl(user.username);
          setAvatarSrc(fallbackUrl);
          setIsLoading(false);
          setHasError(true);
        };
        img.src = gravatarUrl;
      } catch (error) {
        // 发生错误，使用 DiceBear 回退
        setAvatarSrc(getDiceBearUrl(user.username));
        setIsLoading(false);
        setHasError(true);
      }
    };

    loadGravatar();
  }, [user.email, user.username, config.pixels]);

  // 图片加载失败的处理
  const handleImageError = () => {
    if (!hasError) {
      // 首次失败，尝试 DiceBear
      const fallbackUrl = getDiceBearUrl(user.username);
      setAvatarSrc(fallbackUrl);
      setHasError(true);
    } else {
      // DiceBear 也失败了，显示首字母
      setAvatarSrc("");
    }
  };

  const avatarElement = (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      whileHover={{ scale: 1.05 }}
      className={cn("relative", className)}
    >
      <Avatar
        className={cn(
          config.container,
          roleColor,
          "transition-all duration-200 hover:shadow-md",
          "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900"
        )}
      >
        {/* 加载状态的骨架屏 */}
        {isLoading && (
          <div
            className={cn(
              "absolute inset-0 rounded-full",
              "bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700",
              "animate-pulse"
            )}
          />
        )}

        {/* 头像图片 */}
        {avatarSrc && !isLoading && (
          <AvatarImage
            src={avatarSrc}
            alt={`${user.username} 的头像`}
            onError={handleImageError}
            className="transition-opacity duration-300"
          />
        )}

        {/* 回退显示：用户名首字母 */}
        <AvatarFallback
          className={cn(
            "font-medium transition-all duration-200",
            config.text,
            "bg-gradient-to-br from-blue-500 to-purple-600 text-white",
            "dark:from-blue-600 dark:to-purple-700"
          )}
        >
          {userInitials}
        </AvatarFallback>
      </Avatar>

      {/* 在线状态指示器（可选功能，暂时注释） */}
      {/* <div className="absolute -bottom-0.5 -right-0.5 size-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full" /> */}
    </motion.div>
  );

  // 如果需要显示 tooltip
  if (showTooltip) {
    return (
      <div className="group relative">
        {avatarElement}
        <div
          className={cn(
            "absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2",
            "px-2 py-1 text-xs text-white bg-gray-900 rounded shadow-lg",
            "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
            "pointer-events-none whitespace-nowrap z-50"
          )}
        >
          {user.username}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      </div>
    );
  }

  return avatarElement;
};
