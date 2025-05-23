"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  Users,
  Images,
  HardDrive,
  Activity,
  Upload,
  Settings,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BoxReveal } from "@/components/magicui/box-reveal";
import { TextAnimate } from "@/components/magicui/text-animate";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button";
import { AnimatedGridPattern } from "@/components/magicui/animated-grid-pattern";
import { BorderBeam } from "@/components/magicui/border-beam";

// 统计数据
const stats = [
  {
    title: "总用户数",
    value: "1,234",
    change: "+12%",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
  },
  {
    title: "图片总数",
    value: "45,678",
    change: "+8%",
    icon: Images,
    color: "text-green-600",
    bgColor: "bg-green-500/10",
  },
  {
    title: "存储使用",
    value: "2.4 GB",
    change: "+15%",
    icon: HardDrive,
    color: "text-orange-600",
    bgColor: "bg-orange-500/10",
  },
  {
    title: "今日访问",
    value: "892",
    change: "+23%",
    icon: Activity,
    color: "text-purple-600",
    bgColor: "bg-purple-500/10",
  },
];

// 快捷操作
const quickActions = [
  {
    title: "批量上传",
    description: "上传多个图片文件",
    icon: Upload,
    href: "/admin/images/upload",
    color: "bg-blue-500",
  },
  {
    title: "用户管理",
    description: "管理系统用户",
    icon: Users,
    href: "/admin/users",
    color: "bg-green-500",
  },
  {
    title: "系统设置",
    description: "配置系统参数",
    icon: Settings,
    href: "/admin/settings",
    color: "bg-orange-500",
  },
  {
    title: "数据统计",
    description: "查看详细统计",
    icon: BarChart3,
    href: "/admin/analytics",
    color: "bg-purple-500",
  },
];

export default function DashboardPage() {
  return (
    <div className="relative p-6 space-y-6 overflow-hidden">
      {/* 背景网格动画 */}
      <AnimatedGridPattern
        numSquares={30}
        maxOpacity={0.1}
        duration={3}
        className="inset-x-0 inset-y-[-30%] h-[200%] skew-y-12"
      />

      {/* 页面标题 */}
      <div className="space-y-4 relative z-10">
        <BoxReveal boxColor="#3b82f6" duration={0.5}>
          <TextAnimate
            animation="slideUp"
            by="word"
            className="text-4xl font-bold tracking-tight"
          >
            控制台
          </TextAnimate>
        </BoxReveal>
        <BoxReveal boxColor="#3b82f6" duration={0.7}>
          <TextAnimate
            animation="fadeIn"
            by="word"
            delay={0.3}
            className="text-muted-foreground text-lg"
          >
            欢迎回来！这里是您的 Lsky Pro 管理中心。
          </TextAnimate>
        </BoxReveal>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 relative z-10">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <BorderBeam
                size={50}
                duration={8 + index * 2}
                colorFrom="#3b82f6"
                colorTo="#8b5cf6"
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center gap-1 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {stat.change}
                  </Badge>
                  <span className="text-xs text-muted-foreground">较上月</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2 relative z-10">
        {/* 快捷操作 */}
        <Card className="relative overflow-hidden">
          <CardHeader>
            <CardTitle>快捷操作</CardTitle>
            <CardDescription>常用功能的快速入口</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <InteractiveHoverButton
                  className="w-full justify-start h-auto p-4 border-dashed"
                  onClick={() => (window.location.href = action.href)}
                >
                  <div className="flex items-center gap-4 w-full">
                    <div
                      className={`p-2 rounded-lg ${action.color} text-white`}
                    >
                      <action.icon className="h-5 w-5" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-medium">{action.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {action.description}
                      </div>
                    </div>
                  </div>
                </InteractiveHoverButton>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        {/* 系统状态 */}
        <Card className="relative overflow-hidden">
          <CardHeader>
            <CardTitle>系统状态</CardTitle>
            <CardDescription>服务器运行状态概览</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm">CPU 使用率</span>
                <Badge variant="outline">45%</Badge>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <motion.div
                  className="bg-blue-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "45%" }}
                  transition={{ delay: 1, duration: 1 }}
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm">内存使用率</span>
                <Badge variant="outline">62%</Badge>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <motion.div
                  className="bg-green-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "62%" }}
                  transition={{ delay: 1.1, duration: 1 }}
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.0 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm">磁盘使用率</span>
                <Badge variant="outline">28%</Badge>
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <motion.div
                  className="bg-orange-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "28%" }}
                  transition={{ delay: 1.2, duration: 1 }}
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 }}
              className="pt-4 border-t border-border flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-muted-foreground">
                  系统运行正常
                </span>
              </div>
              <ShimmerButton
                className="h-8 px-4 text-xs"
                shimmerColor="#3b82f6"
                background="rgba(59, 130, 246, 0.1)"
              >
                查看详情
              </ShimmerButton>
            </motion.div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
