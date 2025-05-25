"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store/use-app-store";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeSwitcher() {
  const { theme, setTheme } = useAppStore();
  const [mounted, setMounted] = useState(false);

  // 挂载后再渲染，避免服务端与客户端渲染不一致
  useEffect(() => {
    setMounted(true);

    // 初始化主题 - 确保DOM类立即应用
    const savedTheme =
      (localStorage.getItem("theme") as "light" | "dark") || "light";

    console.log("ThemeSwitcher初始化:", { savedTheme });

    // 立即应用DOM类
    document.documentElement.classList.toggle("dark", savedTheme === "dark");

    // 同步到状态管理
    setTheme(savedTheme);

    console.log("DOM类应用后:", {
      hasDarkClass: document.documentElement.classList.contains("dark"),
      theme: savedTheme,
    });
  }, [setTheme]);

  // 切换主题 - 简化为只有light/dark两种模式
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";

    console.log("主题切换:", { from: theme, to: newTheme });

    // 立即应用DOM类
    document.documentElement.classList.toggle("dark", newTheme === "dark");

    // 保存到localStorage
    localStorage.setItem("theme", newTheme);

    // 同步到状态管理
    setTheme(newTheme);

    console.log("主题切换完成:", {
      hasDarkClass: document.documentElement.classList.contains("dark"),
      localStorage: localStorage.getItem("theme"),
      newTheme,
    });
  };

  if (!mounted) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={theme === "dark" ? "切换到亮色模式" : "切换到暗色模式"}
      onClick={toggleTheme}
      className="w-9 h-9 rounded-full relative"
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme === "light" ? (
          <motion.div
            key="sun"
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0, rotate: 180, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Sun className="h-[1.2rem] w-[1.2rem]" />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ scale: 0, rotate: 180, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0, rotate: -180, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Moon className="h-[1.2rem] w-[1.2rem]" />
          </motion.div>
        )}
      </AnimatePresence>
    </Button>
  );
}
