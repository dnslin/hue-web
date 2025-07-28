'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, SortAsc, SortDesc, X, LayoutGrid, Grid3x3, List } from 'lucide-react'
import { useImageFilterStore } from '@/lib/store/image/filter'
import { useState } from 'react'

interface ImageFilterToolbarProps {
  /**
   * 当前视图模式
   */
  viewMode?: 'masonry' | 'grid' | 'list'
  /**
   * 视图模式变化回调
   */
  onViewModeChange?: (mode: 'masonry' | 'grid' | 'list') => void
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
}

/**
 * 图片筛选和搜索工具栏组件
 * 提供搜索、筛选、排序等功能，并集成视图控制
 */
export function ImageFilterToolbar({ 
  viewMode = 'masonry', 
  onViewModeChange,
  columnCount = 4,
  onColumnCountChange,
  pageSize = 20,
  onPageSizeChange
}: ImageFilterToolbarProps) {
  const { filters, setFilters, resetFilters } = useImageFilterStore()
  const [searchInput, setSearchInput] = useState(filters.search || '')

  // 视图模式选项
  const viewModeOptions = [
    { value: 'masonry', icon: LayoutGrid, tooltip: '瀑布流视图' },
    { value: 'grid', icon: Grid3x3, tooltip: '网格视图' },
    { value: 'list', icon: List, tooltip: '列表视图' }
  ]

  // 列数选项
  const columnOptions = [
    { value: 1, label: '1列' },
    { value: 2, label: '2列' },
    { value: 3, label: '3列' },
    { value: 4, label: '4列' },
    { value: 5, label: '5列' },
    { value: 6, label: '6列' }
  ]

  // 每页数量选项
  const pageSizeOptions = [
    { value: 10, label: '10 项/页' },
    { value: 20, label: '20 项/页' },
    { value: 50, label: '50 项/页' },
    { value: 100, label: '100 项/页' }
  ]

  // 处理搜索
  const handleSearch = () => {
    setFilters({ search: searchInput || undefined })
  }

  // 处理键盘回车搜索
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  // 清除搜索
  const clearSearch = () => {
    setSearchInput('')
    setFilters({ search: undefined })
  }

  return (
    <div className="space-y-4">
      {/* 主要工具栏 */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* 左侧：搜索栏 */}
        <div className="flex flex-1 items-center gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="搜索图片文件名..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-9 h-9"
            />
            {searchInput && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          <Button onClick={handleSearch} size="sm" className="h-9">
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {/* 右侧：视图控制和筛选控制 */}
        <div className="flex flex-wrap items-center gap-3">
          {/* 视图模式切换 - 桌面端显示 */}
          <div className="hidden md:flex items-center border rounded-lg">
            {viewModeOptions.map((option) => {
              const IconComponent = option.icon
              return (
                <Button
                  key={option.value}
                  variant={viewMode === option.value ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onViewModeChange?.(option.value as 'masonry' | 'grid' | 'list')}
                  className="h-9 px-2 rounded-none first:rounded-l-lg last:rounded-r-lg"
                  title={option.tooltip}
                >
                  <IconComponent className="h-4 w-4" />
                </Button>
              )
            })}
          </div>

          {/* 列数调整 - 桌面端显示，仅瀑布流和网格模式 */}
          {(viewMode === 'masonry' || viewMode === 'grid') && onColumnCountChange && (
            <Select
              value={columnCount.toString()}
              onValueChange={(value) => onColumnCountChange(parseInt(value))}
            >
              <SelectTrigger className="w-16 h-9 hidden md:flex">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {columnOptions.map((option) => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value.toString()}
                  >
                    {option.value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* 每页显示数量 - 桌面端显示 */}
          {onPageSizeChange && (
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => onPageSizeChange(parseInt(value))}
            >
              <SelectTrigger className="w-20 md:w-32 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    <span className="md:hidden">{option.value}/页</span>
                    <span className="hidden md:inline">{option.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* 分隔符 - 桌面端显示 */}
          <div className="w-px h-6 bg-border hidden md:block" />

          {/* 筛选控制 */}
          <div className="flex flex-wrap items-center gap-2">
            {/* 公开状态筛选 */}
            <Select
              value={filters.isPublic?.toString() || 'all'}
              onValueChange={(value) => 
                setFilters({ 
                  isPublic: value === 'all' ? undefined : value === 'true'
                })
              }
            >
              <SelectTrigger className="w-20 md:w-20 h-9">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="true">公开</SelectItem>
                <SelectItem value="false">私有</SelectItem>
              </SelectContent>
            </Select>

            {/* 排序字段 */}
            <Select
              value={filters.sortBy || 'created_at'}
              onValueChange={(value) => setFilters({ sortBy: value as 'created_at' | 'updated_at' | 'filename' | 'size' })}
            >
              <SelectTrigger className="w-20 md:w-[100px] h-9">
                <SelectValue placeholder="排序" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">
                  <span className="md:hidden">创建</span>
                  <span className="hidden md:inline">创建时间</span>
                </SelectItem>
                <SelectItem value="updated_at">
                  <span className="md:hidden">更新</span>
                  <span className="hidden md:inline">更新时间</span>
                </SelectItem>
                <SelectItem value="filename">
                  <span className="md:hidden">名称</span>
                  <span className="hidden md:inline">文件名</span>
                </SelectItem>
                <SelectItem value="size">
                  <span className="md:hidden">大小</span>
                  <span className="hidden md:inline">文件大小</span>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* 排序方向 */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters({ 
                order: filters.order === 'asc' ? 'desc' : 'asc' 
              })}
              className="h-9 px-2 md:px-3"
              title={filters.order === 'asc' ? '升序' : '降序'}
            >
              {filters.order === 'asc' ? (
                <SortAsc className="h-4 w-4" />
              ) : (
                <SortDesc className="h-4 w-4" />
              )}
            </Button>

            {/* 重置筛选 */}
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="h-9 px-2 md:px-3"
              title="重置筛选条件"
            >
              <Filter className="h-4 w-4" />
              <span className="ml-1 hidden md:inline">重置</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 活跃筛选器显示 */}
      {(filters.search || filters.isPublic !== undefined) && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">筛选器:</span>
          {filters.search && (
            <Badge variant="secondary" className="text-xs">
              搜索: {filters.search}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters({ search: undefined })}
                className="ml-1 h-4 w-4 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {filters.isPublic !== undefined && (
            <Badge variant="secondary" className="text-xs">
              {filters.isPublic ? '公开' : '私有'}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters({ isPublic: undefined })}
                className="ml-1 h-4 w-4 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}