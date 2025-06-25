import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  getSettingsAction,
  updateBasicSettingsAction,
  updateEmailSettingsAction,
  updateImageSettingsAction,
  updateSecuritySettingsAction,
  updateMultipleSettingsAction,
  testEmailSettingsAction,
} from "@/lib/actions/settings/settings.actions";
import { AllSettingsData, SettingType } from "@/lib/types/settings";
import {
  BasicSettingFormData,
  EmailSettingsFormData,
  ImageSettingsFormData,
  SecuritySettingsFormData,
} from "@/lib/schema";
import { isSuccessApiResponse } from "@/lib/types/common";
import { handleStoreError } from "@/lib/utils/error-handler";

/**
 * 设置页面状态接口
 */
interface SettingsState {
  // 数据状态
  settings: AllSettingsData;
  isLoading: boolean;
  isSubmitting: boolean;
  lastUpdated: number | null;
  error: string | null;

  // UI状态
  activeTab: SettingType;
  hasUnsavedChanges: boolean;
  isTestingEmail: boolean;

  // 操作方法
  setActiveTab: (tab: SettingType) => void;
  setUnsavedChanges: (hasChanges: boolean) => void;
  clearError: () => void;

  // 数据操作
  loadSettings: () => Promise<boolean>;
  updateBasicSettings: (data: BasicSettingFormData) => Promise<boolean>;
  updateEmailSettings: (data: EmailSettingsFormData) => Promise<boolean>;
  updateImageSettings: (data: ImageSettingsFormData) => Promise<boolean>;
  updateSecuritySettings: (data: SecuritySettingsFormData) => Promise<boolean>;
  updateMultipleSettings: (updates: {
    basic?: BasicSettingFormData;
    email?: EmailSettingsFormData;
    image?: ImageSettingsFormData;
    security?: SecuritySettingsFormData;
  }) => Promise<boolean>;
  testEmailConfiguration: (
    emailData: EmailSettingsFormData,
    testRecipient: string
  ) => Promise<boolean>;

  // 重置方法
  reset: () => void;
}

/**
 * 初始设置数据
 */
const initialSettings: AllSettingsData = {
  basic: null,
  email: null,
  image: null,
  security: null,
};

/**
 * 设置状态管理Store
 */
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      // 初始状态
      settings: initialSettings,
      isLoading: false,
      isSubmitting: false,
      lastUpdated: null,
      error: null,
      activeTab: SettingType.BASIC,
      hasUnsavedChanges: false,
      isTestingEmail: false,

      // UI状态管理
      setActiveTab: (tab: SettingType) => {
        set({ activeTab: tab });
      },

      setUnsavedChanges: (hasChanges: boolean) => {
        set({ hasUnsavedChanges: hasChanges });
      },

      clearError: () => {
        set({ error: null });
      },

      // 加载所有设置
      loadSettings: async (): Promise<boolean> => {
        set({ isLoading: true, error: null });

        try {
          const result = await getSettingsAction();

          // getSettingsAction 返回 AllSettingsData | ErrorApiResponse
          if ("code" in result) {
            // 错误响应
            console.error("❌ 加载设置失败:", result.message);
            const errorResult = await handleStoreError(result, "加载设置");
            set({
              isLoading: false,
              error: errorResult.error,
              settings: initialSettings,
            });
            return false;
          } else {
            // 成功响应 - 直接是 AllSettingsData
            set({
              isLoading: false,
              settings: result,
              lastUpdated: Date.now(),
              error: null,
            });
            return true;
          }
        } catch (error: any) {
          console.error("❌ 加载设置异常:", error);
          const errorResult = await handleStoreError(error, "加载设置");
          set({
            isLoading: false,
            error: errorResult.error,
            settings: initialSettings,
          });
          return false;
        }
      },

      // 更新基础设置
      updateBasicSettings: async (
        data: BasicSettingFormData
      ): Promise<boolean> => {
        set({ isSubmitting: true, error: null });

        try {
          const result = await updateBasicSettingsAction(data);

          if (isSuccessApiResponse(result)) {
            // 成功响应
            const currentSettings = get().settings;
            set({
              isSubmitting: false,
              settings: {
                ...currentSettings,
                basic: result.data,
              },
              lastUpdated: Date.now(),
              hasUnsavedChanges: false,
            });
            console.log("✅ 基础设置更新成功");
            return true;
          } else {
            // 错误响应
            console.error("❌ 更新基础设置失败:", result.message);
            const errorResult = await handleStoreError(result, "更新基础设置");
            set({ isSubmitting: false, error: errorResult.error });
            return false;
          }
        } catch (error: any) {
          console.error("❌ 更新基础设置异常:", error);
          const errorResult = await handleStoreError(error, "更新基础设置");
          set({ isSubmitting: false, error: errorResult.error });
          return false;
        }
      },

      // 更新邮件设置
      updateEmailSettings: async (
        data: EmailSettingsFormData
      ): Promise<boolean> => {
        set({ isSubmitting: true, error: null });

        try {
          const result = await updateEmailSettingsAction(data);

          if (isSuccessApiResponse(result)) {
            const currentSettings = get().settings;
            set({
              isSubmitting: false,
              settings: {
                ...currentSettings,
                email: result.data,
              },
              lastUpdated: Date.now(),
              hasUnsavedChanges: false,
            });
            console.log("✅ 邮件设置更新成功");
            return true;
          } else {
            console.error("❌ 更新邮件设置失败:", result.message);
            const errorResult = await handleStoreError(result, "更新邮件设置");
            set({ isSubmitting: false, error: errorResult.error });
            return false;
          }
        } catch (error: any) {
          console.error("❌ 更新邮件设置异常:", error);
          const errorResult = await handleStoreError(error, "更新邮件设置");
          set({ isSubmitting: false, error: errorResult.error });
          return false;
        }
      },

      // 更新图片设置
      updateImageSettings: async (
        data: ImageSettingsFormData
      ): Promise<boolean> => {
        set({ isSubmitting: true, error: null });

        try {
          const result = await updateImageSettingsAction(data);

          if (isSuccessApiResponse(result)) {
            const currentSettings = get().settings;
            set({
              isSubmitting: false,
              settings: {
                ...currentSettings,
                image: result.data,
              },
              lastUpdated: Date.now(),
              hasUnsavedChanges: false,
            });
            console.log("✅ 图片设置更新成功");
            return true;
          } else {
            console.error("❌ 更新图片设置失败:", result.message);
            const errorResult = await handleStoreError(result, "更新图片设置");
            set({ isSubmitting: false, error: errorResult.error });
            return false;
          }
        } catch (error: any) {
          console.error("❌ 更新图片设置异常:", error);
          const errorResult = await handleStoreError(error, "更新图片设置");
          set({ isSubmitting: false, error: errorResult.error });
          return false;
        }
      },

      // 更新安全设置
      updateSecuritySettings: async (
        data: SecuritySettingsFormData
      ): Promise<boolean> => {
        set({ isSubmitting: true, error: null });

        try {
          const result = await updateSecuritySettingsAction(data);

          if (isSuccessApiResponse(result)) {
            const currentSettings = get().settings;
            set({
              isSubmitting: false,
              settings: {
                ...currentSettings,
                security: result.data,
              },
              lastUpdated: Date.now(),
              hasUnsavedChanges: false,
            });
            console.log("✅ 安全设置更新成功");
            return true;
          } else {
            console.error("❌ 更新安全设置失败:", result.message);
            const errorResult = await handleStoreError(result, "更新安全设置");
            set({ isSubmitting: false, error: errorResult.error });
            return false;
          }
        } catch (error: any) {
          console.error("❌ 更新安全设置异常:", error);
          const errorResult = await handleStoreError(error, "更新安全设置");
          set({ isSubmitting: false, error: errorResult.error });
          return false;
        }
      },

      // 批量更新设置
      updateMultipleSettings: async (updates: {
        basic?: BasicSettingFormData;
        email?: EmailSettingsFormData;
        image?: ImageSettingsFormData;
        security?: SecuritySettingsFormData;
      }): Promise<boolean> => {
        set({ isSubmitting: true, error: null });

        try {
          const result = await updateMultipleSettingsAction(updates);

          if (!result.success) {
            const errorMsg = result.errors.join("; ") || "批量更新设置失败";
            set({ isSubmitting: false, error: errorMsg });
            return false;
          } else {
            // 重新加载所有设置以确保数据一致性
            await get().loadSettings();
            set({
              isSubmitting: false,
              hasUnsavedChanges: false,
            });
            console.log("✅ 批量设置更新成功");
            return true;
          }
        } catch (error: any) {
          const errorMsg = error.message || "批量更新设置时发生未知错误";
          set({ isSubmitting: false, error: errorMsg });
          console.error("❌ 批量更新设置异常:", error);
          return false;
        }
      },

      // 测试邮件配置
      testEmailConfiguration: async (
        emailData: EmailSettingsFormData,
        testRecipient: string
      ): Promise<boolean> => {
        set({ isTestingEmail: true, error: null });

        try {
          const result = await testEmailSettingsAction(
            emailData,
            testRecipient
          );

          if (isSuccessApiResponse(result)) {
            set({ isTestingEmail: false });
            console.log("✅ 邮件配置测试成功");
            return true;
          } else {
            console.error("❌ 邮件配置测试失败:", result.message);
            const errorResult = await handleStoreError(result, "邮件配置测试");
            set({ isTestingEmail: false, error: errorResult.error });
            return false;
          }
        } catch (error: any) {
          console.error("❌ 邮件配置测试异常:", error);
          const errorResult = await handleStoreError(error, "邮件配置测试");
          set({ isTestingEmail: false, error: errorResult.error });
          return false;
        }
      },

      // 重置状态
      reset: () => {
        set({
          settings: initialSettings,
          isLoading: false,
          isSubmitting: false,
          lastUpdated: null,
          error: null,
          activeTab: SettingType.BASIC,
          hasUnsavedChanges: false,
          isTestingEmail: false,
        });
        console.log("🔄 设置状态已重置");
      },
    }),
    {
      name: "settings-storage",
      partialize: (state) => ({
        activeTab: state.activeTab,
        settings: state.settings,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);

// 导出便捷钩子
export const useSettingsActions = () => {
  const store = useSettingsStore();
  return {
    loadSettings: store.loadSettings,
    updateBasicSettings: store.updateBasicSettings,
    updateEmailSettings: store.updateEmailSettings,
    updateImageSettings: store.updateImageSettings,
    updateSecuritySettings: store.updateSecuritySettings,
    updateMultipleSettings: store.updateMultipleSettings,
    testEmailConfiguration: store.testEmailConfiguration,
    setActiveTab: store.setActiveTab,
    setUnsavedChanges: store.setUnsavedChanges,
    clearError: store.clearError,
    reset: store.reset,
  };
};

export const useSettingsData = () => {
  const store = useSettingsStore();
  return {
    settings: store.settings,
    isLoading: store.isLoading,
    isSubmitting: store.isSubmitting,
    isTestingEmail: store.isTestingEmail,
    lastUpdated: store.lastUpdated,
    error: store.error,
    activeTab: store.activeTab,
    hasUnsavedChanges: store.hasUnsavedChanges,
  };
};
