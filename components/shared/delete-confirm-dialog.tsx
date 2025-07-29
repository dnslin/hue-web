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
import { Trash2, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DeleteConfirmDialogProps {
  // 基础控制
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isDeleting?: boolean
  
  // 文本配置
  title: string
  description: string | React.ReactNode
  
  // 中间内容区域（可选）
  children?: React.ReactNode
  
  // 提示信息配置
  notice?: {
    text: string
    variant: 'info' | 'warning'
  }
  
  // 确认按钮配置
  confirmDisabled?: boolean
  confirmText?: string
  loadingText?: string
}

/**
 * 通用删除确认对话框组件
 * 提供一致的删除确认体验，支持自定义内容和配置
 */
export function DeleteConfirmDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  isDeleting = false,
  title,
  description,
  children,
  notice,
  confirmDisabled = false,
  confirmText = '确认删除',
  loadingText = '删除中...'
}: DeleteConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm()
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader className="pt-6">
          {/* 带动画的警告图标 */}
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-red-100 dark:bg-red-900/20 animate-ping opacity-75" />
              <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/10 border-2 border-red-200 dark:border-red-800">
                <Trash2 className="h-8 w-8 text-red-500 animate-pulse" />
              </div>
            </div>
          </div>
          
          <AlertDialogTitle className="text-center text-xl font-semibold text-foreground mb-2">
            {title}
          </AlertDialogTitle>
          
          <AlertDialogDescription className="text-center text-base text-muted-foreground mb-4">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        {/* 自定义内容区域 */}
        {children && (
          <div className="px-6 mb-4">
            {children}
          </div>
        )}
        
        {/* 提示信息 */}
        {notice && (
          <div className="px-6 mb-6">
            <div className={cn(
              "flex items-center gap-2 text-xs text-muted-foreground px-3 py-2 rounded-md border",
              notice.variant === 'info' 
                ? "bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800"
                : "bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800"
            )}>
              {notice.variant === 'info' ? (
                <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-orange-500 flex-shrink-0" />
              )}
              <span>{notice.text}</span>
            </div>
          </div>
        )}
        
        <AlertDialogFooter className="gap-3">
          <AlertDialogCancel 
            disabled={isDeleting}
            className="flex-1 h-11 font-medium transition-all duration-200 hover:scale-[1.02]"
          >
            取消
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDeleting || confirmDisabled}
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
                <span className="text-sm">{loadingText}</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Trash2 className="h-4 w-4" />
                <span>{confirmText}</span>
              </div>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}