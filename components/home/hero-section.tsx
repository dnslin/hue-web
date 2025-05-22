"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      {/* 背景渐变 */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />

      {/* 装饰圆形 */}
      <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center lg:text-left"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              简单、高效的
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500 px-1">
                图床服务
              </span>
            </h1>
            <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0">
              Lsky Pro
              提供了简单易用的图片上传、管理和分享功能，让您的图片管理更加高效。
            </p>
            <div className="mt-10 flex flex-wrap gap-4 justify-center lg:justify-start">
              <Button size="lg" asChild>
                <Link href="/register">立即注册</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/docs">了解更多</Link>
              </Button>
            </div>
            <div className="mt-10 text-sm text-muted-foreground">
              <p>已有超过 10,000+ 用户信赖和使用</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <div className="relative w-full h-[400px] lg:h-[500px] shadow-2xl rounded-lg overflow-hidden border bg-muted">
              {/* 使用placeholder替代图片 */}
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <svg
                    className="w-16 h-16 mx-auto text-muted-foreground/50"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="mt-4">Lsky Pro 仪表盘</p>
                </div>
              </div>
            </div>

            {/* 悬浮元素装饰 */}
            <div className="absolute -top-6 -left-6 w-12 h-12 bg-primary rounded-lg shadow-lg" />
            <div className="absolute -bottom-6 -right-6 w-12 h-12 bg-purple-500 rounded-lg shadow-lg" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
