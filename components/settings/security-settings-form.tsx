"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SecuritySetting } from "@/lib/types/settings";
import {
  securitySettingsSchema,
  type SecuritySettingsFormData,
} from "@/lib/schema";
import {
  SettingsFormWrapper,
  SettingsFormSection,
} from "./settings-form-wrapper";
import {
  LabeledNumberInput,
  LabeledSwitch,
  LabeledTextarea,
} from "./form-components";
import { PasswordStrengthIndicator } from "./password-strength-indicator";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Shield, Lock, Globe, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface SecuritySettingsFormProps {
  data: SecuritySetting | null;
  onSubmit: (data: SecuritySettingsFormData) => Promise<boolean>;
  isSubmitting?: boolean;
  error?: string | null;
}

export const SecuritySettingsForm = ({
  data,
  onSubmit,
  isSubmitting = false,
  error,
}: SecuritySettingsFormProps) => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<SecuritySettingsFormData>({
    resolver: zodResolver(securitySettingsSchema) as any,
    defaultValues: {
      passwordMinLength: 8,
      passwordRequiresUppercase: true,
      passwordRequiresLowercase: true,
      passwordRequiresNumber: true,
      passwordRequiresSpecialChar: false,
      loginMaxAttempts: 5,
      accountLockoutDurationMinutes: 30,
      ipWhitelist: "",
      ipBlacklist: "",
    },
  });

  // 当数据变化时更新表单
  useEffect(() => {
    if (data) {
      form.reset({
        passwordMinLength: data.passwordMinLength || 8,
        passwordRequiresUppercase: data.passwordRequiresUppercase ?? true,
        passwordRequiresLowercase: data.passwordRequiresLowercase ?? true,
        passwordRequiresNumber: data.passwordRequiresNumber ?? true,
        passwordRequiresSpecialChar: data.passwordRequiresSpecialChar ?? false,
        loginMaxAttempts: data.loginMaxAttempts || 5,
        accountLockoutDurationMinutes: data.accountLockoutDurationMinutes || 30,
        ipWhitelist: data.ipWhitelist || "",
        ipBlacklist: data.ipBlacklist || "",
      });
    }
  }, [data, form]);

  // 清除成功消息
  useEffect(() => {
    if (error) {
      setSuccessMessage(null);
    }
  }, [error]);

  const handleSubmit = async (formData: SecuritySettingsFormData) => {
    try {
      setSuccessMessage(null);
      const success = await onSubmit(formData);

      if (success) {
        setSuccessMessage("安全设置已成功保存！");
        toast.success("安全设置已保存");

        // 3秒后清除成功消息
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      }
    } catch (err: any) {
      console.error("保存安全设置失败:", err);
      toast.error("保存失败，请重试");
    }
  };

  const { watch } = form;
  const watchedValues = watch();

  // IP地址格式验证辅助函数
  const validateIPList = (ipList: string) => {
    if (!ipList.trim()) return true; // 空列表是有效的

    const ips = ipList.split("\n").filter((ip) => ip.trim());
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/;

    return ips.every((ip) => {
      const trimmedIP = ip.trim();
      if (!trimmedIP) return true;

      // 检查IP地址格式（支持CIDR）
      if (!ipRegex.test(trimmedIP)) return false;

      // 检查IP地址范围
      const parts = trimmedIP.split("/")[0].split(".");
      return parts.every((part) => {
        const num = parseInt(part);
        return num >= 0 && num <= 255;
      });
    });
  };

  return (
    <SettingsFormWrapper
      form={form as any}
      onSubmit={handleSubmit}
      title="安全设置"
      description="配置密码策略、登录限制和IP访问控制等安全功能"
      isSubmitting={isSubmitting}
      error={error}
      successMessage={successMessage}
      saveButtonText="保存安全设置"
    >
      {/* 密码策略区域 */}
      <SettingsFormSection
        title="密码策略"
        description="设置用户密码的强度要求和复杂度规则"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 密码策略设置 */}
          <div className="space-y-4">
            <LabeledNumberInput
              label="密码最小长度"
              name="passwordMinLength"
              register={form.register}
              error={form.formState.errors.passwordMinLength}
              placeholder="8"
              min={6}
              max={64}
              tooltip="用户密码的最小字符数要求"
              description="建议设置为8-16位之间"
            />

            <div className="space-y-3">
              <LabeledSwitch
                label="需要大写字母"
                description="密码必须包含至少一个大写字母 (A-Z)"
                checked={watchedValues.passwordRequiresUppercase}
                onCheckedChange={(checked) =>
                  form.setValue("passwordRequiresUppercase", checked, {
                    shouldDirty: true,
                  })
                }
                tooltip="增强密码复杂度，提高安全性"
              />

              <LabeledSwitch
                label="需要小写字母"
                description="密码必须包含至少一个小写字母 (a-z)"
                checked={watchedValues.passwordRequiresLowercase}
                onCheckedChange={(checked) =>
                  form.setValue("passwordRequiresLowercase", checked, {
                    shouldDirty: true,
                  })
                }
                tooltip="基本的密码复杂度要求"
              />

              <LabeledSwitch
                label="需要数字"
                description="密码必须包含至少一个数字 (0-9)"
                checked={watchedValues.passwordRequiresNumber}
                onCheckedChange={(checked) =>
                  form.setValue("passwordRequiresNumber", checked, {
                    shouldDirty: true,
                  })
                }
                tooltip="增加密码的多样性"
              />

              <LabeledSwitch
                label="需要特殊字符"
                description="密码必须包含至少一个特殊字符 (!@#$%^&*)"
                checked={watchedValues.passwordRequiresSpecialChar}
                onCheckedChange={(checked) =>
                  form.setValue("passwordRequiresSpecialChar", checked, {
                    shouldDirty: true,
                  })
                }
                tooltip="最高级别的密码安全要求"
              />
            </div>
          </div>

          {/* 密码强度指示器 */}
          <PasswordStrengthIndicator
            minLength={watchedValues.passwordMinLength}
            requiresUppercase={watchedValues.passwordRequiresUppercase}
            requiresLowercase={watchedValues.passwordRequiresLowercase}
            requiresNumber={watchedValues.passwordRequiresNumber}
            requiresSpecialChar={watchedValues.passwordRequiresSpecialChar}
          />
        </div>

        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            密码策略变更将在用户下次修改密码时生效。建议定期提醒用户更新密码以符合新策略。
          </AlertDescription>
        </Alert>
      </SettingsFormSection>

      {/* 登录安全区域 */}
      <SettingsFormSection
        title="登录安全"
        description="配置登录尝试限制和账户锁定策略"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LabeledNumberInput
            label="最大登录尝试次数"
            name="loginMaxAttempts"
            register={form.register}
            error={form.formState.errors.loginMaxAttempts}
            placeholder="5"
            min={3}
            max={20}
            tooltip="用户连续登录失败的最大允许次数"
            description="超出后将锁定账户"
          />

          <LabeledNumberInput
            label="账户锁定时间 (分钟)"
            name="accountLockoutDurationMinutes"
            register={form.register}
            error={form.formState.errors.accountLockoutDurationMinutes}
            placeholder="30"
            min={5}
            max={1440}
            tooltip="账户被锁定后的解锁等待时间"
            description="1440分钟 = 24小时"
          />
        </div>

        <Alert>
          <Lock className="h-4 w-4" />
          <AlertDescription>
            登录安全设置有助于防止暴力破解攻击。建议设置适中的尝试次数和锁定时间，避免影响正常用户使用。
          </AlertDescription>
        </Alert>
      </SettingsFormSection>

      {/* IP访问控制区域 */}
      <SettingsFormSection
        title="IP访问控制"
        description="配置IP地址白名单和黑名单，控制访问权限"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <LabeledTextarea
              label="IP白名单"
              name="ipWhitelist"
              register={form.register}
              error={form.formState.errors.ipWhitelist}
              placeholder="192.168.1.1,10.0.0.0/8,172.16.0.0/12"
              rows={6}
              tooltip="只允许这些IP地址访问系统，每行一个IP或IP段"
              description="支持单个IP或CIDR格式的IP段"
            />
            {watchedValues.ipWhitelist &&
              !validateIPList(watchedValues.ipWhitelist) && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    IP白名单格式不正确，请检查IP地址格式
                  </AlertDescription>
                </Alert>
              )}
          </div>

          <div className="space-y-4">
            <LabeledTextarea
              label="IP黑名单"
              name="ipBlacklist"
              register={form.register}
              error={form.formState.errors.ipBlacklist}
              placeholder="192.168.1.100,10.0.0.50,172.16.1.0/24"
              rows={6}
              tooltip="禁止这些IP地址访问系统，每行一个IP或IP段"
              description="支持单个IP或CIDR格式的IP段"
            />
            {watchedValues.ipBlacklist &&
              !validateIPList(watchedValues.ipBlacklist) && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    IP黑名单格式不正确，请检查IP地址格式
                  </AlertDescription>
                </Alert>
              )}
          </div>
        </div>

        <Alert>
          <Globe className="h-4 w-4" />
          <AlertDescription>
            <strong>重要提醒：</strong>{" "}
            配置IP访问控制时请谨慎操作，错误的配置可能导致您自己无法访问系统。
            白名单优先级高于黑名单，建议先测试后正式启用。
          </AlertDescription>
        </Alert>

        {/* IP格式说明 */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="text-sm font-medium mb-2">IP地址格式说明</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• 单个IP地址：192.168.1.1</li>
            <li>• IP段（CIDR）：192.168.1.0/24</li>
            <li>• 每行一个IP地址或IP段</li>
            <li>• 空行将被忽略</li>
            <li>• 支持IPv4格式</li>
          </ul>
        </div>
      </SettingsFormSection>
    </SettingsFormWrapper>
  );
};
