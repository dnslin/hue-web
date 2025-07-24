// components/gallery/gallery-filter-bar.tsx
// 画廊筛选条件栏组件

'use client';

import React, { useState } from 'react';
import { Search, Filter, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { Checkbox } from '@/components/ui/checkbox';
import { useWaterfallGallery } from '@/lib/store/gallery';
import { SUPPORTED_IMAGE_FORMATS } from '@/lib/constants/image-formats';
import { cn } from '@/lib/utils';
import type { ImageFilters, ImageSortBy } from '@/lib/types/image';
import type { SortOrder } from '@/lib/types/common';

/**
 * 筛选栏配置接口
 */
interface GalleryFilterBarProps {
  /** 自定义样式类名 */
  className?: string;
  /** 是否显示高级筛选 */
  showAdvancedFilters?: boolean;
  /** 是否显示排序选项 */
  showSortOptions?: boolean;
  /** 是否显示统计信息 */
  showStats?: boolean;
}

/**
 * 画廊筛选条件栏组件
 */
export const GalleryFilterBar: React.FC<GalleryFilterBarProps> = ({
  className,
  showAdvancedFilters = true,
  showSortOptions = true,
  showStats = true,
}) => {
  const {
    filter,
    operations,
    stats,
  } = useWaterfallGallery();

  const [searchValue, setSearchValue] = useState(filter.filters.searchQuery || '');

  // 处理搜索
  const handleSearch = (value: string) => {
    operations.applyFilter({ searchQuery: value || undefined });
  };

  // 处理搜索输入
  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  // 处理搜索提交
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchValue);
  };

  // 处理排序变更
  const handleSortChange = (value: string) => {
    const [sortBy, order] = value.split('-') as [ImageSortBy, SortOrder];
    operations.changeSorting(sortBy, order);
  };

  // 清除筛选条件
  const handleClearFilters = () => {
    setSearchValue('');
    operations.applyFilter({
      searchQuery: undefined,
      albumId: undefined,
      mimeTypes: undefined,
      dateFrom: undefined,
      dateTo: undefined,
      publicOnly: undefined,
    });
  };

  // 筛选条件标签
  const filterTags = [];
  
  if (filter.filters.searchQuery) {
    filterTags.push({
      key: 'search',
      label: `搜索: "${filter.filters.searchQuery}"`,
      onRemove: () => operations.applyFilter({ searchQuery: undefined }),
    });
  }

  if (filter.filters.mimeTypes && filter.filters.mimeTypes.length > 0) {
    filterTags.push({
      key: 'types',
      label: `文件类型: ${filter.filters.mimeTypes.length} 个`,
      onRemove: () => operations.applyFilter({ mimeTypes: undefined }),
    });
  }

  if (filter.filters.dateFrom || filter.filters.dateTo) {
    const fromDate = filter.filters.dateFrom ? new Date(filter.filters.dateFrom).toLocaleDateString() : '';
    const toDate = filter.filters.dateTo ? new Date(filter.filters.dateTo).toLocaleDateString() : '';
    const dateLabel = fromDate && toDate 
      ? `${fromDate} - ${toDate}`
      : fromDate 
        ? `从 ${fromDate}`
        : `到 ${toDate}`;
    
    filterTags.push({
      key: 'date',
      label: `日期: ${dateLabel}`,
      onRemove: () => operations.applyFilter({ dateFrom: undefined, dateTo: undefined }),
    });
  }

  if (filter.filters.publicOnly !== undefined) {
    filterTags.push({
      key: 'public',
      label: filter.filters.publicOnly ? '仅公开图片' : '包含私有图片',
      onRemove: () => operations.applyFilter({ publicOnly: undefined }),
    });
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* 主筛选行 */}
      <div className="flex items-center gap-4">
        {/* 搜索框 */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="搜索图片..."
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </form>

        {/* 排序选择 */}
        {showSortOptions && (
          <Select
            value={`${filter.sortBy}-${filter.order}`}
            onValueChange={handleSortChange}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="排序方式" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at-desc">创建时间 (最新)</SelectItem>
              <SelectItem value="created_at-asc">创建时间 (最旧)</SelectItem>
              <SelectItem value="updated_at-desc">修改时间 (最新)</SelectItem>
              <SelectItem value="updated_at-asc">修改时间 (最旧)</SelectItem>
              <SelectItem value="filename-asc">文件名 (A-Z)</SelectItem>
              <SelectItem value="filename-desc">文件名 (Z-A)</SelectItem>
              <SelectItem value="size-desc">文件大小 (大到小)</SelectItem>
              <SelectItem value="size-asc">文件大小 (小到大)</SelectItem>
              <SelectItem value="width-desc">图片宽度 (大到小)</SelectItem>
              <SelectItem value="width-asc">图片宽度 (小到大)</SelectItem>
              <SelectItem value="height-desc">图片高度 (大到小)</SelectItem>
              <SelectItem value="height-asc">图片高度 (小到大)</SelectItem>
            </SelectContent>
          </Select>
        )}

        {/* 高级筛选 */}
        {showAdvancedFilters && (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <SlidersHorizontal className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>高级筛选</SheetTitle>
                <SheetDescription>
                  设置详细的筛选条件来查找特定的图片
                </SheetDescription>
              </SheetHeader>
              
              <div className="space-y-6 mt-6">
                {/* 文件类型筛选 */}
                <div>
                  <h4 className="text-sm font-medium mb-3">文件类型</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(SUPPORTED_IMAGE_FORMATS).map(([key, name]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox
                          id={key}
                          checked={filter.filters.mimeTypes?.includes(key as keyof typeof SUPPORTED_IMAGE_FORMATS) || false}
                          onCheckedChange={(checked) => {
                            const current = filter.filters.mimeTypes || [];
                            const updated = checked
                              ? [...current, key as keyof typeof SUPPORTED_IMAGE_FORMATS]
                              : current.filter(type => type !== key);
                            operations.applyFilter({ 
                              mimeTypes: updated.length > 0 ? updated : undefined 
                            });
                          }}
                        />
                        <label htmlFor={key} className="text-sm">
                          {name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 日期范围 */}
                <div>
                  <h4 className="text-sm font-medium mb-3">日期范围</h4>
                  <DatePickerWithRange
                    from={filter.filters.dateFrom ? new Date(filter.filters.dateFrom) : undefined}
                    to={filter.filters.dateTo ? new Date(filter.filters.dateTo) : undefined}
                    onSelect={(range) => {
                      operations.applyFilter({
                        dateFrom: range?.from?.toISOString(),
                        dateTo: range?.to?.toISOString(),
                      });
                    }}
                  />
                </div>

                {/* 公开性筛选 */}
                <div>
                  <h4 className="text-sm font-medium mb-3">图片可见性</h4>
                  <Select
                    value={filter.filters.publicOnly === undefined ? 'all' : filter.filters.publicOnly ? 'public' : 'private'}
                    onValueChange={(value) => {
                      const publicOnly = value === 'all' ? undefined : value === 'public';
                      operations.applyFilter({ publicOnly });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部图片</SelectItem>
                      <SelectItem value="public">仅公开图片</SelectItem>
                      <SelectItem value="private">仅私有图片</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 重置按钮 */}
                <Button 
                  variant="outline" 
                  onClick={handleClearFilters}
                  className="w-full"
                >
                  清除所有筛选
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>

      {/* 筛选标签和统计信息 */}
      <div className="flex items-center justify-between">
        {/* 筛选标签 */}
        <div className="flex items-center gap-2 flex-wrap">
          {filterTags.map(tag => (
            <Badge key={tag.key} variant="secondary" className="gap-1">
              {tag.label}
              <button
                onClick={tag.onRemove}
                className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          
          {filterTags.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="h-6 px-2 text-xs"
            >
              清除全部
            </Button>
          )}
        </div>

        {/* 统计信息 */}
        {showStats && (
          <div className="text-sm text-muted-foreground">
            {stats.isLoading ? (
              '加载中...'
            ) : (
              <>
                共 {stats.totalImages} 张图片
                {stats.selectedCount > 0 && (
                  <span className="ml-2">
                    已选择 {stats.selectedCount} 张
                  </span>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryFilterBar;