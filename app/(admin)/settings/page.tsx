import { Metadata } from "next";
import { SettingsContainer } from "@/components/settings/settings-container";

export const metadata: Metadata = {
  title: "系统设置",
  description: "配置系统的基础设置、邮件、图片处理和安全策略",
  keywords: ["设置", "配置", "邮件", "图片处理", "安全", "管理"],
};

export default function SettingsPage() {
  return <SettingsContainer />;
}
