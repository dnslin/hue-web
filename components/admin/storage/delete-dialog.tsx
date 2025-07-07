"use client"

import React from "react"
import { AlertTriangle } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { StorageStrategy } from "@/lib/types/storage"

interface StorageStrategyDeleteDialogProps {
  strategy: StorageStrategy
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function StorageStrategyDeleteDialog({
  strategy,
  open,
  onOpenChange,
  onConfirm,
}: StorageStrategyDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            确认删除存储策略
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              您即将删除存储策略 <strong>&quot;{strategy.name}&quot;</strong>。
            </p>
            <div className="text-sm bg-destructive/10 border border-destructive/20 rounded-lg p-3 space-y-1">
              <p className="font-medium text-destructive">⚠️ 警告：此操作不可撤销</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>删除后，所有关联的角色将失去此存储策略权限</li>
                <li>使用此策略上传的文件不会被删除，但可能无法访问</li>
                <li>正在进行的上传操作可能会失败</li>
              </ul>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            确认删除
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}