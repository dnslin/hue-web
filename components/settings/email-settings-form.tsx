"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EmailSettings } from "@/lib/types/settings";
import { emailSettingsSchema, type EmailSettingsFormData } from "@/lib/schema";
import {
  SettingsFormWrapper,
  SettingsFormSection,
} from "./settings-form-wrapper";
import {
  LabeledInput,
  LabeledSwitch,
  LabeledNumberInput,
  LabeledPasswordInput,
  TestButton,
} from "./form-components";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface EmailSettingsFormProps {
  data: EmailSettings | null;
  onSubmit: (data: EmailSettingsFormData) => Promise<boolean>;
  onTestEmail?: (
    data: EmailSettingsFormData,
    testRecipient: string
  ) => Promise<boolean>;
  isSubmitting?: boolean;
  isTestingEmail?: boolean;
  error?: string | null;
}

export const EmailSettingsForm = ({
  data,
  onSubmit,
  onTestEmail,
  isSubmitting = false,
  isTestingEmail = false,
  error,
}: EmailSettingsFormProps) => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [testRecipient, setTestRecipient] = useState("");
  const [showTestSection, setShowTestSection] = useState(false);

  const form = useForm<EmailSettingsFormData>({
    resolver: zodResolver(emailSettingsSchema) as any,
    defaultValues: {
      fromEmailAddress: "",
      fromEmailName: "",
      smtpServer: "",
      smtpPort: 587,
      smtpUsername: "",
      smtpPassword: "",
      emailNotifyEnabled: true,
    },
  });

  // 当数据变化时更新表单
  useEffect(() => {
    if (data) {
      form.reset({
        fromEmailAddress: data.fromEmailAddress || "",
        fromEmailName: data.fromEmailName || "",
        smtpServer: data.smtpServer || "",
        smtpPort: data.smtpPort || 587,
        smtpUsername: data.smtpUsername || "",
        smtpPassword: data.smtpPassword || "",
        emailNotifyEnabled: data.emailNotifyEnabled ?? true,
      });
    }
  }, [data, form]);

  // 清除成功消息
  useEffect(() => {
    if (error) {
      setSuccessMessage(null);
    }
  }, [error]);

  const handleSubmit = async (formData: EmailSettingsFormData) => {
    try {
      setSuccessMessage(null);
      const success = await onSubmit(formData);

      if (success) {
        setSuccessMessage("邮件设置已成功保存！");
        toast.success("邮件设置已保存");

        // 3秒后清除成功消息
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      }
    } catch (err: any) {
      console.error("保存邮件设置失败:", err);
      toast.error("保存失败，请重试");
    }
  };

  const handleTestEmail = async () => {
    if (!onTestEmail || !testRecipient) {
      toast.error("请输入测试邮箱地址");
      return;
    }

    const currentFormData = form.getValues();

    try {
      const success = await onTestEmail(currentFormData, testRecipient);

      if (success) {
        toast.success(`测试邮件已发送到 ${testRecipient}`);
      } else {
        toast.error("邮件发送失败，请检查配置");
      }
    } catch (err: any) {
      console.error("测试邮件失败:", err);
      toast.error("测试邮件发送失败");
    }
  };

  const { watch } = form;
  const watchedValues = watch();

  // 常用SMTP配置预设
  const smtpPresets = [
    {
      name: "Gmail",
      server: "smtp.gmail.com",
      port: 587,
      description: "Gmail SMTP配置",
    },
    {
      name: "QQ邮箱",
      server: "smtp.qq.com",
      port: 587,
      description: "QQ邮箱SMTP配置",
    },
    {
      name: "163邮箱",
      server: "smtp.163.com",
      port: 25,
      description: "163邮箱SMTP配置",
    },
    {
      name: "阿里云邮件",
      server: "smtpdm.aliyun.com",
      port: 80,
      description: "阿里云邮件推送服务",
    },
  ];

  const setPreset = (preset: (typeof smtpPresets)[0]) => {
    form.setValue("smtpServer", preset.server, { shouldDirty: true });
    form.setValue("smtpPort", preset.port, { shouldDirty: true });
    toast.success(`已应用 ${preset.name} 配置`);
  };

  return (
    <div className="space-y-6">
      <SettingsFormWrapper
        form={form as any}
        onSubmit={handleSubmit}
        title="邮件设置"
        description="配置SMTP服务器和邮件通知功能"
        isSubmitting={isSubmitting}
        error={error}
        successMessage={successMessage}
        saveButtonText="保存邮件设置"
      >
        {/* 发件人信息区域 */}
        <SettingsFormSection
          title="发件人信息"
          description="设置邮件发送者的信息"
        >
          <LabeledInput
            label="发件人邮箱"
            name="fromEmailAddress"
            register={form.register}
            error={form.formState.errors.fromEmailAddress}
            placeholder="noreply@example.com"
            type="email"
            required
            tooltip="系统发送邮件时显示的发件人邮箱地址"
          />

          <LabeledInput
            label="发件人名称"
            name="fromEmailName"
            register={form.register}
            error={form.formState.errors.fromEmailName}
            placeholder="系统通知"
            required
            tooltip="系统发送邮件时显示的发件人名称"
          />
        </SettingsFormSection>

        {/* SMTP服务器配置区域 */}
        <SettingsFormSection
          title="SMTP服务器配置"
          description="配置邮件发送服务器的连接信息"
        >
          {/* SMTP预设配置 */}
          <div className="space-y-3">
            <label className="text-sm font-medium">快速配置</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {smtpPresets.map((preset) => (
                <Button
                  key={preset.name}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPreset(preset)}
                  className="h-auto py-2 px-3 text-left"
                >
                  <div>
                    <div className="font-medium text-xs">{preset.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {preset.server}:{preset.port}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          <LabeledInput
            label="SMTP服务器"
            name="smtpServer"
            register={form.register}
            error={form.formState.errors.smtpServer}
            placeholder="smtp.example.com"
            required
            tooltip="邮件服务提供商的SMTP服务器地址"
          />

          <LabeledNumberInput
            label="SMTP端口"
            name="smtpPort"
            register={form.register}
            error={form.formState.errors.smtpPort}
            placeholder="587"
            min={1}
            max={65535}
            required
            tooltip="SMTP服务器端口，常用端口：25、465、587"
            description="常用端口：25(非加密)、465(SSL)、587(TLS)"
          />

          <LabeledInput
            label="SMTP用户名"
            name="smtpUsername"
            register={form.register}
            error={form.formState.errors.smtpUsername}
            placeholder="username@example.com"
            required
            tooltip="SMTP服务器登录用户名，通常是邮箱地址"
          />

          <LabeledPasswordInput
            label="SMTP密码"
            name="smtpPassword"
            register={form.register}
            error={form.formState.errors.smtpPassword}
            placeholder="请输入SMTP密码或授权码"
            required
            tooltip="SMTP服务器登录密码或应用专用密码"
          />
        </SettingsFormSection>

        {/* 邮件通知设置区域 */}
        <SettingsFormSection
          title="邮件通知设置"
          description="配置系统邮件通知功能"
        >
          <LabeledSwitch
            label="启用邮件通知"
            description="是否启用系统邮件通知功能"
            checked={watchedValues.emailNotifyEnabled}
            onCheckedChange={(checked) =>
              form.setValue("emailNotifyEnabled", checked, {
                shouldDirty: true,
              })
            }
            tooltip="关闭后，系统将不会发送任何邮件通知"
          />
        </SettingsFormSection>
      </SettingsFormWrapper>

      {/* 邮件测试区域 */}
      {onTestEmail && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              邮件配置测试
            </CardTitle>
            <CardDescription>测试当前的邮件配置是否正常工作</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                邮件测试将使用当前表单中的配置发送测试邮件，请确保配置信息正确。
              </AlertDescription>
            </Alert>

            <div className="flex gap-3">
              <div className="flex-1">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    测试邮箱
                  </label>
                  <input
                    type="email"
                    placeholder="test@example.com"
                    value={testRecipient}
                    onChange={(e) => setTestRecipient(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <p className="text-sm text-muted-foreground">
                    用于接收测试邮件的邮箱地址
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <TestButton
                onClick={handleTestEmail}
                loading={isTestingEmail}
                disabled={!testRecipient || isTestingEmail}
              >
                发送测试邮件
              </TestButton>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
