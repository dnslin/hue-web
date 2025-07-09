"use client"

import React, { useState } from "react"
import { TestTube, CheckCircle, XCircle, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useStorageStrategyStore } from "@/lib/store/storage"
import { StorageStrategy } from "@/lib/types/storage"

interface StorageStrategyTestDialogProps {
  strategy: StorageStrategy
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StorageStrategyTestDialog({
  strategy,
  open,
  onOpenChange,
}: StorageStrategyTestDialogProps) {
  const { testS3Connection, isTesting } = useStorageStrategyStore()
  const [testResult, setTestResult] = useState<{
    success: boolean
    msg: string
    details?: string
  } | null>(null)

  const handleTest = async () => {
    if (strategy.type !== "s3") return

    try {
      const result = await testS3Connection({
        accessKeyId: strategy.s3AccessKeyId || "",
        secretAccessKey: "test-key", // 实际测试时需要用户重新输入密码
        bucket: strategy.s3Bucket || "",
        region: strategy.s3Region || "",
        endpoint: strategy.s3Endpoint || "",
        baseUrl: strategy.s3BaseUrl || "",
        forcePathStyle: strategy.s3ForcePathStyle || false,
      })
      setTestResult(result)
    } catch {
      setTestResult({
        success: false,
        msg: "测试连接时发生错误",
        details: "请检查网络连接和配置参数",
      })
    }
  }

  const handleClose = () => {
    setTestResult(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            测试存储连接
          </DialogTitle>
          <DialogDescription>
            测试 &quot;{strategy.name}&quot; 的连接状态
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 策略信息 */}
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">策略名称</span>
                  <span className="font-medium">{strategy.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">存储类型</span>
                  <Badge variant={strategy.type === "s3" ? "default" : "secondary"}>
                    {strategy.type === "s3" ? "S3 存储" : "本地存储"}
                  </Badge>
                </div>
                {strategy.type === "s3" && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">终端节点</span>
                      <span className="text-sm">{strategy.s3Endpoint}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">存储桶</span>
                      <span className="text-sm">{strategy.s3Bucket}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">区域</span>
                      <span className="text-sm">{strategy.s3Region}</span>
                    </div>
                  </>
                )}
                {strategy.type === "local" && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">存储路径</span>
                    <span className="text-sm">{strategy.localBasePath}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 测试结果 */}
          {testResult && (
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  {testResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <p className={`font-medium ${
                      testResult.success ? "text-green-700" : "text-red-700"
                    }`}>
                      {testResult.msg}
                    </p>
                    {testResult.details && (
                      <p className="text-sm text-muted-foreground">
                        {testResult.details}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-2">
            {strategy.type === "s3" ? (
              <Button
                onClick={handleTest}
                disabled={isTesting}
                className="flex-1"
              >
                {isTesting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <TestTube className="mr-2 h-4 w-4" />
                )}
                {isTesting ? "测试中..." : "开始测试"}
              </Button>
            ) : (
              <Card className="flex-1">
                <CardContent className="py-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    本地存储无需测试连接
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    请确保服务器有足够的磁盘空间和读写权限
                  </p>
                </CardContent>
              </Card>
            )}
            <Button variant="outline" onClick={handleClose}>
              关闭
            </Button>
          </div>

          {/* 说明 */}
          {strategy.type === "s3" && !testResult && (
            <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
              <p className="font-medium mb-1">测试说明：</p>
              <ul className="list-disc list-inside space-y-1">
                <li>测试将尝试连接到 S3 服务</li>
                <li>检查存储桶访问权限</li>
                <li>验证上传和删除权限</li>
                <li>测试不会上传真实文件</li>
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}