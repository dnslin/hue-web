// lib/types/album.ts
// 相册相关类型定义，基于 swagger.yaml 规范

import type { BaseQueryParams } from './common';
import type { ImageResponse } from './image';

/**
 * 相册响应数据 - 对应后端 dtos.AlbumResponseDTO
 * 后端字段会通过 api-service.ts 自动转换为 camelCase
 */
export interface AlbumResponse {
  /** 相册唯一ID */
  id: number;
  /** 相册名称 */
  name: string;
  /** 相册描述（可选） */
  description?: string;
  /** 是否公开可访问 */
  isPublic: boolean;
  /** 封面图片ID（可选） */
  coverImageId?: number;
  /** 所属用户ID */
  userId: number;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}

/**
 * 创建相册输入 - 对应后端 services.CreateAlbumInput
 */
export interface CreateAlbumInput {
  /** 相册名称 */
  name: string;
  /** 相册描述（可选） */
  description?: string;
  /** 是否公开（默认false） */
  isPublic?: boolean;
  /** 封面图片ID（可选） */
  coverImageId?: number;
}

/**
 * 更新相册输入 - 对应后端 services.UpdateAlbumInput
 * 所有字段都是可选的，只更新提供的字段
 */
export interface UpdateAlbumInput {
  /** 相册名称（可选） */
  name?: string;
  /** 相册描述（可选） */
  description?: string;
  /** 是否公开（可选） */
  isPublic?: boolean;
  /** 封面图片ID（可选） */
  coverImageId?: number;
}

/**
 * 相册详细信息 - 扩展基础相册信息
 * 包含相册统计数据
 */
export interface AlbumDetail extends AlbumResponse {
  /** 相册中的图片总数 */
  imageCount?: number;
  /** 相册总大小（字节） */
  totalSize?: number;
  /** 最后更新图片的时间 */
  lastImageAt?: string;
  /** 封面图片信息（如果有） */
  coverImage?: ImageResponse;
}

/**
 * 相册查询参数 - 继承基础查询参数
 */
export interface AlbumQueryParams extends BaseQueryParams {
  /** 搜索关键词（可选） */
  search?: string;
  /** 是否只获取公开相册 */
  publicOnly?: boolean;
  /** 是否包含图片数量统计 */
  includeStats?: boolean;
}

/**
 * 相册中图片的查询参数
 */
export interface AlbumImageQueryParams extends BaseQueryParams {
  /** 搜索关键词（可选） */
  search?: string;
  /** 排序字段 */
  sortBy?: 'created_at' | 'updated_at' | 'filename' | 'size';
}

/**
 * 相册统计信息
 */
export interface AlbumStats {
  /** 总相册数 */
  totalAlbums: number;
  /** 公开相册数 */
  publicAlbums: number;
  /** 私有相册数 */
  privateAlbums: number;
  /** 包含图片的相册数 */
  albumsWithImages: number;
  /** 空相册数 */
  emptyAlbums: number;
}

/**
 * 相册排序选项
 */
export type AlbumSortBy = 'created_at' | 'updated_at' | 'name' | 'image_count' | 'last_image_at';

/**
 * 相册筛选条件
 */
export interface AlbumFilters {
  /** 搜索查询 */
  searchQuery?: string;
  /** 是否仅显示公开相册 */
  publicOnly?: boolean;
  /** 是否仅显示非空相册 */
  nonEmptyOnly?: boolean;
  /** 日期范围开始 */
  dateFrom?: string;
  /** 日期范围结束 */
  dateTo?: string;
}

/**
 * 相册批量操作类型
 */
export type BatchAlbumOperation = 
  | 'delete'
  | 'set_public'
  | 'set_private'
  | 'merge'
  | 'export';

/**
 * 批量操作参数
 */
export interface BatchAlbumOperationParams {
  /** 操作类型 */
  operation: BatchAlbumOperation;
  /** 相册ID列表 */
  albumIds: number[];
  /** 操作相关参数 */
  params?: {
    /** 目标相册ID（用于合并操作） */
    targetAlbumId?: number;
    /** 是否公开 */
    isPublic?: boolean;
    /** 导出格式（用于导出操作） */
    exportFormat?: 'zip' | 'tar';
  };
}

/**
 * 相册图片管理操作
 */
export interface AlbumImageOperation {
  /** 相册ID */
  albumId: number;
  /** 图片ID列表 */
  imageIds: number[];
  /** 操作类型 */
  operation: 'add' | 'remove' | 'move';
  /** 目标相册ID（用于移动操作） */
  targetAlbumId?: number;
}

/**
 * 相册创建表单数据
 */
export interface AlbumFormData {
  /** 相册名称 */
  name: string;
  /** 相册描述 */
  description: string;
  /** 是否公开 */
  isPublic: boolean;
}

/**
 * 相册导入选项
 */
export interface AlbumImportOptions {
  /** 导入源类型 */
  source: 'folder' | 'zip' | 'url';
  /** 源路径或URL */
  sourcePath: string;
  /** 是否保持文件夹结构 */
  preserveStructure: boolean;
  /** 是否覆盖同名文件 */
  overwriteExisting: boolean;
}

/**
 * 相册导出选项
 */
export interface AlbumExportOptions {
  /** 导出格式 */
  format: 'zip' | 'tar' | 'folder';
  /** 是否包含原始文件 */
  includeOriginals: boolean;
  /** 是否包含缩略图 */
  includeThumbnails: boolean;
  /** 是否包含元数据 */
  includeMetadata: boolean;
  /** 图片质量（用于JPEG压缩） */
  quality?: number;
}