'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, SortAsc, SortDesc, X } from 'lucide-react'
import { useImageFilterStore } from '@/lib/store/image/filter'
import { useState } from 'react'

/**
 * 图片筛选和搜索工具栏组件
 * 提供搜索、筛选、排序等功能
 */
export function ImageFilterToolbar() {
  const { filters, setFilters, resetFilters } = useImageFilterStore()
  const [searchInput, setSearchInput] = useState(filters.search || '')

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
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      {/* 搜索栏 */}
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
          <SelectTrigger className="w-[120px] h-9">
            <SelectValue placeholder="访问状态" />
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
          <SelectTrigger className="w-[120px] h-9">
            <SelectValue placeholder="排序字段" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at">创建时间</SelectItem>
            <SelectItem value="updated_at">更新时间</SelectItem>
            <SelectItem value="filename">文件名</SelectItem>
            <SelectItem value="size">文件大小</SelectItem>
          </SelectContent>
        </Select>

        {/* 排序方向 */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFilters({ 
            order: filters.order === 'asc' ? 'desc' : 'asc' 
          })}
          className="h-9 px-3"
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
          className="h-9"
        >
          <Filter className="h-4 w-4 mr-1" />
          重置
        </Button>
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