// components/gallery/gallery-toolbar.tsx
// 画廊工具栏组件

'use client';

import React from 'react';
import { 
  Grid3X3, 
  List, 
  X, 
  Eye, 
  Edit, 
  Download, 
  Trash2, 
  Archive,
  Share2,
  MoreHorizontal,
  CheckSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useWaterfallGallery } from '@/lib/store/gallery';
import { cn } from '@/lib/utils';

/**
 * 视图模式类型
 */
export type ViewMode = 'masonry' | 'grid' | 'list';

/**
 * 工具栏配置接口
 */
interface GalleryToolbarProps {
  /** 自定义样式类名 */
  className?: string;
  /** 当前视图模式 */
  viewMode?: ViewMode;
  /** 视图模式变更回调 */
  onViewModeChange?: (mode: ViewMode) => void;
  /** 是否显示视图切换 */
  showViewToggle?: boolean;
  /** 是否显示选择工具 */
  showSelectionTools?: boolean;
  /** 批量操作回调 */
  onBatchOperation?: (operation: string, selectedIds: number[]) => void;
}

/**
 * 画廊工具栏组件
 */
export const GalleryToolbar: React.FC<GalleryToolbarProps> = ({
  className,
  viewMode = 'masonry',
  onViewModeChange,
  showViewToggle = true,
  showSelectionTools = true,
  onBatchOperation,
}) => {
  const {
    selection,
    operations,
    stats,
  } = useWaterfallGallery();

  // 处理进入选择模式
  const handleEnterSelectionMode = () => {
    operations.enterSelectionMode();
  };

  // 处理退出选择模式
  const handleExitSelectionMode = () => {
    operations.exitSelectionMode();
  };

  // 处理全选
  const handleSelectAll = () => {
    operations.selectAll();
  };

  // 处理批量操作
  const handleBatchAction = (action: string) => {
    const selectedIds = selection.getSelectedIds();
    if (selectedIds.length === 0) return;

    switch (action) {
      case 'delete':
        operations.batchDelete();
        break;
      case 'preview':
        if (selectedIds.length === 1) {
          operations.openPreview(selectedIds[0]);
        }
        break;
      case 'edit':
        if (selectedIds.length === 1) {
          operations.openEditor(selectedIds[0]);
        }
        break;
      default:
        onBatchOperation?.(action, selectedIds);
    }
  };

  return (
    <div className={cn(
      'flex items-center justify-between gap-4 p-4 bg-background border-b',
      className
    )}>
      {/* 左侧：视图控制 */}
      <div className="flex items-center gap-2">
        {/* 视图模式切换 */}
        {showViewToggle && (
          <>
            <div className="flex items-center border rounded-md">
              <Button
                variant={viewMode === 'masonry' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-r-none"
                onClick={() => onViewModeChange?.('masonry')}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-none"
                onClick={() => onViewModeChange?.('grid')}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-l-none"
                onClick={() => onViewModeChange?.('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
            <Separator orientation="vertical" className="h-6" />
          </>
        )}

        {/* 选择模式控制 */}
        {showSelectionTools && !selection.isSelectionMode && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleEnterSelectionMode}
          >
            <CheckSquare className="w-4 h-4 mr-2" />
            选择
          </Button>
        )}
      </div>

      {/* 中间：选择模式工具栏 */}
      {selection.isSelectionMode && (
        <div className="flex items-center gap-2 flex-1">
          {/* 选择状态 */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              已选择 {stats.selectedCount} / {stats.totalImages} 项
            </Badge>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
            >
              <CheckSquare className="w-4 h-4 mr-1" />
              全选
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* 批量操作按钮 */}
          <div className="flex items-center gap-1">
            {/* 预览 - 仅单选时可用 */}
            {stats.selectedCount === 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleBatchAction('preview')}
              >
                <Eye className="w-4 h-4" />
              </Button>
            )}

            {/* 编辑 - 仅单选时可用 */}
            {stats.selectedCount === 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleBatchAction('edit')}
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}

            {/* 下载 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleBatchAction('download')}
              disabled={stats.selectedCount === 0}
            >
              <Download className="w-4 h-4" />
            </Button>

            {/* 分享 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleBatchAction('share')}
              disabled={stats.selectedCount === 0}
            >
              <Share2 className="w-4 h-4" />
            </Button>

            {/* 更多操作 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={stats.selectedCount === 0}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleBatchAction('move_to_album')}>
                  <Archive className="w-4 h-4 mr-2" />
                  移动到相册
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBatchAction('set_public')}>
                  <Eye className="w-4 h-4 mr-2" />
                  设为公开
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBatchAction('set_private')}>
                  <Eye className="w-4 h-4 mr-2" />
                  设为私有
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => handleBatchAction('delete')}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  删除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}

      {/* 右侧：操作按钮 */}
      <div className="flex items-center gap-2">
        {selection.isSelectionMode && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExitSelectionMode}
          >
            <X className="w-4 h-4 mr-2" />
            取消选择
          </Button>
        )}

        {!selection.isSelectionMode && (
          <>
            {/* 刷新按钮 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => operations.refresh()}
              disabled={stats.isLoading}
            >
              刷新
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default GalleryToolbar;