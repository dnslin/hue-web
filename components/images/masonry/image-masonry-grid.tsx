'use client'

import { VirtuosoMasonry } from '@virtuoso.dev/masonry'
import { useCallback } from 'react'
import { imageDataStore } from '@/lib/store/image/data'
import { useStore } from 'zustand'
import { useResponsiveColumns } from '@/hooks/images/use-responsive-columns'
import { ImageCard } from './image-card'
import { ImageCardSkeleton } from './image-card-skeleton'
import { ImageResponse } from '@/lib/types/image'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

/**
 * 瀑布流图片网格组件
 * 基于 VirtuosoMasonry 实现高性能虚拟化瀑布流布局
 */
export function ImageMasonryGrid() {
  const { images, total, loading, error } = useStore(imageDataStore)
  const columnCount = useResponsiveColumns()

  // 渲染图片卡片项目 - ItemContent接收{ data }参数
  const ItemContent = useCallback(({ data }: { data: ImageResponse }) => (
    <ImageCard key={data.id} image={data} />
  ), [])

  // 加载状态
  if (loading && images.length === 0) {
    return <ImageCardSkeleton count={columnCount * 6} />
  }

  // 错误状态
  if (error && images.length === 0) {
    return (
      <Alert className="max-w-md mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  // 空状态
  if (!loading && images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
        <div className="text-muted-foreground text-lg">暂无图片</div>
        <p className="text-sm text-muted-foreground">
          您可以尝试调整筛选条件或上传新的图片
        </p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <VirtuosoMasonry
        columnCount={columnCount}
        data={images}
        useWindowScroll={true}
        initialItemCount={Math.min(50, images.length)}
        ItemContent={ItemContent}
        style={{ minHeight: '400px' }}
      />
      
      {/* 底部加载指示器 */}
      {loading && images.length > 0 && (
        <div className="flex justify-center py-8">
          <div className="text-sm text-muted-foreground">加载中...</div>
        </div>
      )}

      {/* 底部总数显示 */}
      {!loading && total > 0 && (
        <div className="flex justify-center py-4">
          <div className="text-sm text-muted-foreground">
            已显示 {images.length} / {total} 张图片
          </div>
        </div>
      )}
    </div>
  )
}