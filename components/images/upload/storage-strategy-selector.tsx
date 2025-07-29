'use client'

import React, { useEffect, useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { HardDrive, Cloud, AlertCircle } from 'lucide-react'
import { useStorageStrategyStore } from '@/lib/store/storage'
import { StorageStrategy } from '@/lib/types/storage'

interface StorageStrategySelectorProps {
  /**
   * 当前选中的存储策略ID
   */
  value?: number
  /**
   * 选择变化回调
   */
  onValueChange?: (strategyId: number | undefined) => void
  /**
   * 是否禁用
   */
  disabled?: boolean
  /**
   * 是否显示详细信息
   */
  showDetails?: boolean
  /**
   * 选择器宽度样式类
   */
  className?: string
}

/**
 * 存储策略选择器组件
 * 用于在上传时选择存储策略
 */
export function StorageStrategySelector({
  value,
  onValueChange,
  disabled = false,
  showDetails = true,
  className = "w-full"
}: StorageStrategySelectorProps) {
  const {
    strategies,
    isLoadingStrategies,
    error,
    fetchStrategies
  } = useStorageStrategyStore()

  const [availableStrategies, setAvailableStrategies] = useState<StorageStrategy[]>([])

  // 加载存储策略
  useEffect(() => {
    if (strategies.length === 0 && !isLoadingStrategies) {
      fetchStrategies({ isEnabled: true })
    }
  }, [strategies.length, isLoadingStrategies, fetchStrategies])

  // 过滤可用的存储策略（只显示启用的）
  useEffect(() => {
    const enabledStrategies = strategies.filter(strategy => strategy.isEnabled)
    setAvailableStrategies(enabledStrategies)
  }, [strategies])

  // 获取存储策略图标
  const getStrategyIcon = (type: string) => {
    switch (type) {
      case 's3':
        return <Cloud className="h-4 w-4" />
      case 'local':
        return <HardDrive className="h-4 w-4" />
      default:
        return <HardDrive className="h-4 w-4" />
    }
  }

  // 获取存储策略类型显示名称
  const getStrategyTypeName = (type: string) => {
    switch (type) {
      case 's3':
        return 'S3 对象存储'
      case 'local':
        return '本地存储'
      default:
        return '未知类型'
    }
  }

  // 获取存储策略描述信息
  const getStrategyDescription = (strategy: StorageStrategy) => {
    if (strategy.type === 's3' && strategy.s3Config) {
      return `${strategy.s3Config.bucket} (${strategy.s3Config.region})`
    }
    if (strategy.type === 'local' && strategy.localConfig) {
      return strategy.localConfig.basePath
    }
    return '无配置信息'
  }

  // 处理选择变化
  const handleValueChange = (selectedValue: string) => {
    if (selectedValue === 'auto') {
      onValueChange?.(undefined)
    } else {
      const strategyId = parseInt(selectedValue)
      onValueChange?.(strategyId)
    }
  }

  // 加载状态
  if (isLoadingStrategies) {
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">存储策略</Label>
        <Skeleton className="h-10 w-full" />
        {showDetails && <Skeleton className="h-4 w-3/4" />}
      </div>
    )
  }

  // 错误状态
  if (error) {
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">存储策略</Label>
        <div className="flex items-center gap-2 p-2 rounded-lg border border-red-200 bg-red-50 text-red-800">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm">加载存储策略失败</span>
        </div>
      </div>
    )
  }

  // 没有可用策略
  if (availableStrategies.length === 0) {
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">存储策略</Label>
        <div className="flex items-center gap-2 p-2 rounded-lg border border-yellow-200 bg-yellow-50 text-yellow-800">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm">暂无可用的存储策略</span>
        </div>
      </div>
    )
  }

  // 获取当前选中的策略
  const selectedStrategy = value ? availableStrategies.find(s => s.id === value) : null

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">存储策略</Label>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Select
                value={value ? value.toString() : 'auto'}
                onValueChange={handleValueChange}
                disabled={disabled}
              >
                <SelectTrigger className={className}>
                  <SelectValue placeholder="选择存储策略" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      自动选择
                    </span>
                  </SelectItem>
                  {availableStrategies.map((strategy) => (
                    <SelectItem key={strategy.id} value={strategy.id.toString()}>
                      <div className="flex items-center gap-2 w-full">
                        {getStrategyIcon(strategy.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">{strategy.name}</span>
                            <Badge 
                              variant="secondary" 
                              className="text-xs flex-shrink-0"
                            >
                              {getStrategyTypeName(strategy.type)}
                            </Badge>
                          </div>
                          {showDetails && (
                            <div className="text-xs text-muted-foreground truncate">
                              {getStrategyDescription(strategy)}
                            </div>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TooltipTrigger>
          {/* 只在桌面端显示 Tooltip */}
          <TooltipContent className="max-w-sm p-3 bg-popover text-popover-foreground border hidden lg:block" side="right">
            <div className="space-y-2">
              <p className="font-semibold text-sm text-foreground">存储策略说明：</p>
              <div className="text-xs space-y-1">
                <div><strong>自动选择：</strong>系统根据设置自动选择最佳存储策略</div>
                <div><strong>S3 对象存储：</strong>支持阿里云OSS、腾讯云COS、AWS S3等</div>
                <div><strong>本地存储：</strong>存储在服务器本地磁盘</div>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* 选中策略的详细信息 */}
      {showDetails && selectedStrategy && (
        <div className="p-3 rounded-lg bg-muted/30 border">
          <div className="flex items-center gap-2 mb-2">
            {getStrategyIcon(selectedStrategy.type)}
            <span className="font-medium text-sm">{selectedStrategy.name}</span>
            <Badge variant="outline" className="text-xs">
              {getStrategyTypeName(selectedStrategy.type)}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground">
            <div>配置：{getStrategyDescription(selectedStrategy)}</div>
            {selectedStrategy.totalFiles !== undefined && (
              <div>已存储文件：{selectedStrategy.totalFiles.toLocaleString()} 个</div>
            )}
            {selectedStrategy.usedSpaceBytes !== undefined && (
              <div>
                已用空间：{(selectedStrategy.usedSpaceBytes / 1024 / 1024 / 1024).toFixed(2)} GB
              </div>
            )}
          </div>
        </div>
      )}

      {/* 自动选择提示 */}
      {!value && showDetails && (
        <div className="p-3 rounded-lg bg-green-50 border border-green-200">
          <div className="flex items-center gap-2 text-green-800">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium">自动选择模式</span>
          </div>
          <div className="text-xs text-green-700 mt-1">
            系统将根据当前用户权限和系统设置自动选择最佳的存储策略
          </div>
        </div>
      )}
    </div>
  )
}