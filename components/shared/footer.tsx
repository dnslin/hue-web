import { Logo } from "./logo";
import Link from "next/link";
import { Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t py-12 bg-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <Logo />
            <p className="text-sm text-muted-foreground max-w-xs">
              Lsky
              Pro是一个简单、功能强大且高性能的图片托管程序，您可以用它来搭建自己的图床。
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <h4 className="font-medium">产品</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/features"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    功能
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    价格
                  </Link>
                </li>
                <li>
                  <Link
                    href="/docs"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    文档
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">资源</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/about"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    关于
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    联系我们
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://github.com/lsky-org/lsky-pro"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                  >
                    <Github className="h-3.5 w-3.5" />
                    <span>GitHub</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">订阅</h4>
            <p className="text-sm text-muted-foreground">
              获取Lsky Pro的最新更新和新闻。
            </p>
            <div className="flex items-center space-x-2 mt-4">
              <input
                type="email"
                placeholder="您的邮箱地址"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              <button className="h-9 rounded-md px-3 bg-primary text-primary-foreground text-sm font-medium shadow hover:bg-primary/90 transition-colors">
                订阅
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Lsky Pro. 保留所有权利。</p>
        </div>
      </div>
    </footer>
  );
}
