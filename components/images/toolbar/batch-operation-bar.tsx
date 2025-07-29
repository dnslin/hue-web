'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { 
  Trash2, 
  Move, 
  Eye, 
  EyeOff, 
  X, 
  CheckSquare, 
  Square,
  Loader2
} from 'lucide-react'
import { imageBatchStore } from '@/lib/store/image/batch'
import { imageDataStore } from '@/lib/store/image/data'
import { useStore } from 'zustand'
import { BatchDeleteConfirmDialog } from '@/components/images/dialogs/batch-delete-confirm-dialog'
import { showToast } from '@/lib/utils/toast'

/**
 * 批量操作工具栏组件
 * 提供批量选择、删除、移动、设置公开状态等功能
 */
export function BatchOperationBar() {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  
  const { 
    selectedImageIds,
    isSelectionMode,
    batchOperations,
    batchError,
    setSelectionMode,
    clearSelection,
    batchDeleteSelected,
    batchUpdatePublicStatus
  } = useStore(imageBatchStore)

  const { images } = useStore(imageDataStore)
  const selectedCount = selectedImageIds.size

  // 如果没有处于选择模式且没有选中项，不显示工具栏
  if (!isSelectionMode && selectedCount === 0) {
    return null
  }

  // 切换选择模式
  const toggleSelectionMode = () => {
    setSelectionMode(!isSelectionMode)
  }

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedCount === images.length) {
      clearSelection()
    } else {
      const imageIds = images.map(img => img.id)
      imageBatchStore.getState().selectAllImages(imageIds)
    }
  }

  // 批量删除
  const handleBatchDelete = async () => {
    const success = await batchDeleteSelected()
    if (success) {
      // 刷新图片列表
      imageDataStore.getState().refreshImages()
      // 显示成功提示
      showToast.success(`已成功删除 ${selectedCount} 张图片`)
      // 关闭对话框
      setShowDeleteDialog(false)
    } else {
      // 错误处理已在 store 中完成，这里可以显示通用错误提示
      showToast.error('删除失败，请稍后重试')
    }
  }

  // 批量设置公开状态
  const handleBatchSetPublic = async (isPublic: boolean) => {
    const success = await batchUpdatePublicStatus(isPublic)
    if (success) {
      imageDataStore.getState().refreshImages()
      // 显示成功提示
      const statusText = isPublic ? '公开' : '私有'
      showToast.success(`已成功将 ${selectedCount} 张图片设为${statusText}`)
    } else {
      // 错误处理已在 store 中完成，这里可以显示通用错误提示
      showToast.error('操作失败，请稍后重试')
    }
  }

  // 批量移动到相册（暂时简化实现）
  const handleBatchMove = async () => {
    // TODO: 实现相册选择对话框
    console.log('批量移动功能待实现')
  }

  return (
    <Card className="p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* 左侧：选择状态和控制 */}
        <div className="flex items-center gap-4">
          {/* 选择模式切换 */}
          <Button
            variant={isSelectionMode ? "default" : "outline"}
            size="sm"
            onClick={toggleSelectionMode}
            className="h-9"
          >
            {isSelectionMode ? (
              <CheckSquare className="h-4 w-4 mr-1" />
            ) : (
              <Square className="h-4 w-4 mr-1" />
            )}
            选择
          </Button>

          {/* 选择状态显示 */}
          {isSelectionMode && (
            <>
              <Badge variant="secondary" className="text-sm">
                已选择 {selectedCount} 项
              </Badge>

              {/* 全选/取消全选 */}
              {images.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSelectAll}
                  className="h-9 text-sm"
                >
                  {selectedCount === images.length ? '取消全选' : '全选'}
                </Button>
              )}

              {/* 清除选择 */}
              {selectedCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSelection}
                  className="h-9"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </>
          )}
        </div>

        {/* 中间：批量操作按钮 */}
        {selectedCount > 0 && (
          <>
            <Separator orientation="vertical" className="hidden lg:block h-6" />
            <div className="flex flex-wrap items-center gap-2">
              {/* 批量删除 */}
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                disabled={batchOperations.deleting}
                className="h-9"
              >
                {batchOperations.deleting ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-1" />
                )}
                删除 ({selectedCount})
              </Button>

              {/* 批量设置公开 */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBatchSetPublic(true)}
                disabled={batchOperations.updatingPublic}
                className="h-9"
              >
                {batchOperations.updatingPublic ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Eye className="h-4 w-4 mr-1" />
                )}
                设为公开
              </Button>

              {/* 批量设置私有 */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBatchSetPublic(false)}
                disabled={batchOperations.updatingPublic}
                className="h-9"
              >
                {batchOperations.updatingPublic ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <EyeOff className="h-4 w-4 mr-1" />
                )}
                设为私有
              </Button>

              {/* 批量移动（暂时禁用） */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleBatchMove}
                disabled={true}
                className="h-9"
              >
                <Move className="h-4 w-4 mr-1" />
                移动到相册
              </Button>
            </div>
          </>
        )}

        {/* 右侧：错误信息 */}
        {batchError && (
          <div className="text-sm text-destructive">
            {batchError}
          </div>
        )}
      </div>

      {/* 批量删除确认对话框 */}
      <BatchDeleteConfirmDialog
        isOpen={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        selectedCount={selectedCount}
        onConfirm={handleBatchDelete}
        isDeleting={batchOperations.deleting}
      />
    </Card>
  )
}