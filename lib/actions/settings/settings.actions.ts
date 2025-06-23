"use server";

import {
  getAuthenticatedApiService,
  AuthenticationError,
} from "@/lib/api/apiService";
import {
  AllSettingsData,
  BasicSiteSetting,
  EmailSettings,
  ImageProcessingSetting,
  SecuritySetting,
  BasicSettingFormData,
  EmailSettingsFormData,
  ImageSettingsFormData,
  SecuritySettingsFormData,
  SettingType,
} from "@/lib/types/settings";
import { ErrorResponse, SuccessResponse } from "@/lib/types/user";
import { cacheManager, CACHE_KEYS } from "@/lib/utils/cache-manager";

// 设置相关API路径
const SETTINGS_API_BASE = "/admin/settings";

/**
 * 获取所有设置数据
 * GET /api/v1/admin/settings
 */
export async function getSettingsAction(): Promise<
  AllSettingsData | ErrorResponse
> {
  try {
    const apiService = await getAuthenticatedApiService();

    // 并行获取所有设置类型
    const [basicResponse, emailResponse, imageResponse, securityResponse] =
      await Promise.allSettled([
        apiService.get<SuccessResponse<BasicSiteSetting>>(
          `${SETTINGS_API_BASE}/basic`
        ),
        apiService.get<SuccessResponse<EmailSettings>>(
          `${SETTINGS_API_BASE}/email`
        ),
        apiService.get<SuccessResponse<ImageProcessingSetting>>(
          `${SETTINGS_API_BASE}/image`
        ),
        apiService.get<SuccessResponse<SecuritySetting>>(
          `${SETTINGS_API_BASE}/security`
        ),
      ]);

    // 处理响应结果
    const settingsData: AllSettingsData = {
      basic:
        basicResponse.status === "fulfilled"
          ? basicResponse.value.data.data || null
          : null,
      email:
        emailResponse.status === "fulfilled"
          ? emailResponse.value.data.data || null
          : null,
      image:
        imageResponse.status === "fulfilled"
          ? imageResponse.value.data.data || null
          : null,
      security:
        securityResponse.status === "fulfilled"
          ? securityResponse.value.data.data || null
          : null,
    };

    // 记录获取失败的设置类型
    const failedTypes = [];
    if (basicResponse.status === "rejected") failedTypes.push("基础设置");
    if (emailResponse.status === "rejected") failedTypes.push("邮件设置");
    if (imageResponse.status === "rejected") failedTypes.push("图片设置");
    if (securityResponse.status === "rejected") failedTypes.push("安全设置");

    if (failedTypes.length > 0) {
      console.warn(`部分设置获取失败: ${failedTypes.join(", ")}`);
    }

    return settingsData;
  } catch (error: any) {
    console.error("[Action Error] getSettingsAction:", error.message, error);
    if (error instanceof AuthenticationError) {
      return {
        code: error.status,
        message: error.message,
        error: "AuthenticationError",
      };
    }
    return {
      code: error.code || 500,
      message: error.message || "获取设置失败",
      error: error.data || error.message,
    };
  }
}

/**
 * 获取特定类型的设置
 * GET /api/v1/admin/settings/{type}
 */
export async function getSettingByTypeAction(
  type: SettingType
): Promise<SuccessResponse<any> | ErrorResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const cacheKey = `${CACHE_KEYS.SETTINGS_BASE}:${type}`;

    const response = await cacheManager.getOrSet(
      cacheKey,
      async () => {
        const apiResponse = await apiService.get<SuccessResponse<any>>(
          `${SETTINGS_API_BASE}/${type}`
        );
        return apiResponse.data;
      },
      { ttl: 5 * 60 * 1000, storage: "memory" }
    );

    return response as SuccessResponse<any> | ErrorResponse;
  } catch (error: any) {
    console.error(
      `[Action Error] getSettingByTypeAction(${type}):`,
      error.message,
      error
    );
    if (error instanceof AuthenticationError) {
      return {
        code: error.status,
        message: error.message,
        error: "AuthenticationError",
      };
    }
    return {
      code: error.code || 500,
      message: error.message || `获取${type}设置失败`,
      error: error.data || error.message,
    };
  }
}

/**
 * 更新基础设置
 * PUT /api/v1/admin/settings/basic
 */
export async function updateBasicSettingsAction(
  settingsData: BasicSettingFormData
): Promise<SuccessResponse<BasicSiteSetting> | ErrorResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.put<SuccessResponse<BasicSiteSetting>>(
      `${SETTINGS_API_BASE}/basic`,
      settingsData
    );

    // 清除相关缓存
    cacheManager.delete(`${CACHE_KEYS.SETTINGS_BASE}:basic`);
    cacheManager.delete(CACHE_KEYS.SETTINGS_ALL);

    return response.data;
  } catch (error: any) {
    console.error(
      "[Action Error] updateBasicSettingsAction:",
      error.message,
      error
    );
    if (error instanceof AuthenticationError) {
      return {
        code: error.status,
        message: error.message,
        error: "AuthenticationError",
      };
    }
    return {
      code: error.code || 500,
      message: error.message || "更新基础设置失败",
      error: error.data || error.message,
    };
  }
}

/**
 * 更新邮件设置
 * PUT /api/v1/admin/settings/email
 */
export async function updateEmailSettingsAction(
  settingsData: EmailSettingsFormData
): Promise<SuccessResponse<EmailSettings> | ErrorResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.put<SuccessResponse<EmailSettings>>(
      `${SETTINGS_API_BASE}/email`,
      settingsData
    );

    // 清除相关缓存
    cacheManager.delete(`${CACHE_KEYS.SETTINGS_BASE}:email`);
    cacheManager.delete(CACHE_KEYS.SETTINGS_ALL);

    return response.data;
  } catch (error: any) {
    console.error(
      "[Action Error] updateEmailSettingsAction:",
      error.message,
      error
    );
    if (error instanceof AuthenticationError) {
      return {
        code: error.status,
        message: error.message,
        error: "AuthenticationError",
      };
    }
    return {
      code: error.code || 500,
      message: error.message || "更新邮件设置失败",
      error: error.data || error.message,
    };
  }
}

/**
 * 更新图片设置
 * PUT /api/v1/admin/settings/image
 */
export async function updateImageSettingsAction(
  settingsData: ImageSettingsFormData
): Promise<SuccessResponse<ImageProcessingSetting> | ErrorResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.put<
      SuccessResponse<ImageProcessingSetting>
    >(`${SETTINGS_API_BASE}/image`, settingsData);

    // 清除相关缓存
    cacheManager.delete(`${CACHE_KEYS.SETTINGS_BASE}:image`);
    cacheManager.delete(CACHE_KEYS.SETTINGS_ALL);

    return response.data;
  } catch (error: any) {
    console.error(
      "[Action Error] updateImageSettingsAction:",
      error.message,
      error
    );
    if (error instanceof AuthenticationError) {
      return {
        code: error.status,
        message: error.message,
        error: "AuthenticationError",
      };
    }
    return {
      code: error.code || 500,
      message: error.message || "更新图片设置失败",
      error: error.data || error.message,
    };
  }
}

/**
 * 更新安全设置
 * PUT /api/v1/admin/settings/security
 */
export async function updateSecuritySettingsAction(
  settingsData: SecuritySettingsFormData
): Promise<SuccessResponse<SecuritySetting> | ErrorResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.put<SuccessResponse<SecuritySetting>>(
      `${SETTINGS_API_BASE}/security`,
      settingsData
    );

    // 清除相关缓存
    cacheManager.delete(`${CACHE_KEYS.SETTINGS_BASE}:security`);
    cacheManager.delete(CACHE_KEYS.SETTINGS_ALL);

    return response.data;
  } catch (error: any) {
    console.error(
      "[Action Error] updateSecuritySettingsAction:",
      error.message,
      error
    );
    if (error instanceof AuthenticationError) {
      return {
        code: error.status,
        message: error.message,
        error: "AuthenticationError",
      };
    }
    return {
      code: error.code || 500,
      message: error.message || "更新安全设置失败",
      error: error.data || error.message,
    };
  }
}

/**
 * 批量更新多个设置类型
 * 将多个设置更新合并为单个事务
 */
export async function updateMultipleSettingsAction(updates: {
  basic?: BasicSettingFormData;
  email?: EmailSettingsFormData;
  image?: ImageSettingsFormData;
  security?: SecuritySettingsFormData;
}): Promise<{
  success: boolean;
  results: Record<string, SuccessResponse<any> | ErrorResponse>;
  errors: string[];
}> {
  const results: Record<string, SuccessResponse<any> | ErrorResponse> = {};
  const errors: string[] = [];

  try {
    // 并行执行所有更新操作
    const updatePromises = [];

    if (updates.basic) {
      updatePromises.push(
        updateBasicSettingsAction(updates.basic).then((result) => ({
          type: "basic",
          result,
        }))
      );
    }

    if (updates.email) {
      updatePromises.push(
        updateEmailSettingsAction(updates.email).then((result) => ({
          type: "email",
          result,
        }))
      );
    }

    if (updates.image) {
      updatePromises.push(
        updateImageSettingsAction(updates.image).then((result) => ({
          type: "image",
          result,
        }))
      );
    }

    if (updates.security) {
      updatePromises.push(
        updateSecuritySettingsAction(updates.security).then((result) => ({
          type: "security",
          result,
        }))
      );
    }

    const responses = await Promise.allSettled(updatePromises);

    // 处理结果
    responses.forEach((response) => {
      if (response.status === "fulfilled") {
        const { type, result } = response.value;
        results[type] = result;

        // 检查是否有错误
        if ("error" in result) {
          errors.push(`${type}设置更新失败: ${result.message}`);
        }
      } else {
        errors.push(
          `设置更新发生异常: ${response.reason?.message || "未知错误"}`
        );
      }
    });

    return {
      success: errors.length === 0,
      results,
      errors,
    };
  } catch (error: any) {
    console.error("[Action Error] updateMultipleSettingsAction:", error);
    return {
      success: false,
      results,
      errors: [`批量更新失败: ${error.message || "未知错误"}`],
    };
  }
}

/**
 * 测试邮件配置
 * POST /api/v1/admin/settings/email/test
 */
export async function testEmailSettingsAction(
  emailData: EmailSettingsFormData,
  testRecipient: string
): Promise<SuccessResponse<any> | ErrorResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.post<SuccessResponse<any>>(
      `${SETTINGS_API_BASE}/email/test`,
      {
        ...emailData,
        testRecipient,
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "[Action Error] testEmailSettingsAction:",
      error.message,
      error
    );
    if (error instanceof AuthenticationError) {
      return {
        code: error.status,
        message: error.message,
        error: "AuthenticationError",
      };
    }
    return {
      code: error.code || 500,
      message: error.message || "邮件配置测试失败",
      error: error.data || error.message,
    };
  }
}
