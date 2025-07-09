# 存储空间清理功能开发计划

## 项目概述

为 Lsky Pro 图片托管系统集成三个新的存储清理接口，提供完整的存储空间清理和统计数据校准功能。

## 新增接口说明

基于 swagger.yaml 文档，后端新增了以下三个接口：

### 1. 预览指定存储中的孤立文件
- **接口**: `GET /admin/storage/{id}/orphaned-files`
- **描述**: (Dry Run) 扫描存储空间，找出在物理上存在但在数据库中没有记录的文件
- **响应**: `dtos.OrphanedFileResultDTO`

### 2. 清理指定存储中的孤立文件
- **接口**: `DELETE /admin/storage/{id}/orphaned-files`
- **描述**: 扫描并删除在物理上存在但在数据库中没有记录的文件
- **响应**: `dtos.OrphanedFileResultDTO`

### 3. 手动校准存储策略统计数据
- **接口**: `POST /admin/storage/{id}/recalculate`
- **描述**: 管理员手动触发对指定存储策略的用量和文件数进行重新计算
- **响应**: `dtos.StorageStrategyDTO`

## 技术架构设计

### 1. 类型定义扩展 (lib/types/storage.ts)

基于 swagger 中的 `dtos.OrphanedFileResultDTO`，新增以下类型：

```typescript
// 孤立文件操作结果
interface OrphanedFileResult {
  dryRun: boolean;
  scannedFiles: number;
  orphanedFiles: string[];
  cleanedCount: number;
  failedToDelete: string[];
  message: string;
}

// 存储清理参数
interface StorageCleanupParams {
  storageId: number;
  dryRun?: boolean;
}

// 存储校准结果
interface StorageRecalculateResult {
  success: boolean;
  message: string;
  updatedStrategy: StorageStrategy;
}
```

### 2. Server Actions 实现 (lib/actions/storage/storage.ts)

新增三个服务端函数：

```typescript
// 预览孤立文件
export async function previewOrphanedFilesAction(
  id: number
): Promise<SuccessApiResponse<OrphanedFileResult> | ErrorApiResponse>

// 清理孤立文件
export async function cleanOrphanedFilesAction(
  id: number
): Promise<SuccessApiResponse<OrphanedFileResult> | ErrorApiResponse>

// 手动校准统计
export async function recalculateStorageStatsAction(
  id: number
): Promise<SuccessApiResponse<StorageStrategy> | ErrorApiResponse>
```

### 3. Store 状态管理扩展 (lib/store/storage.ts)

在现有的 storage store 中新增状态和方法：

```typescript
interface StorageStrategyStoreState {
  // 新增状态
  isCleaningOrphaned: boolean;
  isRecalculating: boolean;
  orphanedResult: OrphanedFileResult | null;
  cleanupError: string | null;
  
  // 新增方法
  previewOrphanedFiles: (id: number) => Promise<OrphanedFileResult | null>;
  cleanOrphanedFiles: (id: number) => Promise<OrphanedFileResult | null>;
  recalculateStorageStats: (id: number) => Promise<StorageStrategy | null>;
  clearOrphanedResult: () => void;
  clearCleanupError: () => void;
}
```

### 4. UI 组件设计

#### 4.1 存储清理对话框 (components/admin/storage/cleanup-dialog.tsx)

**功能特性:**
- 两步式操作：预览扫描 → 确认清理
- 实时显示扫描进度和结果
- 孤立文件列表展示
- 清理进度指示器
- 操作结果详情显示

**界面设计:**
- 使用 Magic UI 的动画效果
- 响应式布局适配移动端
- 危险操作的二次确认
- 清晰的状态指示

**交互流程:**
1. 点击"空间清理"按钮
2. 打开对话框，自动执行预览扫描
3. 显示孤立文件列表和统计信息
4. 用户确认后执行实际清理
5. 显示清理结果和详细报告

#### 4.2 统计校准对话框 (components/admin/storage/recalculate-dialog.tsx)

**功能特性:**
- 一键校准存储统计数据
- 校准前后数据对比
- 进度指示和状态反馈
- 自动刷新页面数据

**界面设计:**
- 简洁的确认界面
- 校准进度动画
- 结果对比表格
- 成功状态指示

### 5. 页面集成方案 (app/(admin)/storage/page.tsx)

#### 5.1 功能集成
- 在每个存储策略卡片中新增"清理"和"校准"按钮
- 集成清理和校准对话框组件
- 支持批量清理操作
- 操作完成后自动刷新数据

#### 5.2 用户界面更新
- 在存储策略操作区域添加新按钮
- 移动端优化的操作布局
- 批量操作支持多选清理
- 操作状态的视觉反馈

#### 5.3 权限和安全
- 管理员权限验证
- 危险操作二次确认
- 操作审计日志记录
- 错误处理和回滚机制

## UI/UX 设计规范

### 1. 设计原则
遵循 CLAUDE.md 中定义的设计系统：

- **颜色系统**: 使用 OKLCH 颜色空间
- **圆角规范**: 基础圆角 10px (--radius)
- **动画库**: Motion 库实现流畅动效
- **响应式**: 移动优先设计策略
- **触摸目标**: 最小 44x44px 触摸区域

### 2. 视觉主题
- **清理操作**: 橙色主题 (#F59E0B) - 警告性操作
- **校准操作**: 紫色主题 (#8B5CF6) - 管理性操作
- **危险操作**: 红色主题 - 删除确认
- **成功状态**: 绿色主题 - 操作完成

### 3. 动画效果
- **按钮交互**: 0.15s 快速响应
- **对话框**: 0.2s 渐入渐出
- **进度指示**: 流畅的加载动画
- **状态切换**: 0.3s 平滑过渡

### 4. 移动端适配
- **对话框**: 移动端全屏显示
- **按钮尺寸**: 触摸友好的大小
- **滚动优化**: iOS 安全区域适配
- **手势支持**: 滑动和触摸反馈

## 错误处理策略

### 1. 网络错误
- 连接超时的友好提示
- 网络中断的重试机制
- 请求失败的错误信息展示

### 2. 权限错误
- 权限不足的明确提示
- 登录过期的重新认证引导
- 操作限制的说明文字

### 3. 业务错误
- 清理失败的详细原因
- 文件锁定的处理建议
- 存储空间不足的警告

### 4. 用户体验
- Loading 状态的骨架屏
- 操作进度的实时更新
- 成功/失败的 Toast 通知
- 错误恢复的操作建议

## 测试计划

### 1. 单元测试
- API 调用函数测试
- Store 状态管理测试
- 组件渲染测试
- 用户交互测试

### 2. 集成测试
- 完整的清理流程测试
- 错误场景的处理测试
- 权限验证测试
- 移动端兼容性测试

### 3. 用户体验测试
- 操作流程的易用性
- 错误提示的清晰度
- 响应时间的可接受性
- 移动端的触摸体验

## 部署和维护

### 1. 版本兼容性
- 后端接口版本检查
- 前端代码向下兼容
- 渐进式功能发布

### 2. 监控和日志
- 清理操作的监控指标
- 错误率和成功率统计
- 用户操作行为分析

### 3. 文档维护
- API 接口文档更新
- 用户操作指南
- 故障排查手册

## 开发时间线

### 第一阶段 (1-2天)
- [x] 创建开发计划文档
- [ ] 扩展类型定义
- [ ] 实现 Server Actions
- [ ] 扩展 Store 状态管理

### 第二阶段 (2-3天)
- [ ] 开发清理对话框组件
- [ ] 开发校准对话框组件
- [ ] 集成到存储管理页面

### 第三阶段 (1-2天)
- [ ] 移动端适配优化
- [ ] 错误处理完善
- [ ] 用户体验测试

### 第四阶段 (1天)
- [ ] 代码审查和优化
- [ ] 文档完善
- [ ] 部署准备

## 总结

这个存储清理功能将为 Lsky Pro 管理员提供强大的存储维护工具，帮助清理无用文件和校准统计数据，提升系统的可维护性和存储效率。通过遵循项目的设计规范和技术架构，确保新功能与现有系统的完美集成。