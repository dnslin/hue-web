"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { useImageFilterStore } from "@/lib/store/images";
import { ImageSortBy, ModerationStatus, ImageProcessingStatus } from "@/lib/types/image";
import { cn } from "@/lib/utils";

export function ImageFilters() {
  const { filters, updateFilters, resetFilters } = useImageFilterStore();
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});

  const handleFilterChange = (key: string, value: any) => {
    updateFilters({ [key]: value });
  };

  const handleDateRangeChange = (range: { from?: Date; to?: Date }) => {
    setDateRange(range);
    updateFilters({
      uploadedAfter: range.from ? range.from.toISOString() : undefined,
      uploadedBefore: range.to ? range.to.toISOString() : undefined,
    });
  };

  const clearFilter = (key: string) => {
    if (key === 'dateRange') {
      setDateRange({});
      updateFilters({ uploadedAfter: undefined, uploadedBefore: undefined });
    } else {
      updateFilters({ [key]: undefined });
    }
  };

  const activeFilters = [
    filters.mimeType && { key: 'mimeType', label: '文件类型', value: filters.mimeType },
    filters.uploaderUsername && { key: 'uploaderUsername', label: '上传者', value: filters.uploaderUsername },
    filters.minSize && { key: 'minSize', label: '最小尺寸', value: `${filters.minSize} bytes` },
    filters.maxSize && { key: 'maxSize', label: '最大尺寸', value: `${filters.maxSize} bytes` },
    filters.isPublic !== undefined && { key: 'isPublic', label: '可见性', value: filters.isPublic ? '公开' : '私有' },
    filters.processingStatus && { key: 'processingStatus', label: '处理状态', value: filters.processingStatus },
    filters.moderationStatus && { key: 'moderationStatus', label: '审核状态', value: filters.moderationStatus },
    (dateRange.from || dateRange.to) && { 
      key: 'dateRange', 
      label: '上传时间', 
      value: `${dateRange.from ? format(dateRange.from, 'yyyy-MM-dd', { locale: zhCN }) : '开始'} - ${dateRange.to ? format(dateRange.to, 'yyyy-MM-dd', { locale: zhCN }) : '结束'}` 
    },
  ].filter(Boolean) as Array<{ key: string; label: string; value: string }>;

  return (
    <div className="space-y-4">
      {/* 筛选器控件 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 文件类型筛选 */}
        <div className="space-y-2">
          <Label>文件类型</Label>
          <Select 
            value={filters.mimeType || ''} 
            onValueChange={(value) => handleFilterChange('mimeType', value || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="选择文件类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">全部类型</SelectItem>
              <SelectItem value="image/jpeg">JPEG</SelectItem>
              <SelectItem value="image/png">PNG</SelectItem>
              <SelectItem value="image/gif">GIF</SelectItem>
              <SelectItem value="image/webp">WebP</SelectItem>
              <SelectItem value="image/svg+xml">SVG</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 上传者筛选 */}
        <div className="space-y-2">
          <Label>上传者</Label>
          <Input
            placeholder="输入用户名"
            value={filters.uploaderUsername || ''}
            onChange={(e) => handleFilterChange('uploaderUsername', e.target.value || undefined)}
          />
        </div>

        {/* 可见性筛选 */}
        <div className="space-y-2">
          <Label>可见性</Label>
          <Select 
            value={filters.isPublic?.toString() || ''} 
            onValueChange={(value) => 
              handleFilterChange('isPublic', value === '' ? undefined : value === 'true')
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="选择可见性" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">全部</SelectItem>
              <SelectItem value="true">公开</SelectItem>
              <SelectItem value="false">私有</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 上传时间筛选 */}
        <div className="space-y-2">
          <Label>上传时间</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !(dateRange.from || dateRange.to) && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "yyyy-MM-dd", { locale: zhCN })} -{" "}
                      {format(dateRange.to, "yyyy-MM-dd", { locale: zhCN })}
                    </>
                  ) : (
                    format(dateRange.from, "yyyy-MM-dd", { locale: zhCN })
                  )
                ) : (
                  <span>选择日期范围</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={dateRange}
                onSelect={handleDateRangeChange}
                numberOfMonths={2}
                locale={zhCN}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* 高级筛选 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 文件大小范围 */}
        <div className="space-y-2">
          <Label>文件大小 (KB)</Label>
          <div className="flex gap-2">
            <Input
              placeholder="最小"
              type="number"
              value={filters.minSize ? Math.round(filters.minSize / 1024) : ''}
              onChange={(e) => 
                handleFilterChange('minSize', e.target.value ? Number(e.target.value) * 1024 : undefined)
              }
            />
            <Input
              placeholder="最大"
              type="number"
              value={filters.maxSize ? Math.round(filters.maxSize / 1024) : ''}
              onChange={(e) => 
                handleFilterChange('maxSize', e.target.value ? Number(e.target.value) * 1024 : undefined)
              }
            />
          </div>
        </div>

        {/* 处理状态 */}
        <div className="space-y-2">
          <Label>处理状态</Label>
          <Select 
            value={filters.processingStatus || ''} 
            onValueChange={(value) => handleFilterChange('processingStatus', value || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="选择处理状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">全部状态</SelectItem>
              <SelectItem value={ImageProcessingStatus.PENDING}>待处理</SelectItem>
              <SelectItem value={ImageProcessingStatus.PROCESSING}>处理中</SelectItem>
              <SelectItem value={ImageProcessingStatus.COMPLETED}>已完成</SelectItem>
              <SelectItem value={ImageProcessingStatus.FAILED}>处理失败</SelectItem>
              <SelectItem value={ImageProcessingStatus.OPTIMIZING}>优化中</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 审核状态 */}
        <div className="space-y-2">
          <Label>审核状态</Label>
          <Select 
            value={filters.moderationStatus || ''} 
            onValueChange={(value) => handleFilterChange('moderationStatus', value || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="选择审核状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">全部状态</SelectItem>
              <SelectItem value={ModerationStatus.PENDING}>待审核</SelectItem>
              <SelectItem value={ModerationStatus.APPROVED}>已通过</SelectItem>
              <SelectItem value={ModerationStatus.REJECTED}>已拒绝</SelectItem>
              <SelectItem value={ModerationStatus.FLAGGED}>已标记</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 排序选项 */}
      <div className="flex items-center gap-4">
        <div className="space-y-2">
          <Label>排序方式</Label>
          <Select 
            value={filters.sortBy || ImageSortBy.UPLOADED_AT} 
            onValueChange={(value) => handleFilterChange('sortBy', value)}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ImageSortBy.UPLOADED_AT}>上传时间</SelectItem>
              <SelectItem value={ImageSortBy.FILENAME}>文件名</SelectItem>
              <SelectItem value={ImageSortBy.SIZE}>文件大小</SelectItem>
              <SelectItem value={ImageSortBy.VIEW_COUNT}>浏览次数</SelectItem>
              <SelectItem value={ImageSortBy.DOWNLOAD_COUNT}>下载次数</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>排序顺序</Label>
          <Select 
            value={filters.sortOrder || 'desc'} 
            onValueChange={(value) => handleFilterChange('sortOrder', value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">降序</SelectItem>
              <SelectItem value="asc">升序</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 活跃筛选器显示 */}
      {activeFilters.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>当前筛选条件 ({activeFilters.length})</Label>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={resetFilters}
              className="h-6 px-2 text-xs"
            >
              清除全部
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter) => (
              <Badge key={filter.key} variant="secondary" className="pr-1">
                <span className="mr-1">
                  <strong>{filter.label}:</strong> {filter.value}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearFilter(filter.key)}
                  className="h-auto p-0 w-4 h-4 hover:bg-transparent"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}