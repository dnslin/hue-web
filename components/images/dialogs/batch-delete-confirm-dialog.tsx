'use client'

import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog'
import { Badge } from '@/components/ui/badge'
import { Trash2 } from 'lucide-react'

interface BatchDeleteConfirmDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  selectedCount: number
  onConfirm: () => void
  isDeleting?: boolean
}

/**
 * 批量删除确认对话框组件
 * 提供美观的批量删除确认界面
 */
export function BatchDeleteConfirmDialog({
  isOpen,
  onOpenChange,
  selectedCount,
  onConfirm,
  isDeleting = false
}: BatchDeleteConfirmDialogProps) {
  return (
    <DeleteConfirmDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      isDeleting={isDeleting}
      title="批量删除图片"
      description={
        selectedCount > 0 ? (
          <>
            确定要删除选中的 <span className="font-semibold text-foreground">{selectedCount}</span> 张图片吗？
          </>
        ) : (
          '请先选择要删除的图片'
        )
      }
      confirmDisabled={selectedCount === 0}
      notice={{
        text: "此操作会将图片移到回收站，您可以稍后恢复",
        variant: "warning"
      }}
    >
      {/* 选择数量展示 */}
      {selectedCount > 0 && (
        <div className="mx-auto max-w-xs">
          <div className="relative p-4 rounded-xl bg-gradient-to-br from-red-50/80 to-red-100/60 dark:from-red-950/40 dark:to-red-900/30 border border-red-200/60 dark:border-red-800/50 shadow-sm">
            {/* 背景装饰 */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-red-500/5 to-red-600/10 dark:from-red-400/10 dark:to-red-500/5" />
            
            {/* 内容区域 */}
            <div className="relative flex items-center gap-3">
              {/* 图标容器 */}
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 w-12 h-12 rounded-full bg-red-400/20 animate-pulse" />
                <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-red-400 to-red-500 shadow-md shadow-red-400/25 flex items-center justify-center">
                  <Trash2 className="h-5 w-5 text-white" />
                </div>
              </div>
              
              {/* 文本信息 */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-red-600 dark:text-red-400 mb-1">
                  待删除图片
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="destructive" 
                    className="text-xs font-medium px-2 py-0.5 bg-red-500 hover:bg-red-600 border-0 shadow-sm"
                  >
                    {selectedCount} 张图片
                  </Badge>
                  <div className="text-xs text-red-500/70 dark:text-red-400/70">
                    即将删除
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DeleteConfirmDialog>
  )
}