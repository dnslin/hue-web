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
    // 首次加载状态
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

    // 首次加载错误状态
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
    if (!loading && !error && images.length === 0) {
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

        {/* 分页加载错误提示 */}
        {error && images.length > 0 && !loading && (
          <div className="flex justify-center py-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md">
              <div className="flex items-center space-x-3">
                <div className="text-red-500">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-red-800">加载更多图片失败</p>
                  <p className="text-xs text-red-600 mt-1">{error}</p>
                </div>
                <button
                  onClick={handleRetry}
                  className="text-sm text-red-700 hover:text-red-900 font-medium"
                >
                  重试
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
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
      </PageContainer>

      {/* 图片预览弹窗 - 移到 PageContainer 外部 */}
      {isPreviewOpen && <ImageLightbox />}

      {/* 图片编辑器弹窗 - 移到 PageContainer 外部 */}
      {editingImage && (
        <ImageEditorModal 
          image={editingImage}
          isOpen={isEditorOpen}
          onClose={closeEditor}
        />
      )}
    </>
  )
}