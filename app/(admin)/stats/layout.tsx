"use client";

import React from "react";
import {  usePathname } from "next/navigation";
import { motion } from "motion/react";

interface StatsLayoutProps {
  children: React.ReactNode;
}
export default function StatsLayout({ children }: StatsLayoutProps) {
  const pathname = usePathname();

  const getCurrentTab = () => {
    if (pathname === "/stats") return "overview";
    if (pathname.startsWith("/stats/trends")) return "trends";
    if (pathname.startsWith("/stats/analytics")) return "analytics";
    return "overview";
  };

  const currentTab = getCurrentTab();

  return (
    <div className="space-y-6">
      <motion.div
        key={currentTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
        className="space-y-6"
      >
        {children}
      </motion.div>
    </div>
  );
}