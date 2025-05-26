"use client";

import React, { Suspense } from "react";
import { motion } from "motion/react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDashboardData } from "@/lib/dashboard/useDashboardData";
import { MetricsGrid } from "./MetricsGrid";
import { ANIMATION_CONFIG } from "@/lib/dashboard/animations";
import { cn } from "@/lib/utils";
import { QuickAction } from "@/lib/types/dashboard";

interface DashboardContainerProps {
  children?: React.ReactNode;
  className?: string;
}

// 错误状态组件
const ErrorState: React.FC<{
  error: string;
  onRetry: () => void;
  loading: boolean;
}> = ({ error, onRetry, loading }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center min-h-[400px] space-y-4"
  >
    <Alert className="max-w-md">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{error}</AlertDescription>
    </Alert>
    <Button
      onClick={onRetry}
      disabled={loading}
      variant="outline"
      className="gap-2"
    >
      <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
      重试
    </Button>
  </motion.div>
);

// 加载状态组件
const LoadingState: React.FC = () => (
  <div className="space-y-6">
    <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="h-40 bg-muted/50 animate-pulse rounded-lg"
        />
      ))}
    </div>
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="h-64 bg-muted/50 animate-pulse rounded-lg" />
      <div className="h-64 bg-muted/50 animate-pulse rounded-lg" />
    </div>
  </div>
);

export const DashboardContainer: React.FC<DashboardContainerProps> = ({
  children,
  className,
}) => {
  const { data, loading, error, refetch } = useDashboardData();

  return (
    <div className={cn("relative min-h-full", className)}>
      {/* 主要内容区域 */}
      <motion.div
        {...ANIMATION_CONFIG.pageTransition}
        className="relative z-10 p-6 space-y-6 pb-safe"
      >
        {/* 错误状态 */}
        {error && !loading && (
          <ErrorState
            error={error.message}
            onRetry={refetch}
            loading={loading}
          />
        )}

        {/* 加载状态 */}
        {loading && !data && <LoadingState />}

        {/* 正常内容 */}
        {data && !error && (
          <div className="space-y-6">
            {/* 指标网格 */}
            <MetricsGrid metrics={data.metrics} loading={loading} />

            {/* 其他内容区域 */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* 快捷操作区域 */}
              <Suspense
                fallback={
                  <div className="h-64 bg-muted/50 animate-pulse rounded-lg" />
                }
              >
                <div className="space-y-4 p-6 rounded-lg border bg-card/50 backdrop-blur-sm">
                  <h3 className="text-lg font-semibold">快捷操作</h3>
                  <div className="grid gap-3">
                    {data.quickActions.map((action: QuickAction) => (
                      <motion.div
                        key={action.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="group p-4 rounded-lg border bg-card/50 hover:bg-gradient-to-br hover:from-card/80 hover:to-card/60 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/10 hover:ring-1 hover:ring-primary/20 transition-all duration-300 ease-out cursor-pointer will-change-transform"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                            <action.icon className="h-4 w-4 group-hover:text-primary-foreground group-hover:scale-105 transition-all duration-300" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium group-hover:text-foreground transition-colors duration-300">
                              {action.title}
                            </h4>
                            <p className="text-sm text-muted-foreground group-hover:text-muted-foreground/80 transition-colors duration-300">
                              {action.description}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </Suspense>

              {/* 系统状态区域 */}
              <Suspense
                fallback={
                  <div className="h-64 bg-muted/50 animate-pulse rounded-lg" />
                }
              >
                <div className="space-y-4 p-6 rounded-lg border bg-card/50 backdrop-blur-sm">
                  <h3 className="text-lg font-semibold">系统状态</h3>
                  <div className="space-y-3">
                    {[
                      { label: "CPU 使用率", value: data.systemStatus.cpu },
                      {
                        label: "内存使用率",
                        value: data.systemStatus.memory,
                      },
                      { label: "磁盘使用率", value: data.systemStatus.disk },
                    ].map((item, index) => (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8 + index * 0.1 }}
                        className="space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {item.label}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {item.value}%
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                          <motion.div
                            className={cn(
                              "h-2 rounded-full",
                              item.value >= 90
                                ? "bg-red-500"
                                : item.value >= 75
                                ? "bg-yellow-500"
                                : item.value >= 50
                                ? "bg-blue-500"
                                : "bg-green-500"
                            )}
                            initial={{ width: 0 }}
                            animate={{ width: `${item.value}%` }}
                            transition={{
                              duration: 1.2,
                              delay: 1 + index * 0.1,
                              ease: [0.25, 0.1, 0.25, 1],
                            }}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </Suspense>
            </div>

            {/* 自定义内容区域 */}
            {children}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default DashboardContainer;
