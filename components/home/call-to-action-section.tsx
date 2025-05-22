import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Check } from "lucide-react";

const features = [
  "5GB免费存储空间",
  "无限图片上传",
  "支持多种上传方式",
  "图片管理和分类",
  "永久免费使用",
];

export function CallToActionSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <Card className="overflow-hidden border-2">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <h2 className="text-3xl font-bold tracking-tight">
                  开始使用 Lsky Pro
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  立即注册并开始享受高效、便捷的图片托管服务。我们提供免费套餐，无需信用卡。
                </p>

                <ul className="mt-8 space-y-3">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="rounded-full p-1 bg-primary/10">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-10 flex flex-col sm:flex-row gap-4">
                  <Button size="lg" asChild>
                    <Link href="/register">立即注册</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/login">登录账号</Link>
                  </Button>
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary/20 to-purple-500/20 p-8 lg:p-12 flex flex-col justify-center">
                <div className="rounded-lg bg-background/95 backdrop-blur-sm p-6 border">
                  <h3 className="font-bold text-xl">专业版特权</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    升级到专业版，获得更多高级功能和存储空间
                  </p>

                  <ul className="mt-6 space-y-3">
                    <li className="flex items-center gap-3">
                      <div className="rounded-full p-1 bg-primary/10">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm">100GB存储空间</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="rounded-full p-1 bg-primary/10">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm">自定义域名</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="rounded-full p-1 bg-primary/10">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm">高级数据统计</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="rounded-full p-1 bg-primary/10">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm">优先技术支持</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="rounded-full p-1 bg-primary/10">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm">无水印</span>
                    </li>
                  </ul>

                  <div className="mt-6">
                    <Button className="w-full" variant="outline" asChild>
                      <Link href="/pricing">查看所有套餐</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
