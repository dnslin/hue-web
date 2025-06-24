"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BasicSiteSetting } from "@/lib/types/settings";
import { basicSettingSchema, type BasicSettingFormData } from "@/lib/schema";
import {
  SettingsFormWrapper,
  SettingsFormSection,
} from "./settings-form-wrapper";
import {
  LabeledInput,
  LabeledTextarea,
  LabeledSwitch,
  LabeledNumberInput,
} from "./form-components";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface BasicSettingsFormProps {
  data: BasicSiteSetting | null;
  onSubmit: (data: BasicSettingFormData) => Promise<boolean>;
  isSubmitting?: boolean;
  error?: string | null;
}

export const BasicSettingsForm = ({
  data,
  onSubmit,
  isSubmitting = false,
  error,
}: BasicSettingsFormProps) => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<BasicSettingFormData>({
    resolver: zodResolver(basicSettingSchema) as any,
    defaultValues: {
      appName: "",
      siteDescription: "",
      seoKeywords: "",
      logoURL: "",
      faviconURL: "",
      siteAnnouncement: "",
      userRegistrationEnabled: true,
      adminApprovalRequired: false,
      emailVerificationRequired: true,
      guestUploadEnabled: false,
      userInitialStorageCapacityMB: 1024,
      notifyAdminOnPendingApproval: false,
    },
  });

  // 当数据变化时更新表单
  useEffect(() => {
    if (data) {
      form.reset({
        appName: data.appName || "",
        siteDescription: data.siteDescription || "",
        seoKeywords: data.seoKeywords || "",
        logoURL: data.logoURL || "",
        faviconURL: data.faviconURL || "",
        siteAnnouncement: data.siteAnnouncement || "",
        userRegistrationEnabled: data.userRegistrationEnabled ?? true,
        adminApprovalRequired: data.adminApprovalRequired ?? false,
        emailVerificationRequired: data.emailVerificationRequired ?? true,
        guestUploadEnabled: data.guestUploadEnabled ?? false,
        userInitialStorageCapacityMB: data.userInitialStorageCapacityMB || 1024,
        notifyAdminOnPendingApproval:
          data.notifyAdminOnPendingApproval ?? false,
      });
    }
  }, [data, form]);

  // 清除成功消息
  useEffect(() => {
    if (error) {
      setSuccessMessage(null);
    }
  }, [error]);

  const handleSubmit = async (formData: BasicSettingFormData) => {
    try {
      setSuccessMessage(null);
      const success = await onSubmit(formData);

      if (success) {
        setSuccessMessage("基础设置已成功保存！");
        toast.success("基础设置已保存");

        // 3秒后清除成功消息
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      }
    } catch (err: any) {
      console.error("保存基础设置失败:", err);
      toast.error("保存失败，请重试");
    }
  };

  const { watch } = form;
  const watchedValues = watch();

  return (
    <SettingsFormWrapper
      form={form as any}
      onSubmit={handleSubmit}
      title="基础设置"
      description="配置应用的基本信息、品牌标识和站点设置"
      isSubmitting={isSubmitting}
      error={error}
      successMessage={successMessage}
      saveButtonText="保存基础设置"
    >
      {/* 应用信息区域 */}
      <SettingsFormSection
        title="应用信息"
        description="设置应用的基本信息和品牌标识"
      >
        <LabeledInput
          label="应用名称"
          name="appName"
          register={form.register}
          error={form.formState.errors.appName}
          placeholder="请输入应用名称"
          required
          tooltip="显示在浏览器标题栏和应用各处的名称"
        />

        <LabeledTextarea
          label="站点描述"
          name="siteDescription"
          register={form.register}
          error={form.formState.errors.siteDescription}
          placeholder="请输入站点描述，用于SEO和社交媒体分享"
          rows={3}
          tooltip="用于SEO优化和社交媒体分享的站点描述"
        />

        <LabeledInput
          label="SEO 关键词"
          name="seoKeywords"
          register={form.register}
          error={form.formState.errors.seoKeywords}
          placeholder="请输入关键词，多个关键词用逗号分隔"
          tooltip="用于搜索引擎优化的关键词，多个关键词用逗号分隔"
        />
      </SettingsFormSection>

      {/* 品牌设置区域 */}
      <SettingsFormSection
        title="品牌设置"
        description="配置Logo、图标等品牌视觉元素"
      >
        <LabeledInput
          label="Logo URL"
          name="logoURL"
          register={form.register}
          error={form.formState.errors.logoURL}
          placeholder="https://example.com/logo.png"
          type="url"
          tooltip="网站Logo的URL地址，建议使用PNG或SVG格式"
        />

        <LabeledInput
          label="Favicon URL"
          name="faviconURL"
          register={form.register}
          error={form.formState.errors.faviconURL}
          placeholder="https://example.com/favicon.ico"
          type="url"
          tooltip="网站图标的URL地址，显示在浏览器标签页上"
        />
      </SettingsFormSection>

      {/* 站点公告区域 */}
      <SettingsFormSection
        title="站点公告"
        description="设置在站点顶部显示的重要公告信息"
      >
        <LabeledTextarea
          label="公告内容"
          name="siteAnnouncement"
          register={form.register}
          error={form.formState.errors.siteAnnouncement}
          placeholder="请输入站点公告内容（支持HTML）"
          rows={4}
          tooltip="将显示在站点顶部的公告信息，支持HTML标签"
        />
      </SettingsFormSection>

      {/* 用户注册设置区域 */}
      <SettingsFormSection
        title="用户注册设置"
        description="配置用户注册、审核和权限相关设置"
      >
        <LabeledSwitch
          label="允许用户注册"
          description="是否允许新用户注册账户"
          checked={watchedValues.userRegistrationEnabled}
          onCheckedChange={(checked) =>
            form.setValue("userRegistrationEnabled", checked, {
              shouldDirty: true,
            })
          }
          tooltip="关闭后，新用户将无法自主注册账户"
        />

        <LabeledSwitch
          label="需要管理员审核"
          description="新注册用户是否需要管理员审核后才能使用"
          checked={watchedValues.adminApprovalRequired}
          onCheckedChange={(checked) =>
            form.setValue("adminApprovalRequired", checked, {
              shouldDirty: true,
            })
          }
          disabled={!watchedValues.userRegistrationEnabled}
          tooltip="开启后，新用户注册后需要管理员审核通过才能使用"
        />

        {watchedValues.adminApprovalRequired && (
          <LabeledSwitch
            label="通知管理员"
            description="新用户注册时通知管理员进行审核"
            checked={watchedValues.notifyAdminOnPendingApproval}
            onCheckedChange={(checked) =>
              form.setValue("notifyAdminOnPendingApproval", checked, {
                shouldDirty: true,
              })
            }
            disabled={!watchedValues.userRegistrationEnabled}
            tooltip="开启后，有新用户注册时会发送通知给管理员"
          />
        )}

        <LabeledSwitch
          label="需要邮箱验证"
          description="新注册用户是否需要验证邮箱"
          checked={watchedValues.emailVerificationRequired}
          onCheckedChange={(checked) =>
            form.setValue("emailVerificationRequired", checked, {
              shouldDirty: true,
            })
          }
          disabled={!watchedValues.userRegistrationEnabled}
          tooltip="开启后，用户注册时需要验证邮箱地址"
        />

        <LabeledSwitch
          label="允许游客上传"
          description="是否允许未登录用户上传文件"
          checked={watchedValues.guestUploadEnabled}
          onCheckedChange={(checked) =>
            form.setValue("guestUploadEnabled", checked, { shouldDirty: true })
          }
          tooltip="开启后，未登录的游客也可以上传文件"
        />
      </SettingsFormSection>

      {/* 存储设置区域 */}
      <SettingsFormSection
        title="存储设置"
        description="配置用户初始存储容量等存储相关设置"
      >
        <LabeledNumberInput
          label="用户初始存储容量 (MB)"
          name="userInitialStorageCapacityMB"
          register={form.register}
          error={form.formState.errors.userInitialStorageCapacityMB}
          placeholder="1024"
          min={10}
          max={102400}
          tooltip="新注册用户的初始存储容量，单位为MB"
          description="设置范围：10MB - 100GB (102400MB)"
        />
      </SettingsFormSection>
    </SettingsFormWrapper>
  );
};
