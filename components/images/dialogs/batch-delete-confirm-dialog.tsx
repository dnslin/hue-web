'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Trash2, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

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
  const handleConfirm = () => {
    onConfirm()
    // 注意：不要在这里关闭对话框，让父组件在操作完成后关闭
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader className="pt-6">
          {/* 警告图标动画 */}
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-red-100 dark:bg-red-900/20 animate-ping opacity-75" />
              <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/10 border-2 border-red-200 dark:border-red-800">
                <Trash2 className="h-8 w-8 text-red-500 animate-pulse" />
              </div>
            </div>
          </div>
          
          <AlertDialogTitle className="text-center text-xl font-semibold text-foreground mb-2">
            批量删除图片
          </AlertDialogTitle>
          
          <AlertDialogDescription className="text-center text-base text-muted-foreground mb-4">
            {selectedCount > 0 ? (
              <>
                确定要删除选中的 <span className="font-semibold text-foreground">{selectedCount}</span> 张图片吗？
              </>
            ) : (
              '请先选择要删除的图片'
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        {/* 选择数量展示 */}
        {selectedCount > 0 && (
          <div className="px-6 mb-4">
            <div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-center gap-2">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 flex items-center justify-center">
                  <Trash2 className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">
                    待删除图片
                  </div>
                  <Badge variant="destructive" className="text-xs">
                    {selectedCount} 张图片
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* 警告提示 */}
        <div className="px-6 mb-6">
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-orange-50 dark:bg-orange-900/10 px-3 py-2 rounded-md border border-orange-200 dark:border-orange-800">
            <AlertTriangle className="h-4 w-4 text-orange-500 flex-shrink-0" />
            <span>此操作会将图片移到回收站，您可以稍后恢复</span>
          </div>
        </div>
        
        <AlertDialogFooter className="gap-3">
          <AlertDialogCancel 
            disabled={isDeleting}
            className="flex-1 h-11 font-medium transition-all duration-200 hover:scale-[1.02]"
          >
            取消
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDeleting || selectedCount === 0}
            className={cn(
              "flex-1 h-11 font-medium transition-all duration-200",
              "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700",
              "text-white shadow-lg hover:shadow-xl hover:scale-[1.02]",
              "disabled:from-red-300 disabled:to-red-400 disabled:shadow-none disabled:scale-100",
              isDeleting && "cursor-not-allowed"
            )}
          >
            {isDeleting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="relative">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
                <span className="text-sm">删除中...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Trash2 className="h-4 w-4" />
                <span>确认删除</span>
              </div>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}