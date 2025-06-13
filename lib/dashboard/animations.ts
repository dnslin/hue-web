import { Variants } from "motion/react";

// 动画配置常量
export const ANIMATION_CONFIG = {
  // 页面级动画
  pageTransition: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
  },

  // 卡片动画
  cardHover: {
    scale: 1.02,
    transition: { duration: 0.2, ease: "easeOut" },
  },

  // 卡片进入动画
  cardEntry: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: "easeOut" },
  },

  // 数字变化动画
  numberTicker: {
    duration: 1.5,
    ease: "easeOut",
  },

  // 背景效果
  gridPattern: {
    numSquares: 20,
    maxOpacity: 0.03,
    duration: 4,
  },

  // 渐入动画
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.3 },
  },

  // 列表项动画
  listItem: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.2, ease: "easeOut" },
  },
};

// Framer Motion 变体定义
export const cardVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1,
    },
  },
};

export const containerVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.4,
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const itemVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

// 进度条动画变体
export const progressVariants: Variants = {
  initial: {
    width: 0,
  },
  animate: (value: number) => ({
    width: `${value}%`,
    transition: {
      duration: 1.2,
      ease: [0.25, 0.1, 0.25, 1],
      delay: 0.3,
    },
  }),
};

// 数字滚动动画工具函数
export const createNumberAnimation = (
  from: number,
  to: number,
  duration: number = 1.5
) => ({
  from,
  to,
  duration,
  ease: "easeOut",
});

// 延迟动画工具函数
export const createStaggeredAnimation = (
  index: number,
  baseDelay: number = 0.1
) => ({
  ...ANIMATION_CONFIG.cardEntry,
  transition: {
    ...ANIMATION_CONFIG.cardEntry.transition,
    delay: index * baseDelay,
  },
});

// 悬停效果工具函数
export const createHoverEffect = (scale: number = 1.02) => ({
  scale,
  transition: {
    duration: 0.2,
    ease: "easeOut",
  },
});

// 加载状态动画
export const loadingVariants: Variants = {
  initial: {
    opacity: 0.6,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 1,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut",
    },
  },
};

// 错误状态动画
export const errorVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.9,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  shake: {
    x: [-2, 2, -2, 2, 0],
    transition: {
      duration: 0.4,
      ease: "easeInOut",
    },
  },
};

// 成功状态动画
export const successVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.8,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

// 角色管理专用动画变体
export const roleCardVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  hover: {
    scale: 1.02,
    y: -2,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1,
    },
  },
  selected: {
    scale: 1.01,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
};

export const roleGridVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.4,
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const permissionItemVariants: Variants = {
  initial: {
    opacity: 0,
    x: -10,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
  hover: {
    scale: 1.01,
    transition: {
      duration: 0.15,
      ease: "easeOut",
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1,
    },
  },
};

export const permissionGroupVariants: Variants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export const dialogVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
    y: 10,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: {
      duration: 0.2,
      ease: "easeIn",
    },
  },
};

export const badgeVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.8,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.15,
      ease: "easeOut",
    },
  },
};

// 权限切换动画工具函数
export const createPermissionToggleAnimation = (isSelected: boolean) => ({
  scale: isSelected ? 1.02 : 1,
  backgroundColor: isSelected ? "var(--primary)" : "var(--card)",
  borderColor: isSelected ? "var(--primary)" : "var(--border)",
  transition: {
    duration: 0.2,
    ease: "easeOut",
  },
});

// 角色卡片交错动画工具函数
export const createRoleCardStagger = (index: number) => ({
  initial: roleCardVariants.initial,
  animate: {
    ...roleCardVariants.animate,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1] as const,
      delay: index * 0.08,
    },
  },
});
