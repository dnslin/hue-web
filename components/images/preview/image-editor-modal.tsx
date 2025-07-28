'use client'

import { ImageResponse } from '@/lib/types/image'

/**
 * 图片编辑器模态框组件（占位符）
 * 暂时禁用图片编辑功能，避免Konva/canvas依赖问题
 */
interface ImageEditorModalProps {
  image?: ImageResponse | null
  isOpen?: boolean
  onClose?: () => void
}

export function ImageEditorModal({ 
  isOpen = false, 
  onClose 
}: ImageEditorModalProps) {
  // 暂时返回空，图片编辑功能待后续开发
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">图片编辑功能</h3>
        <p className="text-muted-foreground mb-4">
          图片编辑功能正在开发中，敬请期待...
        </p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  )
}