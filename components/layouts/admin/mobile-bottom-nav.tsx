"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Upload,
  Users,
  Settings,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const bottomNavItems: BottomNavItem[] = [
  {
    id: "dashboard",
    label: "控制台",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "upload",
    label: "上传",
    href: "/upload",
    icon: Upload,
  },
  {
    id: "users",
    label: "用户",
    href: "/users",
    icon: Users,
  },
  {
    id: "stats",
    label: "统计",
    href: "/statistics",
    icon: BarChart3,
  },
  {
    id: "settings",
    label: "设置",
    href: "/settings",
    icon: Settings,
  },
];

interface MobileBottomNavProps {
  className?: string;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  className,
}) => {
  const pathname = usePathname();

  return (
    <nav className={cn("admin-bottom-nav lg:hidden", className)}>
      {bottomNavItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.id}
            href={item.href}
            className={cn("admin-bottom-nav-item", isActive && "active")}
          >
            <div className="relative">
              <item.icon className="admin-bottom-nav-icon" />

              {/* 活跃状态指示器 */}
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                  }}
                />
              )}
            </div>

            <span className="admin-bottom-nav-label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
