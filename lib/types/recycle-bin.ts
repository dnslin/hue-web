// lib/types/recycle-bin.ts
// 回收站功能相关类型定义 - 基于 swagger.yaml 规范

import type { ImageResponse } from './image';

/**
 * 回收站图片信息 - 扩展自 ImageResponse
 */
export interface RecycleBinImage extends ImageResponse {
  deletedAt: string;
  daysRemaining: number; // 距离永久删除还有多少天
  originalAlbumId?: number; // 删除前所在的相册ID
  originalAlbumName?: string; // 删除前所在的相册名称
}

/**
 * 回收站列表查询参数
 */
export interface RecycleBinListParams {
  page?: number;
  pageSize?: number;
  sortBy?: 'deleted_at' | 'created_at' | 'filename' | 'size';
  order?: 'asc' | 'desc';
  keyword?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

/**
 * 回收站图片恢复参数
 */
export interface RecycleBinRestoreParams {
  id: number;
  albumId?: number; // 恢复到指定相册，不指定则恢复到原相册或无相册状态
}

/**
 * 回收站图片永久删除参数
 */
export interface RecycleBinPurgeParams {
  id: number;
}

/**
 * 批量回收站操作参数
 */
export interface BatchRecycleBinParams {
  imageIds: number[];
  action: 'restore' | 'purge';
  albumId?: number; // 批量恢复时的目标相册
}

/**
 * 回收站统计信息
 */
export interface RecycleBinStats {
  totalCount: number;
  totalSize: number;
  oldestDeletedAt?: string;
  newestDeletedAt?: string;
  autoDeleteDays: number; // 多少天后自动永久删除
  itemsToBeDeleted: number; // 即将被自动删除的项目数量
  sizeToBeDeleted: number; // 即将被自动删除的文件总大小
}

/**
 * 回收站清空操作参数
 */
export interface RecycleBinClearParams {
  olderThanDays?: number; // 清空指定天数之前的项目
  confirmMessage: string; // 确认消息，防止误操作
}

/**
 * 回收站过滤条件
 */
export interface RecycleBinFilters {
  keyword?: string;
  minSize?: number;
  maxSize?: number;
  mimeTypes?: string[];
  deletedDateRange?: {
    start: string;
    end: string;
  };
  daysRemainingRange?: {
    min: number;
    max: number;
  };
}

/**
 * 回收站排序字段类型
 */
export type RecycleBinSortField = 'deleted_at' | 'created_at' | 'filename' | 'size' | 'days_remaining';