'use client'

import React from 'react'
import { 
  Settings, 
  Folder, 
  Eye, 
  EyeOff, 
  Globe,
  Lock,
  Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useImageUploadStore } from '@/lib/store/image/upload'
import { getCurrentUploadConfig } from '@/lib/schema/image'
import { cn } from '@/lib/utils'

interface UploadSettingsPanelProps {
  className?: string
  compact?: boolean
}

/**
 * 上传设置面板组件
 * 提供相册选择、公开性设置和其他上传配置选项
 */
export function UploadSettingsPanel({
  className,
  compact = false,
}: UploadSettingsPanelProps) {
  const { uploadConfig, updateConfig } = useImageUploadStore()
  const configInfo = getCurrentUploadConfig()

  // 模拟相册数据（实际应该从相册 store 获取）
  const albums = [
    { id: 1, name: '默认相册', imageCount: 25 },
    { id: 2, name: '旅行照片', imageCount: 12 },
    { id: 3, name: '工作项目', imageCount: 8 },
  ]

  const handleAlbumChange = (value: string) => {
    const albumId = value === 'none' ? undefined : parseInt(value)
    updateConfig({ albumId })
  }

  const handlePublicChange = (isPublic: boolean) => {
    updateConfig({ isPublic })
  }

  if (compact) {
    return (
      <div className={cn("space-y-4", className)}>
        {/* 简化版设置 */}
        <div className="grid grid-cols-2 gap-4">
          {/* 相册选择 */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">目标相册</Label>
            <Select
              value={uploadConfig.albumId?.toString() || 'none'}
              onValueChange={handleAlbumChange}
            >
              <SelectTrigger className="h-8">
                <SelectValue placeholder="选择相册" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <div className="flex items-center gap-2">
                    <Folder className="h-3 w-3" />
                    <span>不指定相册</span>
                  </div>
                </SelectItem>
                {albums.map((album) => (
                  <SelectItem key={album.id} value={album.id.toString()}>
                    <div className="flex items-center gap-2">
                      <Folder className="h-3 w-3" />
                      <span>{album.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {album.imageCount}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 公开性设置 */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">可见性</Label>
            <div className="flex items-center space-x-2 h-8">
              <Switch
                id="public-switch"
                checked={uploadConfig.isPublic || false}
                onCheckedChange={handlePublicChange}
              />
              <Label
                htmlFor="public-switch"
                className="text-xs cursor-pointer flex items-center gap-1"
              >
                {uploadConfig.isPublic ? (
                  <>
                    <Globe className="h-3 w-3" />
                    公开
                  </>
                ) : (
                  <>
                    <Lock className="h-3 w-3" />
                    私有
                  </>
                )}
              </Label>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* 设置标题 */}
      <div className="flex items-center gap-2">
        <Settings className="h-4 w-4" />
        <h3 className="font-medium">上传设置</h3>
      </div>

      {/* 相册选择 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Folder className="h-4 w-4" />
            目标相册
          </CardTitle>
          <CardDescription className="text-xs">
            选择图片要保存到的相册，不选择则保存到默认位置
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Select
            value={uploadConfig.albumId?.toString() || 'none'}
            onValueChange={handleAlbumChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="选择相册" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">
                <div className="flex items-center gap-2">
                  <Folder className="h-4 w-4" />
                  <div>
                    <div className="font-medium">不指定相册</div>
                    <div className="text-xs text-muted-foreground">保存到默认位置</div>
                  </div>
                </div>
              </SelectItem>
              {albums.map((album) => (
                <SelectItem key={album.id} value={album.id.toString()}>
                  <div className="flex items-center gap-2">
                    <Folder className="h-4 w-4" />
                    <div className="flex-1">
                      <div className="font-medium">{album.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {album.imageCount} 张图片
                      </div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Separator />

      {/* 公开性设置 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            {uploadConfig.isPublic ? (
              <>
                <Globe className="h-4 w-4" />
                公开图片
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                私有图片
              </>
            )}
          </CardTitle>
          <CardDescription className="text-xs">
            {uploadConfig.isPublic 
              ? '图片将对所有人可见，可以通过直链访问'
              : '图片仅对你可见，需要登录才能访问'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="public-toggle"
                checked={uploadConfig.isPublic || false}
                onCheckedChange={handlePublicChange}
              />
              <Label htmlFor="public-toggle" className="cursor-pointer">
                {uploadConfig.isPublic ? '公开访问' : '私有访问'}
              </Label>
            </div>
            
            <Badge variant={uploadConfig.isPublic ? 'default' : 'secondary'}>
              {uploadConfig.isPublic ? (
                <>
                  <Eye className="h-3 w-3 mr-1" />
                  公开
                </>
              ) : (
                <>
                  <EyeOff className="h-3 w-3 mr-1" />
                  私有
                </>
              )}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* 上传限制信息 */}
      <Card className="bg-muted/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Info className="h-4 w-4" />
            上传限制
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-2 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>单文件大小：</span>
            <span className="font-medium">最大 {configInfo.maxSizeMB}MB</span>
          </div>
          <div className="flex justify-between">
            <span>批量数量：</span>
            <span className="font-medium">最多 {configInfo.batchLimit} 个</span>
          </div>
          <div className="flex justify-between">
            <span>支持格式：</span>
            <span className="font-medium">
              {configInfo.allowedFormats.map(format => 
                format.replace('image/', '').toUpperCase()
              ).join(', ')}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * 上传进度总览组件
 * 显示整体上传进度和统计信息
 */
interface UploadProgressOverviewProps {
  className?: string
}

export function UploadProgressOverview({
  className,
}: UploadProgressOverviewProps) {
  const { 
    files, 
    totalFiles, 
    completedFiles, 
    failedFiles, 
    overallProgress,
    isUploading 
  } = useImageUploadStore()

  const pendingCount = files.filter(f => f.status === 'pending').length
  const uploadingCount = files.filter(f => f.status === 'uploading').length

  if (totalFiles === 0) {
    return null
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">上传进度</CardTitle>
        <CardDescription className="text-xs">
          {isUploading ? '正在上传中...' : '上传已完成'}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {/* 整体进度 */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>整体进度</span>
            <span className="font-medium">{overallProgress}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary rounded-full h-2 transition-all duration-300"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="space-y-1">
            <div className="text-2xl font-bold text-green-600">{completedFiles}</div>
            <div className="text-xs text-muted-foreground">已完成</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-red-600">{failedFiles}</div>
            <div className="text-xs text-muted-foreground">失败</div>
          </div>
        </div>

        {/* 状态标签 */}
        <div className="flex flex-wrap gap-2">
          {pendingCount > 0 && (
            <Badge variant="secondary">
              {pendingCount} 等待
            </Badge>
          )}
          {uploadingCount > 0 && (
            <Badge variant="default">
              {uploadingCount} 上传中
            </Badge>
          )}
          {completedFiles > 0 && (
            <Badge variant="outline" className="text-green-600 border-green-200">
              {completedFiles} 成功
            </Badge>
          )}
          {failedFiles > 0 && (
            <Badge variant="destructive">
              {failedFiles} 失败
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}