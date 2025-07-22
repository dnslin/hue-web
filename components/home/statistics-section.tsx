"use client";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  useInView,
} from "framer-motion";
import { useEffect, useRef } from "react";
import { useSiteInfo } from "@/lib/hooks/use-site-info";

interface StatItemProps {
  value: number;
  label: string;
  suffix?: string;
  duration?: number;
}

function StatItem({ value, label, suffix = "", duration = 2 }: StatItemProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);

  useEffect(() => {
    if (isInView) {
      animate(count, value, { duration });
    }
  }, [count, value, duration, isInView]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
      className="text-center p-6"
    >
      <div className="text-4xl md:text-5xl font-bold text-foreground flex justify-center items-baseline">
        <motion.span>{rounded}</motion.span>
        <span className="ml-1">{suffix}</span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground font-medium">{label}</p>
    </motion.div>
  );
}

export function StatisticsSection() {
  const { appName, isLoading } = useSiteInfo();

  return (
    <section className="py-20 bg-primary/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold tracking-tight">
            值得信赖的图床服务
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {isLoading ? (
              <span className="inline-block w-64 h-6 bg-muted animate-pulse rounded" />
            ) : (
              `成千上万的用户选择使用${appName}托管他们的图片`
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatItem value={5000} label="活跃用户" suffix="+" />
          <StatItem value={10} label="服务器数量" suffix="+" />
          <StatItem value={99.9} label="服务可靠性" suffix="%" duration={1.5} />
          <StatItem
            value={1000000}
            label="托管图片"
            suffix="+"
            duration={2.5}
          />
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 bg-background/50 backdrop-blur-sm border px-4 py-2 rounded-full text-sm text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            所有系统服务运行正常
          </div>
        </div>
      </div>
    </section>
  );
}
