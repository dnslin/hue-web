import { useState, useCallback } from 'react'
import { ImageResponse } from '@/lib/types/image'

/**
 * 图片编辑器状态管理 Hook
 * 管理Filerobot图片编辑器的状态
 */
export function useImageEditor() {
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingImage, setEditingImage] = useState<ImageResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // 打开编辑器
  const openEditor = useCallback((image: ImageResponse) => {
    setEditingImage(image)
    setIsEditorOpen(true)
  }, [])

  // 关闭编辑器
  const closeEditor = useCallback(() => {
    setIsEditorOpen(false)
    setEditingImage(null)
    setIsLoading(false)
  }, [])

  // 设置加载状态
  const setEditorLoading = useCallback((loading: boolean) => {
    setIsLoading(loading)
  }, [])

  return {
    isEditorOpen,
    editingImage,
    isLoading,
    openEditor,
    closeEditor,
    setEditorLoading
  }
}