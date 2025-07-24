"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc,
  X,
  CheckSquare,
  Square,
  Trash2,
  FolderPlus,
  Download,
  Share2
} from "lucide-react";
import type { WaterfallGalleryConfig, GalleryQueryParams } from "@/lib/types/gallery";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ShimmerButton } from "@/components/magicui/shimmer-button";

interface GalleryToolbarProps {
  /** 画廊配置 */
  config: WaterfallGalleryConfig;
  /** 当前查询参数 */
  queryParams: GalleryQueryParams;
  /** 选中项数量 */
  selectedCount: number;
  /** 是否在选择模式 */
  isSelectionMode: boolean;
  /** 查询参数变化回调 */
  onQueryChange?: (params: GalleryQueryParams) => void;
  /** 批量操作回调 */
  onBatchOperation?: (operation: string, params?: Record<string, unknown>) => void;
  /** 清空选择回调 */
  onClearSelection?: () => void;
  /** 全选回调 */
  onSelectAll?: () => void;
  /** 切换选择模式回调 */
  onToggleSelectionMode?: () => void;
}

/**
 * 图片画廊工具栏组件
 * 包含搜索、筛选、排序、批量操作等功能
 */
export const GalleryToolbar: React.FC<GalleryToolbarProps> = ({
  queryParams,
  selectedCount,
  isSelectionMode,
  onQueryChange,
  onBatchOperation,
  onClearSelection,
  onSelectAll,
  onToggleSelectionMode,
}) => {
  const [searchQuery, setSearchQuery] = useState(queryParams.filters?.searchQuery || "");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // 搜索处理
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    
    const newParams: GalleryQueryParams = {
      ...queryParams,
      filters: {
        ...queryParams.filters,
        searchQuery: value || undefined,
      },
      page: 1, // 重置页码
    };
    
    onQueryChange?.(newParams);
  }, [queryParams, onQueryChange]);

  // 排序处理
  const handleSortChange = useCallback((sortBy: string) => {
    const newParams: GalleryQueryParams = {
      ...queryParams,
      sortBy: sortBy as 'created_at' | 'updated_at' | 'filename' | 'size' | 'width' | 'height',
      page: 1,
    };
    
    onQueryChange?.(newParams);
  }, [queryParams, onQueryChange]);

  // 排序方向处理
  const handleOrderChange = useCallback(() => {
    const newParams: GalleryQueryParams = {
      ...queryParams,
      order: queryParams.order === 'asc' ? 'desc' : 'asc',
      page: 1,
    };
    
    onQueryChange?.(newParams);
  }, [queryParams, onQueryChange]);

  // 批量操作处理
  const handleBatchAction = useCallback((action: string, params?: Record<string, unknown>) => {
    onBatchOperation?.(action, params);
  }, [onBatchOperation]);

  // 渲染搜索区域
  const renderSearchArea = () => (
    <div className="relative flex-1 max-w-md">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="搜索图片..."
        value={searchQuery}
        onChange={(e) => handleSearchChange(e.target.value)}
        className="pl-10 pr-4"
      />
      {searchQuery && (
        <Button
          size="icon"
          variant="ghost"
          className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2"
          onClick={() => handleSearchChange("")}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );

  // 渲染筛选和排序控件
  const renderFilterControls = () => (
    <div className="flex items-center gap-2">
      {/* 排序选择 */}
      <Select value={queryParams.sortBy || 'created_at'} onValueChange={handleSortChange}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="排序" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="created_at">创建时间</SelectItem>
          <SelectItem value="updated_at">修改时间</SelectItem>
          <SelectItem value="filename">文件名</SelectItem>
          <SelectItem value="size">文件大小</SelectItem>
          <SelectItem value="width">图片宽度</SelectItem>
          <SelectItem value="height">图片高度</SelectItem>
        </SelectContent>
      </Select>

      {/* 排序方向 */}
      <Button
        size="icon"
        variant="outline"
        onClick={handleOrderChange}
        title={queryParams.order === 'asc' ? '升序' : '降序'}
      >
        {queryParams.order === 'asc' ? (
          <SortAsc className="h-4 w-4" />
        ) : (
          <SortDesc className="h-4 w-4" />
        )}
      </Button>

      {/* 高级筛选 */}
      <Button
        size="icon"
        variant={isFilterOpen ? "default" : "outline"}
        onClick={() => setIsFilterOpen(!isFilterOpen)}
        title="高级筛选"
      >
        <Filter className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* 选择模式切换 */}
      <Button
        size="icon"
        variant={isSelectionMode ? "default" : "outline"}
        onClick={onToggleSelectionMode}
        title="批量选择"
      >
        {isSelectionMode ? (
          <CheckSquare className="h-4 w-4" />
        ) : (
          <Square className="h-4 w-4" />
        )}
      </Button>
    </div>
  );

  // 渲染批量操作栏
  const renderBatchActions = () => {
    if (!isSelectionMode || selectedCount === 0) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-lg px-4 py-3"
      >
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="font-medium">
            已选择 {selectedCount} 项
          </Badge>
          
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={onSelectAll}
              className="text-sm"
            >
              全选
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={onClearSelection}
              className="text-sm"
            >
              取消选择
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleBatchAction('download')}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            下载
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleBatchAction('share')}
            className="gap-2"
          >
            <Share2 className="h-4 w-4" />
            分享
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleBatchAction('move_to_album')}
            className="gap-2"
          >
            <FolderPlus className="h-4 w-4" />
            移动到相册
          </Button>

          <Separator orientation="vertical" className="h-6" />
          
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleBatchAction('delete')}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            删除
          </Button>
        </div>
      </motion.div>
    );
  };

  // 渲染高级筛选面板
  const renderAdvancedFilters = () => {
    if (!isFilterOpen) return null;

    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="border border-border rounded-lg p-4 bg-card"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 文件类型筛选 */}
          <div>
            <label className="text-sm font-medium mb-2 block">文件类型</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="选择类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="image/jpeg">JPEG</SelectItem>
                <SelectItem value="image/png">PNG</SelectItem>
                <SelectItem value="image/gif">GIF</SelectItem>
                <SelectItem value="image/webp">WebP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 日期范围 */}
          <div>
            <label className="text-sm font-medium mb-2 block">创建日期</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="选择范围" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">今天</SelectItem>
                <SelectItem value="week">最近一周</SelectItem>
                <SelectItem value="month">最近一月</SelectItem>
                <SelectItem value="year">最近一年</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 文件大小 */}
          <div>
            <label className="text-sm font-medium mb-2 block">文件大小</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="选择范围" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">小于 1MB</SelectItem>
                <SelectItem value="medium">1MB - 10MB</SelectItem>
                <SelectItem value="large">大于 10MB</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              // 重置筛选条件
              onQueryChange?.({
                ...queryParams,
                filters: undefined,
                page: 1,
              });
            }}
          >
            重置
          </Button>
          
          <ShimmerButton
            onClick={() => setIsFilterOpen(false)}
            className="h-8 px-3 text-sm"
          >
            应用筛选
          </ShimmerButton>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="p-4 space-y-4">
        {/* 主工具栏 */}
        <div className="flex items-center gap-4">
          {renderSearchArea()}
          {renderFilterControls()}
        </div>

        {/* 高级筛选面板 */}
        <AnimatePresence>
          {renderAdvancedFilters()}
        </AnimatePresence>

        {/* 批量操作栏 */}
        <AnimatePresence>
          {renderBatchActions()}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GalleryToolbar;