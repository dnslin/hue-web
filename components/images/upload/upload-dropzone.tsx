'use client'

import React, { useState, useRef } from 'react'
import { Upload, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface UploadDropzoneProps {
  onFiles: (files: File[]) => void
  accept?: string
  multiple?: boolean
  disabled?: boolean
  maxFiles?: number
  className?: string
  children?: React.ReactNode
}

/**
 * 拖拽上传区域组件
 * 支持文件拖拽、点击选择和视觉反馈
 */
export function UploadDropzone({
  onFiles,
  accept = 'image/*',
  multiple = true,
  disabled = false,
  maxFiles,
  className,
  children,
}: UploadDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 处理文件选择
  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return

    let fileArray = Array.from(files)
    
    // 过滤图片文件
    fileArray = fileArray.filter(file => file.type.startsWith('image/'))
    
    // 限制文件数量
    if (maxFiles && fileArray.length > maxFiles) {
      fileArray = fileArray.slice(0, maxFiles)
    }
    
    if (fileArray.length > 0) {
      onFiles(fileArray)
    }
  }

  // 点击选择文件
  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  // 文件输入变化
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(event.target.files)
    // 清空input以允许重复选择相同文件
    event.target.value = ''
  }

  // 拖拽事件处理
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
    if (!disabled) {
      setIsDragOver(true)
    }
  }

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragOver(false)
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
    setIsDragOver(false)
    
    if (!disabled) {
      handleFiles(event.dataTransfer.files)
    }
  }

  return (
    <>
      <motion.div
        className={cn(
          "relative border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer",
          "flex flex-col items-center justify-center gap-4 p-8",
          isDragOver
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-muted-foreground/20 hover:border-primary/50 hover:bg-primary/5",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        whileHover={!disabled ? { scale: 1.01 } : {}}
        whileTap={!disabled ? { scale: 0.99 } : {}}
      >
        {children || (
          <>
            {/* 图标 */}
            <motion.div
              className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center transition-colors",
                isDragOver
                  ? "bg-primary text-primary-foreground"
                  : "bg-primary/10 text-primary"
              )}
              animate={isDragOver ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              {isDragOver ? (
                <Plus className="h-8 w-8" />
              ) : (
                <Upload className="h-8 w-8" />
              )}
            </motion.div>

            {/* 文本内容 */}
            <div className="text-center space-y-2">
              <motion.h3 
                className="text-lg font-medium"
                animate={isDragOver ? { scale: 1.05 } : {}}
              >
                {isDragOver ? '释放文件以上传' : '点击或拖拽上传图片'}
              </motion.h3>
              
              <p className="text-sm text-muted-foreground">
                {multiple 
                  ? `支持批量选择${maxFiles ? `，最多 ${maxFiles} 个文件` : ''}`
                  : '选择单个文件'
                }
              </p>
            </div>

            {/* 操作按钮 */}
            {!isDragOver && (
              <Button 
                variant="default"
                size="lg"
                disabled={disabled}
                className="pointer-events-none"
              >
                <Upload className="h-4 w-4 mr-2" />
                选择文件
              </Button>
            )}
          </>
        )}

        {/* 拖拽遮罩 */}
        {isDragOver && (
          <motion.div
            className="absolute inset-0 bg-primary/10 rounded-lg border-2 border-primary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </motion.div>

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
    </>
  )
}