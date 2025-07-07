"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Logo } from "./logo";
import { ThemeSwitcher } from "./theme-switcher";
import {
  Menu,
  X,
  Github,
  LogIn,
  UserPlus,
  Home,
  ImageIcon,
  Users,
  BookOpen,
  Settings,
  LogOut,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/lib/store/auth";
import { ReactNode } from "react";
import { getGravatarUrl } from "@/lib/utils/gravatar";
// 定义导航项类型
interface NavItemProps {
  item: {
    name: string;
    href: string;
    icon: ReactNode;
  };
  hoveredItem: string | null;
  setHoveredItem: (name: string | null) => void;
}

export function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  // 获取认证状态
  const { user, isAuthenticated, isHydrated, logout } = useAuthStore();

  // 监听滚动事件，当页面滚动时改变导航栏样式
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // 处理登出
  const handleLogout = async () => {
    await logout();
    setIsOpen(false); // 关闭移动端菜单
  };

  // 更丰富的导航项
  const navItems = [
    { name: "社区", href: "/community", icon: <Users className="h-4 w-4" /> },
    { name: "文档", href: "/docs", icon: <BookOpen className="h-4 w-4" /> },
    { name: "首页", href: "/", icon: <Home className="h-4 w-4" /> },
    { name: "相册", href: "/gallery", icon: <ImageIcon className="h-4 w-4" /> },
    {
      name: "GitHub",
      href: "https://github.com/lsky-org/lsky-pro",
      icon: <Github className="h-4 w-4" />,
    },
  ];

  // 渲染认证相关按钮（桌面端）
  const renderAuthSection = () => {
    // 如果状态还未水合完成，显示加载状态
    if (!isHydrated) {
      return (
        <div className="flex items-center space-x-3">
          <div className="h-8 w-16 bg-muted animate-pulse rounded" />
          <div className="h-8 w-16 bg-muted animate-pulse rounded" />
        </div>
      );
    }

    if (isAuthenticated && user) {
      return (
        <div className="flex items-center space-x-3">
          {/* 进入后台按钮 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="flex items-center gap-1"
            >
              <Link href="/dashboard">
                <Settings className="h-4 w-4" />
                <span>后台管理</span>
              </Link>
            </Button>
          </motion.div>
          
          {/* 用户头像下拉菜单 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={getGravatarUrl(user.email)} alt={user.username || ""} />
                    <AvatarFallback>
                      {user.username?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user.username}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>后台管理</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>个人设置</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>退出登录</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>
        </div>
      );
    }

    // 未登录状态
    return (
      <div className="flex items-center space-x-3">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="flex items-center gap-1"
          >
            <Link href="/login">
              <LogIn className="h-4 w-4" />
              <span>登录</span>
            </Link>
          </Button>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Button size="sm" asChild className="flex items-center gap-1">
            <Link href="/register">
              <UserPlus className="h-4 w-4" />
              <span>注册</span>
            </Link>
          </Button>
        </motion.div>
      </div>
    );
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/70 backdrop-blur-md shadow-md"
          : "bg-background/80 backdrop-blur-sm border-b"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center"
          >
            <Logo />
            <div className="hidden md:flex ml-8 space-x-1 text-sm font-medium">
              {navItems.slice(0, 2).map((item) => (
                <NavItem
                  key={item.name}
                  item={item}
                  hoveredItem={hoveredItem}
                  setHoveredItem={setHoveredItem}
                />
              ))}
            </div>
          </motion.div>

          {/* Desktop Navigation - 中间部分 */}
          <nav className="hidden md:flex space-x-1 text-sm font-medium">
            {navItems.slice(2, 4).map((item) => (
              <NavItem
                key={item.name}
                item={item}
                hoveredItem={hoveredItem}
                setHoveredItem={setHoveredItem}
              />
            ))}
          </nav>

          {/* Desktop Right Section - 认证相关按钮 */}
          <div className="hidden md:flex items-center space-x-3">
            <NavItem
              key={navItems[4].name}
              item={navItems[4]}
              hoveredItem={hoveredItem}
              setHoveredItem={setHoveredItem}
            />
            <ThemeSwitcher />
            {renderAuthSection()}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <ThemeSwitcher />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="ml-2 p-2 rounded-md hover:bg-accent"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="md:hidden border-t"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{
                    duration: 0.2,
                    delay: index * 0.1,
                  }}
                >
                  <Link
                    href={item.href}
                    className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent"
                    onClick={() => setIsOpen(false)}
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel={
                      item.href.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                </motion.div>
              ))}
              <div className="flex flex-col space-y-2 pt-2 border-t">
                {!isHydrated ? (
                  // 加载状态
                  <div className="space-y-2">
                    <div className="h-8 bg-muted animate-pulse rounded" />
                    <div className="h-8 bg-muted animate-pulse rounded" />
                  </div>
                ) : isAuthenticated && user ? (
                  // 已登录状态
                  <>
                    <div className="px-3 py-2 text-sm">
                      <div className="font-medium">{user.username}</div>
                      <div className="text-muted-foreground truncate">{user.email}</div>
                    </div>
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{
                        duration: 0.2,
                        delay: navItems.length * 0.1,
                      }}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="w-full justify-start"
                      >
                        <Link
                          href="/dashboard"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-2"
                        >
                          <Settings className="h-4 w-4" />
                          <span>后台管理</span>
                        </Link>
                      </Button>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{
                        duration: 0.2,
                        delay: (navItems.length + 1) * 0.1,
                      }}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="w-full justify-start"
                      >
                        <Link
                          href="/profile"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-2"
                        >
                          <User className="h-4 w-4" />
                          <span>个人设置</span>
                        </Link>
                      </Button>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{
                        duration: 0.2,
                        delay: (navItems.length + 2) * 0.1,
                      }}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        <span>退出登录</span>
                      </Button>
                    </motion.div>
                  </>
                ) : (
                  // 未登录状态
                  <>
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{
                        duration: 0.2,
                        delay: navItems.length * 0.1,
                      }}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="w-full justify-start"
                      >
                        <Link
                          href="/login"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-2"
                        >
                          <LogIn className="h-4 w-4" />
                          <span>登录</span>
                        </Link>
                      </Button>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{
                        duration: 0.2,
                        delay: (navItems.length + 1) * 0.1,
                      }}
                    >
                      <Button size="sm" asChild className="w-full justify-start">
                        <Link
                          href="/register"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-2"
                        >
                          <UserPlus className="h-4 w-4" />
                          <span>注册</span>
                        </Link>
                      </Button>
                    </motion.div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// 抽取导航项组件，增强复用性和可维护性
function NavItem({ item, hoveredItem, setHoveredItem }: NavItemProps) {
  return (
    <motion.div
      className="relative"
      onHoverStart={() => setHoveredItem(item.name)}
      onHoverEnd={() => setHoveredItem(null)}
    >
      <Link
        href={item.href}
        className="px-3 py-2 rounded-md text-foreground/80 hover:text-foreground transition-colors flex items-center gap-1.5"
        target={item.href.startsWith("http") ? "_blank" : undefined}
        rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
      >
        {item.icon}
        <span>{item.name}</span>
      </Link>
      <AnimatePresence>
        {hoveredItem === item.name && (
          <motion.div
            layoutId="navHover"
            className="absolute inset-0 rounded-md bg-accent/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ zIndex: -1 }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
