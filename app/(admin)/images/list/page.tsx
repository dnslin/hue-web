'use client'

import { useEffect } from 'react'
import { imageDataStore } from '@/lib/store/image/data'
import { useImageModalStore } from '@/hooks/images/use-image-modal'
import { useStore } from 'zustand'
import { ImageMasonryGrid } from '@/components/images/masonry/image-masonry-grid'
import { ImageFilterToolbar } from '@/components/images/toolbar/image-filter-toolbar'
import { BatchOperationBar } from '@/components/images/toolbar/batch-operation-bar'
import { ImageLightbox } from '@/components/images/preview/image-lightbox'
import { ImageEditorModal } from '@/components/images/preview/image-editor-modal'
import { PageContainer } from '@/components/layouts/page-container'
import { Card } from '@/components/ui/card'

/**
 * 图片列表页面
 * 基于瀑布流布局展示图片，支持筛选、批量操作、预览和编辑功能
 */
export default function ImageListPage() {
  // 使用图片数据存储
  const { initialize } = useStore(imageDataStore)
  
  // 使用模态框状态
  const { 
    isPreviewOpen,
    currentPreviewIndex,
    isEditorOpen,
    editingImage,
    closePreview,
    closeEditor 
  } = useImageModalStore()

  // 页面初始化时初始化数据存储
  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <PageContainer 
      title="图片管理" 
      description="管理和浏览您的图片库"
    >
      <div className="space-y-6">
        {/* 筛选和搜索工具栏 */}
        <Card className="p-4">
          <ImageFilterToolbar />
        </Card>

        {/* 批量操作工具栏 */}
        <BatchOperationBar />

        {/* 瀑布流图片网格 */}
        <div className="min-h-screen">
          <ImageMasonryGrid />
        </div>
      </div>

      {/* 图片预览弹窗 */}
      <ImageLightbox 
        isOpen={isPreviewOpen}
        onClose={closePreview}
        initialIndex={currentPreviewIndex}
      />

      {/* 图片编辑器弹窗 */}
      <ImageEditorModal 
        image={editingImage}
        isOpen={isEditorOpen}
        onClose={closeEditor}
      />
    </PageContainer>
  )
}