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
  SettingsActionResponse,
} from "@/lib/types/settings";
import type {
  ApiResponse,
  SuccessApiResponse,
  ErrorApiResponse,
} from "@/lib/types/common";
import { cacheManager, CACHE_KEYS } from "@/lib/utils/cache-manager";

// 设置相关API路径
const SETTINGS_API_BASE = "/admin/settings";

/**
 * 获取所有设置数据
 */
export async function getSettingsAction(): Promise<
  AllSettingsData | ErrorApiResponse
> {
  try {
    const apiService = await getAuthenticatedApiService();

    // 并行获取所有设置类型
    const [basicResponse, emailResponse, imageResponse, securityResponse] =
      await Promise.allSettled([
        apiService.get<ApiResponse<BasicSiteSetting>>(
          `${SETTINGS_API_BASE}/basic`
        ),
        apiService.get<ApiResponse<EmailSettings>>(
          `${SETTINGS_API_BASE}/email`
        ),
        apiService.get<ApiResponse<ImageProcessingSetting>>(
          `${SETTINGS_API_BASE}/image`
        ),
        apiService.get<ApiResponse<SecuritySetting>>(
          `${SETTINGS_API_BASE}/security`
        ),
      ]);

    // 处理响应结果
    const settingsData: AllSettingsData = {
      basic:
        basicResponse.status === "fulfilled" &&
        basicResponse.value.data.code === 0
          ? basicResponse.value.data.data || null
          : null,
      email:
        emailResponse.status === "fulfilled" &&
        emailResponse.value.data.code === 0
          ? emailResponse.value.data.data || null
          : null,
      image:
        imageResponse.status === "fulfilled" &&
        imageResponse.value.data.code === 0
          ? imageResponse.value.data.data || null
          : null,
      security:
        securityResponse.status === "fulfilled" &&
        securityResponse.value.data.code === 0
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
    console.error("getSettingsAction 错误:", error.message);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        message: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      message: error.message || "获取设置失败",
      error,
    };
  }
}

/**
 * 获取特定类型的设置
 */
export async function getSettingByTypeAction(
  type: SettingType
): Promise<SuccessApiResponse<any> | ErrorApiResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const cacheKey = `${CACHE_KEYS.SETTINGS_BASE}:${type}`;

    const response = await cacheManager.getOrSet(
      cacheKey,
      async () => {
        const apiResponse = await apiService.get<ApiResponse<any>>(
          `${SETTINGS_API_BASE}/${type}`
        );
        return apiResponse.data;
      },
      { ttl: 5 * 60 * 1000, storage: "memory" }
    );

    const apiResponse = response as ApiResponse<any>;

    if (apiResponse.code === 0) {
      return {
        code: 0,
        message: apiResponse.message || `获取${type}设置成功`,
        data: apiResponse.data,
      };
    }

    return {
      code: apiResponse.code || 1,
      message: apiResponse.message || `获取${type}设置失败`,
      error: apiResponse,
    };
  } catch (error: any) {
    console.error(`getSettingByTypeAction(${type}) 错误:`, error.message);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        message: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      message: error.message || `获取${type}设置失败`,
      error,
    };
  }
}

/**
 * 更新基础设置
 */
export async function updateBasicSettingsAction(
  settingsData: BasicSettingFormData
): Promise<SettingsActionResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.put<ApiResponse<BasicSiteSetting>>(
      `${SETTINGS_API_BASE}/basic`,
      settingsData
    );

    const apiResponse = response.data;

    if (apiResponse.code === 0) {
      // 清除相关缓存
      cacheManager.delete(`${CACHE_KEYS.SETTINGS_BASE}:basic`);
      cacheManager.delete(CACHE_KEYS.SETTINGS_ALL);

      return {
        code: 0,
        message: apiResponse.message || "基础设置更新成功",
        data: apiResponse.data,
      };
    }

    return {
      code: apiResponse.code || 1,
      message: apiResponse.message || "基础设置更新失败",
      error: apiResponse,
    };
  } catch (error: any) {
    console.error("updateBasicSettingsAction 错误:", error.message);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        message: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      message: error.message || "更新基础设置失败",
      error,
    };
  }
}

/**
 * 更新邮件设置
 */
export async function updateEmailSettingsAction(
  settingsData: EmailSettingsFormData
): Promise<SettingsActionResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.put<ApiResponse<EmailSettings>>(
      `${SETTINGS_API_BASE}/email`,
      settingsData
    );

    const apiResponse = response.data;

    if (apiResponse.code === 0) {
      // 清除相关缓存
      cacheManager.delete(`${CACHE_KEYS.SETTINGS_BASE}:email`);
      cacheManager.delete(CACHE_KEYS.SETTINGS_ALL);

      return {
        code: 0,
        message: apiResponse.message || "邮件设置更新成功",
        data: apiResponse.data,
      };
    }

    return {
      code: apiResponse.code || 1,
      message: apiResponse.message || "邮件设置更新失败",
      error: apiResponse,
    };
  } catch (error: any) {
    console.error("updateEmailSettingsAction 错误:", error.message);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        message: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      message: error.message || "更新邮件设置失败",
      error,
    };
  }
}

/**
 * 更新图片设置
 */
export async function updateImageSettingsAction(
  settingsData: ImageSettingsFormData
): Promise<SettingsActionResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.put<ApiResponse<ImageProcessingSetting>>(
      `${SETTINGS_API_BASE}/image`,
      settingsData
    );

    const apiResponse = response.data;

    if (apiResponse.code === 0) {
      // 清除相关缓存
      cacheManager.delete(`${CACHE_KEYS.SETTINGS_BASE}:image`);
      cacheManager.delete(CACHE_KEYS.SETTINGS_ALL);

      return {
        code: 0,
        message: apiResponse.message || "图片设置更新成功",
        data: apiResponse.data,
      };
    }

    return {
      code: apiResponse.code || 1,
      message: apiResponse.message || "图片设置更新失败",
      error: apiResponse,
    };
  } catch (error: any) {
    console.error("updateImageSettingsAction 错误:", error.message);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        message: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      message: error.message || "更新图片设置失败",
      error,
    };
  }
}

/**
 * 更新安全设置
 */
export async function updateSecuritySettingsAction(
  settingsData: SecuritySettingsFormData
): Promise<SettingsActionResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.put<ApiResponse<SecuritySetting>>(
      `${SETTINGS_API_BASE}/security`,
      settingsData
    );

    const apiResponse = response.data;

    if (apiResponse.code === 0) {
      // 清除相关缓存
      cacheManager.delete(`${CACHE_KEYS.SETTINGS_BASE}:security`);
      cacheManager.delete(CACHE_KEYS.SETTINGS_ALL);

      return {
        code: 0,
        message: apiResponse.message || "安全设置更新成功",
        data: apiResponse.data,
      };
    }

    return {
      code: apiResponse.code || 1,
      message: apiResponse.message || "安全设置更新失败",
      error: apiResponse,
    };
  } catch (error: any) {
    console.error("updateSecuritySettingsAction 错误:", error.message);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        message: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      message: error.message || "更新安全设置失败",
      error,
    };
  }
}

/**
 * 批量更新多个设置类型
 */
export async function updateMultipleSettingsAction(updates: {
  basic?: BasicSettingFormData;
  email?: EmailSettingsFormData;
  image?: ImageSettingsFormData;
  security?: SecuritySettingsFormData;
}): Promise<{
  success: boolean;
  results: Record<string, SettingsActionResponse>;
  errors: string[];
}> {
  const results: Record<string, SettingsActionResponse> = {};
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
 */
export async function testEmailSettingsAction(
  emailData: EmailSettingsFormData,
  testRecipient: string
): Promise<SettingsActionResponse> {
  try {
    const apiService = await getAuthenticatedApiService();
    const response = await apiService.post<ApiResponse<any>>(
      `${SETTINGS_API_BASE}/email/test`,
      {
        ...emailData,
        testRecipient,
      }
    );

    const apiResponse = response.data;

    if (apiResponse.code === 0) {
      return {
        code: 0,
        message: apiResponse.message || "邮件配置测试成功",
        data: apiResponse.data,
      };
    }

    return {
      code: apiResponse.code || 1,
      message: apiResponse.message || "邮件配置测试失败",
      error: apiResponse,
    };
  } catch (error: any) {
    console.error("testEmailSettingsAction 错误:", error.message);

    if (error instanceof AuthenticationError) {
      return {
        code: 401,
        message: "认证失败，请重新登录",
        error: error,
      };
    }

    return {
      code: error.code || 500,
      message: error.message || "邮件配置测试失败",
      error,
    };
  }
}
