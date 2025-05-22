"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "./logo";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { ThemeSwitcher } from "./theme-switcher";

export function NavBar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Logo />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 text-sm font-medium">
            <Link
              href="/"
              className="text-foreground/80 hover:text-foreground transition-colors"
            >
              首页
            </Link>
            <Link
              href="/about"
              className="text-foreground/80 hover:text-foreground transition-colors"
            >
              关于
            </Link>
            <Link
              href="/pricing"
              className="text-foreground/80 hover:text-foreground transition-colors"
            >
              价格
            </Link>
            <Link
              href="/docs"
              className="text-foreground/80 hover:text-foreground transition-colors"
            >
              文档
            </Link>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-2">
            <ThemeSwitcher />
            <Button variant="outline" size="sm" asChild>
              <Link href="/login">登录</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/register">注册</Link>
            </Button>
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
      {isOpen && (
        <div className="md:hidden border-t">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <Link
              href="/"
              className="px-3 py-2 rounded-md hover:bg-accent"
              onClick={() => setIsOpen(false)}
            >
              首页
            </Link>
            <Link
              href="/about"
              className="px-3 py-2 rounded-md hover:bg-accent"
              onClick={() => setIsOpen(false)}
            >
              关于
            </Link>
            <Link
              href="/pricing"
              className="px-3 py-2 rounded-md hover:bg-accent"
              onClick={() => setIsOpen(false)}
            >
              价格
            </Link>
            <Link
              href="/docs"
              className="px-3 py-2 rounded-md hover:bg-accent"
              onClick={() => setIsOpen(false)}
            >
              文档
            </Link>
            <div className="flex flex-col space-y-2 pt-2 border-t">
              <Button variant="outline" size="sm" asChild>
                <Link href="/login" onClick={() => setIsOpen(false)}>
                  登录
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register" onClick={() => setIsOpen(false)}>
                  注册
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
