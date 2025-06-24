"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useSettingsData,
  useSettingsActions,
} from "@/lib/store/settings-store";
import { SettingType } from "@/lib/types/settings";
import { BasicSettingsForm } from "./basic-settings-form";
import { EmailSettingsForm } from "./email-settings-form";
import { ImageSettingsForm } from "./image-settings-form";
import { SecuritySettingsForm } from "./security-settings-form";
import {
  Settings,
  Mail,
  Image,
  Shield,
  AlertCircle,
  RefreshCw,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PageContainer } from "@/components/layouts/page-container";

// Tab配置
const SETTINGS_TABS = [
  {
    key: SettingType.BASIC,
    label: "基础设置",
    description: "应用基本信息和站点配置",
    icon: Settings,
  },
  {
    key: SettingType.EMAIL,
    label: "邮件设置",
    description: "SMTP配置和邮件通知",
    icon: Mail,
  },
  {
    key: SettingType.IMAGE,
    label: "图片设置",
    description: "图片处理和水印配置",
    icon: Image,
  },
  {
    key: SettingType.SECURITY,
    label: "安全设置",
    description: "密码策略和安全配置",
    icon: Shield,
  },
];

// 加载骨架屏组件
const SettingsLoadingSkeleton = () => (
  <div className="space-y-6">
    <div className="space-y-2">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-96" />
    </div>
    <Skeleton className="h-12 w-full" />
    <div className="space-y-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  </div>
);

interface SettingsContainerProps {
  className?: string;
  defaultTab?: SettingType;
}

export const SettingsContainer = ({
  className,
  defaultTab = SettingType.BASIC,
}: SettingsContainerProps) => {
  const [retryCount, setRetryCount] = useState(0);
  const [lastUpdateTime, setLastUpdateTime] = useState<string>("");
  const searchParams = useSearchParams();

  // 获取状态和操作方法
  const {
    settings,
    isLoading,
    isSubmitting,
    isTestingEmail,
    error,
    activeTab,
    hasUnsavedChanges,
  } = useSettingsData();

  const {
    loadSettings,
    updateBasicSettings,
    updateEmailSettings,
    updateImageSettings,
    updateSecuritySettings,
    testEmailConfiguration,
    setActiveTab,
    clearError,
  } = useSettingsActions();

  // 初始化加载设置和更新时间
  useEffect(() => {
    loadSettings();
    setLastUpdateTime(new Date().toLocaleString());
  }, [loadSettings]);

  // 客户端初始化时间
  useEffect(() => {
    setLastUpdateTime(new Date().toLocaleString());
  }, []);

  // 设置默认活动标签，支持URL参数
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (
      tabParam &&
      Object.values(SettingType).includes(tabParam as SettingType)
    ) {
      setActiveTab(tabParam as SettingType);
    } else {
      setActiveTab(defaultTab);
    }
  }, [defaultTab, setActiveTab, searchParams]);

  // 重新加载设置
  const handleRetry = async () => {
    setRetryCount((prev) => prev + 1);
    clearError();
    const success = await loadSettings();

    if (success) {
      setLastUpdateTime(new Date().toLocaleString());
      toast.success("设置加载成功");
    } else {
      toast.error("设置加载失败，请重试");
    }
  };

  // Tab切换处理
  const handleTabChange = (value: string) => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        "您有未保存的更改，确定要离开当前页面吗？"
      );
      if (!confirmed) return;
    }

    setActiveTab(value as SettingType);
  };

  // 快捷键处理
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+S 快速保存
      if (event.ctrlKey && event.key === "s") {
        event.preventDefault();
        if (hasUnsavedChanges) {
          toast.info("请在具体表单中保存设置");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasUnsavedChanges]);

  // 错误状态
  if (error && !isLoading && retryCount === 0) {
    return (
      <div className={cn("space-y-6", className)}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              className="ml-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              重试
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <PageContainer
      title="系统设置"
      description="配置应用的各项设置，包括基础信息、邮件、图片处理和安全策略。"
      className={className}
    >
      {/* 设置标签页 */}
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="space-y-6"
      >
        {/* Tab导航 */}
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
          {SETTINGS_TABS.map((tab) => (
            <TabsTrigger
              key={tab.key}
              value={tab.key}
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* 未保存更改提示 */}
        <AnimatePresence>
          {hasUnsavedChanges && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-orange-50 border border-orange-200 rounded-lg p-4 dark:bg-orange-950 dark:border-orange-800"
            >
              <div className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
                <Save className="h-4 w-4" />
                <span className="text-sm font-medium">您有未保存的更改</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab内容区域 */}
        <div className="min-h-[600px]">
          {/* 基础设置 */}
          <TabsContent value={SettingType.BASIC} className="space-y-6 mt-0">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading-basic"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <SettingsLoadingSkeleton />
                </motion.div>
              ) : (
                <motion.div
                  key="content-basic"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <BasicSettingsForm
                    data={settings.basic}
                    onSubmit={updateBasicSettings}
                    isSubmitting={isSubmitting}
                    error={error}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          {/* 邮件设置 */}
          <TabsContent value={SettingType.EMAIL} className="space-y-6 mt-0">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading-email"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <SettingsLoadingSkeleton />
                </motion.div>
              ) : (
                <motion.div
                  key="content-email"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <EmailSettingsForm
                    data={settings.email}
                    onSubmit={updateEmailSettings}
                    onTestEmail={testEmailConfiguration}
                    isSubmitting={isSubmitting}
                    isTestingEmail={isTestingEmail}
                    error={error}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          {/* 图片设置 */}
          <TabsContent value={SettingType.IMAGE} className="space-y-6 mt-0">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading-image"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <SettingsLoadingSkeleton />
                </motion.div>
              ) : (
                <motion.div
                  key="content-image"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <ImageSettingsForm
                    data={settings.image}
                    onSubmit={updateImageSettings}
                    isSubmitting={isSubmitting}
                    error={error}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          {/* 安全设置 */}
          <TabsContent value={SettingType.SECURITY} className="space-y-6 mt-0">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading-security"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <SettingsLoadingSkeleton />
                </motion.div>
              ) : (
                <motion.div
                  key="content-security"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <SecuritySettingsForm
                    data={settings.security}
                    onSubmit={updateSecuritySettings}
                    isSubmitting={isSubmitting}
                    error={error}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>
        </div>
      </Tabs>

      {/* 底部状态栏 */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>最后更新: {lastUpdateTime}</span>
          {retryCount > 0 && (
            <span className="text-blue-600">已重试 {retryCount} 次</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <div className="flex items-center gap-2 text-orange-600">
              <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-sm">有未保存的更改</span>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
};
