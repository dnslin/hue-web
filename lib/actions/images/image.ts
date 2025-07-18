"use server";

import { getAuthenticatedApiService } from "@/lib/api/api-service";
import { redirect } from "next/navigation";

/**
 * 获取图片数据（支持缩略图）
 * @param imageId 图片ID
 * @param thumb 是否获取缩略图
 * @returns 图片的Base64数据URL
 */
export async function getImageData(imageId: string, thumb: boolean = false): Promise<string | null> {
  try {
    const apiService = await getAuthenticatedApiService();
    const url = `/images/${imageId}/view`;
    
    const response = await apiService.get(url, {
      params: { thumb },
      responseType: 'arraybuffer'
    });

    // 获取响应头中的Content-Type
    const contentType = response.headers['content-type'] || 'image/jpeg';
    
    // 检查响应数据
    if (!response.data || response.data.byteLength === 0) {
      return null;
    }
    
    // 将ArrayBuffer转换为Base64
    const buffer = Buffer.from(response.data);
    const base64 = buffer.toString('base64');
    
    // 返回Data URL格式
    return `data:${contentType};base64,${base64}`;
  } catch (error: any) {
    // 如果是认证错误，重定向到登录页
    if (error?.code === 401) {
      redirect('/login');
    }
    
    return null;
  }
}