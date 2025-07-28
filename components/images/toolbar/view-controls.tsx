'use client'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { 
  Grid3x3, 
  LayoutGrid, 
  List, 
  Settings2,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

type ViewMode = 'masonry' | 'grid' | 'list'
type DeviceView = 'auto' | 'mobile' | 'tablet' | 'desktop'

interface ViewControlsProps {
  /**
   * 当前视图模式
   */
  viewMode?: ViewMode
  /**
   * 视图模式变化回调
   */
  onViewModeChange?: (mode: ViewMode) => void
  /**
   * 当前列数（瀑布流模式）
   */
  columnCount?: number
  /**
   * 列数变化回调
   */
  onColumnCountChange?: (count: number) => void
  /**
   * 每页显示数量
   */
  pageSize?: number
  /**
   * 每页显示数量变化回调
   */
  onPageSizeChange?: (size: number) => void
  /**
   * 自定义样式类名
   */
  className?: string
  /**
   * 紧凑模式
   */
  compact?: boolean
}

/**
 * 视图控制组件
 * 提供视图模式切换、列数调整、分页大小设置等功能
 */
export function ViewControls({
  viewMode = 'masonry',
  onViewModeChange,
  columnCount = 4,
  onColumnCountChange,
  pageSize = 20,
  onPageSizeChange,
  className,
  compact = false
}: ViewControlsProps) {
  const [deviceView, setDeviceView] = useState<DeviceView>('auto')

  // 根据设备视图模式自动调整列数
  useEffect(() => {
    if (deviceView === 'auto') return

    const columnMapping = {
      mobile: 1,
      tablet: 2,
      desktop: 4
    }

    const targetColumns = columnMapping[deviceView as keyof typeof columnMapping]
    if (targetColumns && onColumnCountChange) {
      onColumnCountChange(targetColumns)
    }
  }, [deviceView, onColumnCountChange])

  // 视图模式选项
  const viewModeOptions = [
    { value: 'masonry', label: '瀑布流', icon: LayoutGrid },
    { value: 'grid', label: '网格', icon: Grid3x3 },
    { value: 'list', label: '列表', icon: List }
  ]

  // 列数选项
  const columnOptions = [
    { value: 1, label: '1列', disabled: false },
    { value: 2, label: '2列', disabled: false },
    { value: 3, label: '3列', disabled: false },
    { value: 4, label: '4列', disabled: false },
    { value: 5, label: '5列', disabled: false },
    { value: 6, label: '6列', disabled: false }
  ]

  // 每页数量选项
  const pageSizeOptions = [
    { value: 10, label: '10 项/页' },
    { value: 20, label: '20 项/页' },
    { value: 50, label: '50 项/页' },
    { value: 100, label: '100 项/页' }
  ]

  // 设备视图选项
  const deviceViewOptions = [
    { value: 'auto', label: '自适应', icon: Settings2 },
    { value: 'mobile', label: '手机视图', icon: Smartphone },
    { value: 'tablet', label: '平板视图', icon: Tablet },
    { value: 'desktop', label: '桌面视图', icon: Monitor }
  ]

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {/* 视图模式切换 */}
        <div className="flex items-center border rounded-lg">
          {viewModeOptions.map((option) => {
            const IconComponent = option.icon
            return (
              <Button
                key={option.value}
                variant={viewMode === option.value ? "default" : "ghost"}
                size="sm"
                onClick={() => onViewModeChange?.(option.value as ViewMode)}
                className="h-8 px-2 rounded-none first:rounded-l-lg last:rounded-r-lg"
              >
                <IconComponent className="h-4 w-4" />
              </Button>
            )
          })}
        </div>

        {/* 列数调整（仅瀑布流和网格模式） */}
        {(viewMode === 'masonry' || viewMode === 'grid') && (
          <Select
            value={columnCount.toString()}
            onValueChange={(value) => onColumnCountChange?.(parseInt(value))}
          >
            <SelectTrigger className="w-16 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {columnOptions.map((option) => (
                <SelectItem 
                  key={option.value} 
                  value={option.value.toString()}
                  disabled={option.disabled}
                >
                  {option.value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    )
  }

  return (
    <div className={cn(
      "flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between p-4 bg-background border rounded-xl",
      className
    )}>
      {/* 左侧：视图模式控制 */}
      <div className="flex flex-wrap items-center gap-4">
        {/* 视图模式切换 */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground hidden sm:block">视图模式:</span>
          <div className="flex items-center border rounded-lg">
            {viewModeOptions.map((option) => {
              const IconComponent = option.icon
              return (
                <Button
                  key={option.value}
                  variant={viewMode === option.value ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onViewModeChange?.(option.value as ViewMode)}
                  className="h-9 px-3 rounded-none first:rounded-l-lg last:rounded-r-lg"
                  title={option.label}
                >
                  <IconComponent className="h-4 w-4 mr-1 sm:mr-0 lg:mr-1" />
                  <span className="hidden sm:inline lg:hidden xl:inline">{option.label}</span>
                </Button>
              )
            })}
          </div>
        </div>

        {/* 列数调整（仅瀑布流和网格模式） */}
        {(viewMode === 'masonry' || viewMode === 'grid') && (
          <>
            <Separator orientation="vertical" className="h-6 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:block">列数:</span>
              <Select
                value={columnCount.toString()}
                onValueChange={(value) => onColumnCountChange?.(parseInt(value))}
              >
                <SelectTrigger className="w-24 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {columnOptions.map((option) => (
                    <SelectItem 
                      key={option.value} 
                      value={option.value.toString()}
                      disabled={option.disabled}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {/* 设备视图模式 */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground hidden lg:block">设备视图:</span>
          <Select
            value={deviceView}
            onValueChange={(value) => setDeviceView(value as DeviceView)}
          >
            <SelectTrigger className="w-32 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {deviceViewOptions.map((option) => {
                const IconComponent = option.icon
                return (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-4 w-4" />
                      {option.label}
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 右侧：分页控制 */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground hidden sm:block">每页显示:</span>
        <Select
          value={pageSize.toString()}
          onValueChange={(value) => onPageSizeChange?.(parseInt(value))}
        >
          <SelectTrigger className="w-32 h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value.toString()}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

/**
 * 简化版视图控制组件
 * 仅包含基本的视图模式切换
 */
export function SimpleViewControls({
  viewMode = 'masonry',
  onViewModeChange,
  className
}: {
  viewMode?: ViewMode
  onViewModeChange?: (mode: ViewMode) => void
  className?: string
}) {
  const viewModeOptions = [
    { value: 'masonry', icon: LayoutGrid, tooltip: '瀑布流视图' },
    { value: 'grid', icon: Grid3x3, tooltip: '网格视图' },
    { value: 'list', icon: List, tooltip: '列表视图' }
  ]

  return (
    <div className={cn("flex items-center border rounded-lg", className)}>
      {viewModeOptions.map((option) => {
        const IconComponent = option.icon
        return (
          <Button
            key={option.value}
            variant={viewMode === option.value ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange?.(option.value as ViewMode)}
            className="h-8 px-2 rounded-none first:rounded-l-lg last:rounded-r-lg"
            title={option.tooltip}
          >
            <IconComponent className="h-4 w-4" />
          </Button>
        )
      })}
    </div>
  )
}