"use client";

import { Logo } from "./logo";
import Link from "next/link";
import { Github, Heart, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t py-8 bg-muted/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="flex flex-col items-center justify-center text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Logo className="mb-4" />
          <p className="text-sm text-muted-foreground max-w-md mb-6">
            Lsky Pro 是一个简单、轻量的开源图片托管工具，专为个人用户设计
          </p>

          <motion.div
            className="flex flex-wrap justify-center gap-6 mb-6"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
            initial="hidden"
            animate="show"
          >
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 10 },
                show: { opacity: 1, y: 0 },
              }}
            >
              <Link
                href="https://github.com/lsky-org/lsky-pro"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Github className="h-4 w-4" />
                <span>开源代码</span>
              </Link>
            </motion.div>
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 10 },
                show: { opacity: 1, y: 0 },
              }}
            >
              <Link
                href="/docs"
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                <span>使用文档</span>
              </Link>
            </motion.div>
          </motion.div>

          <div className="pt-6 border-t border-border/40 w-full">
            <motion.p
              className="flex items-center justify-center text-xs text-muted-foreground gap-1 flex-wrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <span>© {currentYear} Lsky Pro.</span>
              <span className="flex items-center">
                由
                <Heart className="h-3 w-3 mx-1 text-red-500" />和
                <Link
                  href="https://github.com/lsky-org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mx-1 hover:text-primary transition-colors"
                >
                  社区贡献者
                </Link>
                共同构建
              </span>
              <span>基于 MIT 许可证开源</span>
            </motion.p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
