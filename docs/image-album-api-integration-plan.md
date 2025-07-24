# 图片和相册 API 集成开发计划

> 基于 swagger.yaml 规范的完整前端 API 集成实施方案

## 1. 架构分析总结

### 现有架构特点

基于对现有代码架构的分析，确定了以下关键特性：

1. **API 服务层**：
   - 统一的 axios 客户端 (`lib/api/api-service.ts`)
   - 自动的 camelCase ↔ snake_case 转换
   - 完善的认证和错误处理机制

2. **认证机制**：
   - 基于 HTTP-only cookies 的 JWT 认证
   - 自动认证失效处理和重定向

3. **状态管理**：
   - Zustand store 架构，模块化管理
   - 持有化状态和缓存层设计

4. **表单验证**：
   - Zod schema 驱动的类型安全验证
   - 统一的表单处理模式

5. **组件系统**：
   - shadcn/ui + Magic UI + Aceternity UI 多层设计系统
   - 现有 AuthenticatedImage 组件可扩展

### API 端点分析

基于 `swagger.yaml` 文档分析，需要集成的核心接口：

#### 图片管理接口
- `GET /images` - 列出当前用户图片（支持分页和相册筛选）
- `POST /images` - 批量上传图片文件（支持多文件上传）
- `GET /images/{id}` - 获取图片基础元数据
- `DELETE /images/{id}` - 删除图片（需要权限验证）
- `GET /images/{id}/detail` - 获取图片完整元数据（包含 EXIF）
- `GET /images/{id}/view` - 获取图片文件内容（私有图片需权限验证）

#### 相册管理接口
- `GET /albums` - 获取当前用户所有相册
- `POST /albums` - 创建新相册
- `GET /albums/{id}` - 获取单个相册信息
- `PUT /albums/{id}` - 更新相册信息
- `DELETE /albums/{id}` - 删除相册
- `GET /albums/{id}/images` - 获取相册下的图片列表

#### 分享功能接口
- `POST /shares` - 为图片或相册创建分享链接
- `GET /shares/{token}` - 通过分享链接访问内容
- `DELETE /shares/{token}` - 删除分享链接

#### 回收站接口
- `GET /recycle-bin` - 获取回收站中的项目列表
- `POST /recycle-bin/restore/{id}` - 从回收站恢复图片
- `DELETE /recycle-bin/purge/{id}` - 永久删除图片

## 2. 实施计划

### 第一阶段：类型定义和 Schema 创建

#### 1.1 图片相关类型定义 (`lib/types/image.ts`)

基于 swagger.yaml 中的数据结构定义：

```typescript
// 基于 dtos.ImageResponseDTO
export interface ImageResponse {
  id: number;
  filename: string;
  url: string;
  width: number;
  height: number;
  size: number;
  mimeType: string;
  isPublic: boolean;
  albumId?: number;
  userId: number;
  storageStrategyId: number;
  moderationStatus: number;
  createdAt: string;
  updatedAt: string;
}

// 基于 dtos.ImageDetailDTO
export interface ImageDetail extends ImageResponse {
  exif?: ExifInfo;
}

// 基于 dtos.ExifInfoDTO
export interface ExifInfo {
  make?: string;
  cameraModel?: string;
  lens?: string;
  dateTimeOriginal?: string;
  exposureTime?: string;
  fNumber?: number;
  isoSpeedRatings?: number;
  focalLength?: number;
  flash?: number;
  filmMode?: string;
  latitude?: number;
  longitude?: number;
  altitude?: number;
}

// 基于 dtos.BatchUploadResponseDTO
export interface BatchUploadResponse {
  totalFiles: number;
  successCount: number;
  failureCount: number;
  successFiles: UploadResponse[];
  failureFiles: UploadFailure[];
}

// 基于 dtos.UploadResponseDTO
export interface UploadResponse {
  id: number;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  thumbnailUrl?: string;
}

// 基于 dtos.UploadFailureDTO
export interface UploadFailure {
  filename: string;
  error: string;
}
```

#### 1.2 相册相关类型定义 (`lib/types/album.ts`)

```typescript
// 基于 dtos.AlbumResponseDTO
export interface AlbumResponse {
  id: number;
  name: string;
  description?: string;
  isPublic: boolean;
  coverImageId?: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

// 基于 services.CreateAlbumInput
export interface CreateAlbumInput {
  name: string;
  description?: string;
  isPublic?: boolean;
  coverImageId?: number;
}

// 基于 services.UpdateAlbumInput
export interface UpdateAlbumInput {
  name?: string;
  description?: string;
  isPublic?: boolean;
  coverImageId?: number;
}
```

#### 1.3 分享相关类型定义 (`lib/types/share.ts`)

```typescript
// 基于 dtos.ShareResponseDTO
export interface ShareResponse {
  id: number;
  token: string;
  type: 'image' | 'album';
  resourceId: number;
  createdById: number;
  expireAt?: string;
  viewCount: number;
  createdAt: string;
}

// 基于 dtos.CreateShareLinkRequest
export interface CreateShareLinkRequest {
  type: 'image' | 'album';
  resourceId: number;
  expireDays?: number;
}
```

#### 1.4 Zod Schema 创建

**图片 Schema** (`lib/schema/images/image.ts`):
```typescript
import { z } from 'zod';

export const uploadImageSchema = z.object({
  files: z.array(z.instanceof(File)),
  albumId: z.number().optional(),
  storageStrategyId: z.number().optional(),
});

export const imageQuerySchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20),
  albumId: z.string().optional(),
});
```

**相册 Schema** (`lib/schema/albums/album.ts`):
```typescript
export const createAlbumSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1024).optional(),
  isPublic: z.boolean().default(false),
  coverImageId: z.number().optional(),
});

export const updateAlbumSchema = createAlbumSchema.partial();
```

### 第二阶段：Server Actions 开发

#### 2.1 扩展图片 Actions (`lib/actions/images/image.ts`)

在现有基础上扩展：

```typescript
// 获取图片列表
export async function getImagesList(params: ImageQueryParams): Promise<PaginatedApiResponse<ImageResponse>> {
  const apiService = await getAuthenticatedApiService();
  const response = await apiService.get('/images', { params });
  return response.data;
}

// 批量上传图片
export async function uploadImages(formData: FormData): Promise<BatchUploadResponse> {
  const apiService = await getAuthenticatedApiService();
  const response = await apiService.post('/images', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data.data;
}

// 获取图片详细信息
export async function getImageDetail(id: string): Promise<ImageDetail> {
  const apiService = await getAuthenticatedApiService();
  const response = await apiService.get(`/images/${id}/detail`);
  return response.data.data;
}

// 删除图片
export async function deleteImage(id: string): Promise<void> {
  const apiService = await getAuthenticatedApiService();
  await apiService.delete(`/images/${id}`);
}
```

#### 2.2 创建相册 Actions (`lib/actions/albums/album.ts`)

```typescript
// 获取相册列表
export async function getAlbumsList(): Promise<AlbumResponse[]> {
  const apiService = await getAuthenticatedApiService();
  const response = await apiService.get('/albums');
  return response.data.data;
}

// 创建相册
export async function createAlbum(data: CreateAlbumInput): Promise<AlbumResponse> {
  const apiService = await getAuthenticatedApiService();
  const response = await apiService.post('/albums', data);
  return response.data.data;
}

// 获取单个相册
export async function getAlbum(id: number): Promise<AlbumResponse> {
  const apiService = await getAuthenticatedApiService();
  const response = await apiService.get(`/albums/${id}`);
  return response.data.data;
}

// 更新相册
export async function updateAlbum(id: number, data: UpdateAlbumInput): Promise<AlbumResponse> {
  const apiService = await getAuthenticatedApiService();
  const response = await apiService.put(`/albums/${id}`, data);
  return response.data.data;
}

// 删除相册
export async function deleteAlbum(id: number): Promise<void> {
  const apiService = await getAuthenticatedApiService();
  await apiService.delete(`/albums/${id}`);
}

// 获取相册中的图片
export async function getAlbumImages(id: number, params: ImageQueryParams): Promise<PaginatedApiResponse<ImageResponse>> {
  const apiService = await getAuthenticatedApiService();
  const response = await apiService.get(`/albums/${id}/images`, { params });
  return response.data;
}
```

#### 2.3 创建分享 Actions (`lib/actions/shares/share.ts`)

```typescript
// 创建分享链接
export async function createShareLink(data: CreateShareLinkRequest): Promise<ShareResponse> {
  const apiService = await getAuthenticatedApiService();
  const response = await apiService.post('/shares', data);
  return response.data.data;
}

// 获取分享内容
export async function getShareContent(token: string): Promise<any> {
  const apiService = await getAuthenticatedApiService();
  const response = await apiService.get(`/shares/${token}`);
  return response.data.data;
}

// 删除分享链接
export async function deleteShareLink(token: string): Promise<void> {
  const apiService = await getAuthenticatedApiService();
  await apiService.delete(`/shares/${token}`);
}
```

#### 2.4 创建回收站 Actions (`lib/actions/recycle/recycle.ts`)

```typescript
// 获取回收站项目
export async function getRecycleBinItems(params: BaseQueryParams): Promise<PaginatedApiResponse<ImageResponse>> {
  const apiService = await getAuthenticatedApiService();
  const response = await apiService.get('/recycle-bin', { params });
  return response.data;
}

// 恢复图片
export async function restoreImage(id: number): Promise<void> {
  const apiService = await getAuthenticatedApiService();
  await apiService.post(`/recycle-bin/restore/${id}`);
}

// 永久删除图片
export async function purgeImage(id: number): Promise<void> {
  const apiService = await getAuthenticatedApiService();
  await apiService.delete(`/recycle-bin/purge/${id}`);
}
```

### 第三阶段：状态管理 Store

#### 3.1 图片状态管理 (`lib/store/images/`)

**数据层** (`data.ts`):
```typescript
export interface ImageDataState {
  images: ImageResponse[];
  currentImage: ImageDetail | null;
  pagination: PaginationMeta | null;
  // 数据操作方法
  setImages: (images: ImageResponse[]) => void;
  addImages: (images: ImageResponse[]) => void;
  removeImage: (id: number) => void;
  updateImage: (id: number, updates: Partial<ImageResponse>) => void;
  setCurrentImage: (image: ImageDetail | null) => void;
  setPagination: (pagination: PaginationMeta) => void;
}
```

**过滤层** (`filter.ts`):
```typescript
export interface ImageFilterState {
  albumId?: number;
  searchQuery: string;
  sortBy: string;
  order: SortOrder;
  page: number;
  pageSize: number;
  // 过滤操作方法
  setAlbumFilter: (albumId?: number) => void;
  setSearchQuery: (query: string) => void;
  setSorting: (sortBy: string, order: SortOrder) => void;
  setPage: (page: number) => void;
  resetFilters: () => void;
}
```

**缓存层** (`cache.ts`):
```typescript
export interface ImageCacheState {
  imageDetailsCache: Map<number, ImageDetail>;
  thumbnailCache: Map<number, string>;
  lastFetchTime: number;
  // 缓存操作方法
  cacheImageDetail: (id: number, detail: ImageDetail) => void;
  getCachedImageDetail: (id: number) => ImageDetail | null;
  cacheThumbnail: (id: number, dataUrl: string) => void;
  getCachedThumbnail: (id: number) => string | null;
  clearCache: () => void;
  isStale: () => boolean;
}
```

**上传状态** (`upload.ts`):
```typescript
export interface ImageUploadState {
  uploadQueue: UploadTask[];
  isUploading: boolean;
  totalProgress: number;
  // 上传操作方法
  addToQueue: (files: File[], albumId?: number) => void;
  removeFromQueue: (taskId: string) => void;
  startUpload: () => Promise<void>;
  pauseUpload: () => void;
  clearQueue: () => void;
}

interface UploadTask {
  id: string;
  file: File;
  albumId?: number;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}
```

**选择状态** (`selection.ts`):
```typescript
export interface ImageSelectionState {
  selectedImages: Set<number>;
  isSelectionMode: boolean;
  // 选择操作方法
  toggleSelection: (id: number) => void;
  selectAll: () => void;
  clearSelection: () => void;
  toggleSelectionMode: () => void;
  batchDelete: () => Promise<void>;
  batchMoveToAlbum: (albumId: number) => Promise<void>;
}
```

**主 Store** (`index.ts`):
```typescript
export interface ImageStore extends 
  ImageDataState,
  ImageFilterState, 
  ImageCacheState,
  ImageUploadState,
  ImageSelectionState {
  // 组合操作方法
  fetchImages: () => Promise<void>;
  fetchImageDetail: (id: number) => Promise<ImageDetail>;
  uploadImages: (files: File[], albumId?: number) => Promise<BatchUploadResponse>;
  deleteImage: (id: number) => Promise<void>;
  refetch: () => Promise<void>;
}
```

#### 3.2 相册状态管理 (`lib/store/albums/`)

**数据层** (`data.ts`):
```typescript
export interface AlbumDataState {
  albums: AlbumResponse[];
  currentAlbum: AlbumResponse | null;
  albumImages: Map<number, ImageResponse[]>;
  // 数据操作方法
  setAlbums: (albums: AlbumResponse[]) => void;
  addAlbum: (album: AlbumResponse) => void;
  removeAlbum: (id: number) => void;
  updateAlbum: (id: number, updates: Partial<AlbumResponse>) => void;
  setCurrentAlbum: (album: AlbumResponse | null) => void;
  setAlbumImages: (albumId: number, images: ImageResponse[]) => void;
}
```

**主 Store** (`index.ts`):
```typescript
export interface AlbumStore extends AlbumDataState {
  // 操作方法
  fetchAlbums: () => Promise<void>;
  createAlbum: (data: CreateAlbumInput) => Promise<AlbumResponse>;
  updateAlbum: (id: number, data: UpdateAlbumInput) => Promise<AlbumResponse>;
  deleteAlbum: (id: number) => Promise<void>;
  fetchAlbumImages: (id: number) => Promise<void>;
}
```

#### 3.3 分享状态管理 (`lib/store/shares/`)

```typescript
export interface ShareStore {
  shares: ShareResponse[];
  // 操作方法
  fetchShares: () => Promise<void>;
  createShare: (data: CreateShareLinkRequest) => Promise<ShareResponse>;
  deleteShare: (token: string) => Promise<void>;
}
```

## 3. 技术实施要点

### 3.1 设计系统整合
- 使用 Magic UI 的动画组件增强用户体验
- 遵循现有的 OKLCH 色彩系统和 10px 圆角设计
- 响应式设计，优先考虑移动端体验

### 3.2 性能优化
- 图片懒加载和缩略图支持
- 虚拟化长列表（大量图片时）
- 智能缓存策略优化
- 上传队列和进度管理

### 3.3 用户体验
- 流畅的拖拽上传交互
- 实时上传进度显示
- 友好的错误处理和重试机制
- 无缝的加载状态管理

### 3.4 类型安全
- 严格遵循 swagger.yaml 中定义的接口规范
- 完整的 TypeScript 类型定义
- Zod schema 验证确保数据一致性

### 3.5 错误处理
- 利用现有的 api-service.ts 错误处理机制
- 统一的错误消息和用户反馈
- 网络错误重试机制

## 4. 实施时间表

### 第一周：基础架构
- [ ] 完成所有类型定义
- [ ] 创建 Zod schemas
- [ ] 设置基础测试环境

### 第二周：核心功能
- [ ] 实现所有 Server Actions
- [ ] 完成图片和相册的基础 Store
- [ ] 集成现有的 AuthenticatedImage 组件

### 第三周：高级功能
- [ ] 实现上传队列和进度管理
- [ ] 完成批量操作功能
- [ ] 实现分享功能

### 第四周：优化和测试
- [ ] 性能优化和缓存策略
- [ ] 错误处理完善
- [ ] 端到端测试

## 5. 质量保证

### 5.1 类型安全
- 所有 API 接口都有对应的 TypeScript 类型
- 使用 Zod 进行运行时类型验证
- 严格的 TSConfig 配置

### 5.2 错误处理
- 网络错误自动重试
- 用户友好的错误消息
- 错误边界组件保护

### 5.3 性能监控
- 图片加载性能监控
- 上传进度追踪
- 缓存命中率统计

这个开发计划将确保图片和相册管理系统的前端 API 集成具有完整性、类型安全性和良好的用户体验。