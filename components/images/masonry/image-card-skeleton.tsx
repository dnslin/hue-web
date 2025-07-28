'use client'

import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * 图片卡片加载骨架屏组件
 * 在图片加载时显示占位效果
 */
interface ImageCardSkeletonProps {
  count?: number
}

export function ImageCardSkeleton({ count = 12 }: ImageCardSkeletonProps) {
  return (
    <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5 gap-4 space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="break-inside-avoid rounded-xl overflow-hidden">
          {/* 图片区域骨架屏 */}
          <Skeleton 
            className="w-full bg-muted/30" 
            style={{ 
              height: `${Math.floor(Math.random() * 200) + 200}px` 
            }} 
          />
          
          {/* 信息区域骨架屏 */}
          <div className="p-3 space-y-2">
            <Skeleton className="h-4 w-3/4 bg-muted/20" />
            <Skeleton className="h-3 w-1/2 bg-muted/20" />
          </div>
        </Card>
      ))}
    </div>
  )
}