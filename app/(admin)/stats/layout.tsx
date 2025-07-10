"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "motion/react";
import { BarChart3, TrendingUp, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StatsLayoutProps {
  children: React.ReactNode;
}

const statsNavItems = [
  {
    id: "overview",
    label: "概览",
    href: "/stats",
    icon: BarChart3,
    description: "关键指标和数据汇总",
  },
  {
    id: "trends",
    label: "趋势",
    href: "/stats/trends",
    icon: TrendingUp,
    description: "访问和上传趋势分析",
  },
  {
    id: "analytics",
    label: "分析",
    href: "/stats/analytics",
    icon: PieChart,
    description: "分布分析和排行榜",
  },
];

export default function StatsLayout({ children }: StatsLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  const getCurrentTab = () => {
    if (pathname === "/stats") return "overview";
    if (pathname.startsWith("/stats/trends")) return "trends";
    if (pathname.startsWith("/stats/analytics")) return "analytics";
    return "overview";
  };

  const currentTab = getCurrentTab();

  return (
    <div className="space-y-6">
      <motion.div
        key={currentTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
        className="space-y-6"
      >
        {children}
      </motion.div>
    </div>
  );
}