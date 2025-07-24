"use client";

import { useSettingsStore } from "@/lib/store/settings";
import { useEffect, useRef } from "react";
import type { PublicSiteDetailsDTO } from "@/lib/types/settings";

export interface SiteInfoHook {
  siteInfo: PublicSiteDetailsDTO | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<boolean>;

  // 便捷访问器
  appName: string;
  logoUrl: string;
  faviconUrl: string;
  siteDescription: string;
  siteAnnouncement: string;
  canRegister: boolean;
  canGuestUpload: boolean;
}

/**
 * 站点信息Hook - 提供站点配置的便捷访问
 */
export function useSiteInfo(): SiteInfoHook {
  const {
    publicSiteDetails,
    isLoadingPublicDetails,
    publicDetailsError,
    loadPublicSiteDetails,
  } = useSettingsStore();

  const hasTriedToLoad = useRef(false);

  // 自动加载站点信息（仅在客户端，且只执行一次）
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      !publicSiteDetails &&
      !isLoadingPublicDetails &&
      !hasTriedToLoad.current
    ) {
      hasTriedToLoad.current = true;
      loadPublicSiteDetails();
    }
  }, [publicSiteDetails, isLoadingPublicDetails, loadPublicSiteDetails]);

  return {
    siteInfo: publicSiteDetails,
    isLoading: isLoadingPublicDetails,
    error: publicDetailsError,
    refresh: loadPublicSiteDetails,

    // 便捷访问器（提供默认值）
    appName: publicSiteDetails?.appName || "Hue",
    logoUrl: publicSiteDetails?.logoUrl || "/logo.svg",
    faviconUrl: publicSiteDetails?.faviconUrl || "/favicon.ico",
    siteDescription:
      publicSiteDetails?.siteDescription ||
      "现代化的图床服务，为您提供简单、功能强大且高性能的图片托管解决方案",
    siteAnnouncement: publicSiteDetails?.siteAnnouncement || "",
    canRegister: publicSiteDetails?.userRegistrationEnabled ?? true,
    canGuestUpload: publicSiteDetails?.guestUploadEnabled ?? true,
  };
}

