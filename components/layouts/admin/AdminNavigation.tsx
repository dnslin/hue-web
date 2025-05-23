"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminStore } from "@/lib/store/admin-store";
import {
  adminNavigation,
  type NavigationItem,
  type NavigationGroup,
} from "@/lib/constants/admin-navigation";
import { Badge } from "@/components/ui/badge";

interface NavigationItemProps {
  item: NavigationItem;
  isCollapsed: boolean;
  level?: number;
}

const NavigationItemComponent: React.FC<NavigationItemProps> = ({
  item,
  isCollapsed,
  level = 0,
}) => {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  const { setCurrentRoute } = useAdminStore();

  const isActive = pathname === item.href;
  const hasChildren = item.children && item.children.length > 0;
  const isChildActive =
    hasChildren && item.children?.some((child) => pathname === child.href);

  const handleClick = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    } else {
      setCurrentRoute(item.href);
      // 这里可以添加面包屑生成逻辑
    }
  };

  const itemContent = (
    <div
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
        "group relative overflow-hidden",
        level > 0 && "ml-6 pl-6 border-l border-border/50",
        isActive && "bg-primary text-primary-foreground shadow-sm",
        !isActive && "hover:bg-accent hover:text-accent-foreground",
        isChildActive && !isActive && "bg-accent/50"
      )}
    >
      {/* 悬停效果背景 */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 opacity-0 group-hover:opacity-100"
        initial={false}
        animate={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      />

      {/* 图标 */}
      <div className="relative z-10 flex-shrink-0">
        <item.icon
          className={cn(
            "h-5 w-5 transition-colors",
            isActive
              ? "text-primary-foreground"
              : "text-muted-foreground group-hover:text-foreground"
          )}
        />
      </div>

      {/* 标签和徽章 */}
      {!isCollapsed && (
        <div className="relative z-10 flex items-center justify-between flex-1 min-w-0">
          <span
            className={cn(
              "font-medium truncate transition-colors",
              isActive ? "text-primary-foreground" : "text-foreground"
            )}
          >
            {item.label}
          </span>

          <div className="flex items-center gap-2">
            {item.badge && (
              <Badge
                variant={isActive ? "secondary" : "outline"}
                className="text-xs"
              >
                {item.badge}
              </Badge>
            )}

            {hasChildren && (
              <motion.div
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="h-4 w-4" />
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="relative">
      {hasChildren ? (
        <button
          onClick={handleClick}
          className="w-full text-left"
          aria-expanded={isExpanded}
        >
          {itemContent}
        </button>
      ) : (
        <Link href={item.href} onClick={handleClick}>
          {itemContent}
        </Link>
      )}

      {/* 子菜单 */}
      {hasChildren && !isCollapsed && (
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="py-1">
                {item.children?.map((child) => (
                  <NavigationItemComponent
                    key={child.id}
                    item={child}
                    isCollapsed={isCollapsed}
                    level={level + 1}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

interface NavigationGroupProps {
  group: NavigationGroup;
  isCollapsed: boolean;
}

const NavigationGroupComponent: React.FC<NavigationGroupProps> = ({
  group,
  isCollapsed,
}) => {
  return (
    <div className="space-y-1">
      {!isCollapsed && (
        <div className="px-3 py-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {group.label}
          </h3>
        </div>
      )}

      <div className="space-y-1">
        {group.items.map((item) => (
          <NavigationItemComponent
            key={item.id}
            item={item}
            isCollapsed={isCollapsed}
          />
        ))}
      </div>
    </div>
  );
};

interface AdminNavigationProps {
  className?: string;
}

export const AdminNavigation: React.FC<AdminNavigationProps> = ({
  className,
}) => {
  const { sidebarCollapsed } = useAdminStore();

  return (
    <nav className={cn("space-y-6", className)}>
      {adminNavigation.map((group) => (
        <NavigationGroupComponent
          key={group.id}
          group={group}
          isCollapsed={sidebarCollapsed}
        />
      ))}
    </nav>
  );
};
