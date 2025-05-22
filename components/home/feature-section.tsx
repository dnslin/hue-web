"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Upload,
  Image as ImageIcon,
  Share2,
  Lock,
  Zap,
  BarChart,
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: <Upload className="h-6 w-6 text-primary" />,
    title: "简便上传",
    description:
      "多种上传方式，支持拖放、粘贴、API等多种方式，满足各种使用场景",
  },
  {
    icon: <ImageIcon className="h-6 w-6 text-primary" />,
    title: "图片管理",
    description: "强大的图片管理功能，轻松整理您的图片，支持分类、标签和搜索",
  },
  {
    icon: <Share2 className="h-6 w-6 text-primary" />,
    title: "便捷分享",
    description:
      "一键复制多种格式的链接，支持Markdown、HTML等多种格式，方便分享到各平台",
  },
  {
    icon: <Lock className="h-6 w-6 text-primary" />,
    title: "安全可靠",
    description: "多重安全保障机制，支持图片加密、访问控制，保护您的隐私",
  },
  {
    icon: <Zap className="h-6 w-6 text-primary" />,
    title: "高效快速",
    description: "优化的存储和传输机制，图片加载速度快，支持多种CDN",
  },
  {
    icon: <BarChart className="h-6 w-6 text-primary" />,
    title: "数据统计",
    description: "详细的数据统计，了解您的图片使用情况，帮助您更好地管理图片",
  },
];

// 动画变体
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function FeatureSection() {
  return (
    <section className="py-20 bg-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight">
            强大的图床系统功能
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Lsky Pro提供了全面的图片托管解决方案，满足您的各种需求
          </p>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={item}>
              <Card className="h-full border-2 hover:border-primary/20 transition-all duration-200 hover:shadow-lg">
                <CardHeader>
                  <div className="mb-2">{feature.icon}</div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-foreground/80 text-sm">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
