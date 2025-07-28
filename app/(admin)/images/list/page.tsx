'use client'

import { useEffect, useState } from 'react'
import { imageDataStore } from '@/lib/store/image/data'
import { imageBatchStore } from '@/lib/store/image/batch'
import { useImageFilterStore } from '@/lib/store/image/filter'
import { useImageModalStore } from '@/hooks/images/use-image-modal'
import { useStore } from 'zustand'
import { ImageMasonryGrid } from '@/components/images/masonry/image-masonry-grid'
import { ImageFilterToolbar } from '@/components/images/toolbar/image-filter-toolbar'
import { BatchOperationBar } from '@/components/images/toolbar/batch-operation-bar'
import { ImageLightbox } from '@/components/images/preview/image-lightbox'
import { ImageEditorModal } from '@/components/images/preview/image-editor-modal'
import { ImageLoadingSpinner } from '@/components/images/shared/image-loading-spinner'
import { ImageErrorFallback } from '@/components/images/shared/image-error-fallback'
import { ImagePlaceholder } from '@/components/images/shared/image-placeholder'
import { PageContainer } from '@/components/layouts/page-container'
import { Card } from '@/components/ui/card'

/**
 * 图片列表页面
 * 基于瀑布流布局展示图片，支持筛选、批量操作、预览和编辑功能
 */
export default function ImageListPage() {
  // 视图状态
  const [viewMode, setViewMode] = useState<'masonry' | 'grid' | 'list'>('masonry')
  const [columnCount, setColumnCount] = useState(4)

  // 使用图片数据存储
  const { images, loading, error, total, initialize, refreshImages } = useStore(imageDataStore)
  
  // 使用批量操作存储
  const { isSelectionMode } = useStore(imageBatchStore)

  // 使用筛选存储
  const { pagination, setPagination } = useImageFilterStore()
  
  // 使用模态框状态
  const { 
    isPreviewOpen,
    isEditorOpen,
    editingImage,
    previewImages,
    closePreview,
    closeEditor 
  } = useImageModalStore()

  // 页面初始化时初始化数据存储
  useEffect(() => {
    initialize()
  }, [initialize])

  // 处理页面大小变化
  const handlePageSizeChange = (pageSize: number) => {
    setPagination({ pageSize })
  }

  // 处理重试
  const handleRetry = () => {
    refreshImages()
  }

  // 渲染内容区域
  const renderContent = () => {
    // 加载状态
    if (loading && images.length === 0) {
      return (
        <div className="flex justify-center items-center py-20">
          <ImageLoadingSpinner 
            size="lg" 
            text="正在加载图片..." 
          />
        </div>
      )
    }

    // 错误状态
    if (error && images.length === 0) {
      return (
        <div className="flex justify-center items-center py-20">
          <ImageErrorFallback
            error={error}
            type="network"
            onRetry={handleRetry}
            variant="detailed"
          />
        </div>
      )
    }

    // 空状态
    if (!loading && images.length === 0) {
      return (
        <div className="flex justify-center items-center py-20">
          <ImagePlaceholder
            type="empty"
            text="暂无图片"
            subtext="还没有上传任何图片，点击上传开始使用吧"
            size="lg"
          />
        </div>
      )
    }

    // 正常状态 - 显示图片网格
    return (
      <div className="relative">
        <ImageMasonryGrid />
        
        {/* 底部加载更多指示器 */}
        {loading && images.length > 0 && (
          <div className="flex justify-center py-8">
            <ImageLoadingSpinner 
              size="md" 
              text="加载更多图片..." 
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <PageContainer 
      title="图片管理" 
      description={`管理和浏览您的图片库 • 共 ${total} 张图片`}
    >
      <div className="space-y-6">
        {/* 筛选和搜索工具栏（包含视图控制） */}
        <Card className="p-4">
          <ImageFilterToolbar 
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            columnCount={columnCount}
            onColumnCountChange={setColumnCount}
            pageSize={pagination.pageSize}
            onPageSizeChange={handlePageSizeChange}
          />
        </Card>

        {/* 批量操作工具栏 */}
        {isSelectionMode && <BatchOperationBar />}

        {/* 图片内容区域 */}
        <div className="min-h-[500px]">
          {renderContent()}
        </div>
      </div>

      {/* 图片预览弹窗 */}
      {isPreviewOpen && <ImageLightbox />}

      {/* 图片编辑器弹窗 */}
      {editingImage && (
        <ImageEditorModal 
          image={editingImage}
          isOpen={isEditorOpen}
          onClose={closeEditor}
        />
      )}
    </PageContainer>
  )
}