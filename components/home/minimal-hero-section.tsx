"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Image as ImageIcon, Upload } from "lucide-react";
import { ReactNode } from "react";
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button";
import { TypingAnimation } from "@/components/magicui/typing-animation";

// 定义动画变体
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
};

// 定义装饰元素组件类型
interface FloatingElementProps {
  children?: ReactNode;
  className: string;
  duration?: number;
  delay?: number;
  x?: number;
  y?: number;
}

// 定义装饰元素组件
const FloatingElement = ({
  children,
  className,
  duration = 5,
  delay = 0,
  x = 10,
  y = 10,
}: FloatingElementProps) => (
  <motion.div
    className={`absolute ${className}`}
    animate={{
      y: [`-${y}px`, `${y}px`, `-${y}px`],
      x: [`-${x}px`, `${x}px`, `-${x}px`],
      rotate: [0, 5, 0, -5, 0],
    }}
    transition={{
      duration,
      ease: "easeInOut",
      repeat: Infinity,
      delay,
    }}
  >
    {children}
  </motion.div>
);

export function MinimalHeroSection() {
  return (
    <section className="relative overflow-hidden py-10 md:py-14">
      {/* 背景效果 - 增强版 */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5" />

      {/* 装饰元素 */}
      <div className="absolute inset-0 overflow-hidden">
        <FloatingElement
          className="top-[15%] left-[10%] opacity-30 text-primary"
          x={20}
          y={15}
          duration={6}
        >
          <ImageIcon size={40} />
        </FloatingElement>

        <FloatingElement
          className="top-[25%] right-[15%] opacity-20 text-primary"
          x={15}
          y={25}
          duration={7}
          delay={1}
        >
          <Upload size={50} />
        </FloatingElement>

        {/* 装饰圆形 */}
        <FloatingElement
          className="bottom-[20%] left-[20%] h-24 w-24 rounded-full bg-primary/10 blur-xl"
          x={30}
          y={20}
          duration={8}
          delay={2}
        />

        <FloatingElement
          className="top-[40%] right-[25%] h-32 w-32 rounded-full bg-primary/5 blur-xl"
          x={20}
          y={15}
          duration={9}
          delay={0.5}
        />

        {/* 背景纹理 */}
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:24px_24px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center text-center max-w-3xl mx-auto"
        >
          <motion.div
            variants={itemVariants}
            className="inline-block px-4 py-1 mb-4 rounded-full bg-primary/10 text-primary text-sm font-medium"
          >
            简单、轻量的开源图床解决方案
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
              Lsky Pro 图床
            </span>
          </motion.h1>

          <motion.div variants={itemVariants} className="mt-4">
            <TypingAnimation
              className="text-lg text-muted-foreground max-w-2xl"
              delay={800}
              duration={30}
              startOnView={true}
              as="p"
            >
              专为个人用户设计的图片托管工具，让您的图片分享变得更加简单、高效且安全
            </TypingAnimation>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-10">
            <Link href="/docs">
              <InteractiveHoverButton className="text-sm">
                开始使用
              </InteractiveHoverButton>
            </Link>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mt-8 flex flex-col items-center"
          >
            <p className="text-sm text-muted-foreground mb-2">
              快速、安全、免费
            </p>
            <div className="flex gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                支持拖放上传
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                隐私保护
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                开源免费
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* 底部装饰 */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}
