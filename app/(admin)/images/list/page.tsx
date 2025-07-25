"use client";

import { useState, useEffect } from "react";
import { PageContainer } from "@/components/layouts/page-container";
import { ImageList } from "@/components/admin/images/list";

export default function ImageListPage() {
  const [isMobile, setIsMobile] = useState(false);

  // 检测移动端设备
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <PageContainer>
      <ImageList isMobile={isMobile} />
    </PageContainer>
  );
}