"use client";

import { useEffect, useState } from "react";
import { Plus, Upload, Grid3X3, List, Search, Filter, CheckSquare, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ImageGallery } from "./gallery";
import { ImageUploadDialog } from "./upload-dialog";
import { ImageFilters } from "./filters";
import { BatchActions } from "./batch-actions";
import { 
  useImageListData, 
  useImageListActions, 
  useImageSelectionStore
} from "@/lib/store/images";
import { showToast } from "@/lib/utils/toast";

interface ImageListProps {
  isMobile?: boolean;
}

export function ImageList({ }: ImageListProps) {
  const { images, total, loading, error } = useImageListData();
  const { fetchImages } = useImageListActions();
  const { clearSelection } = useImageSelectionStore();
  const [showUpload, setShowUpload] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectionMode, setSelectionMode] = useState(false);

  // 当选择模式关闭时，清空选择
  useEffect(() => {
    if (!selectionMode) {
      clearSelection();
    }
  }, [selectionMode, clearSelection]);

  useEffect(() => {
    // 初始化加载图片数据
    fetchImages();
  }, [fetchImages]);

  useEffect(() => {
    if (error) {
      showToast.error("加载图片失败", error);
    }
  }, [error]);

  return (
    <div className="space-y-6">
      {/* 页面标题和主要操作 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">图片库</h1>
          <p className="text-sm text-muted-foreground mt-1">
            浏览和管理您的图片资源 · 共 {total} 张图片
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowUpload(true)}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            上传图片
          </Button>
        </div>
      </div>

      {/* 搜索和筛选栏 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* 搜索框 */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索图片名称、标签..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* 视图切换和筛选 */}
            <div className="flex gap-2">
              <Button
                variant={showFilters ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                筛选
              </Button>
              
              <Button
                variant={selectionMode ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectionMode(!selectionMode)}
                className="gap-2"
              >
                {selectionMode ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                选择
              </Button>
              
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none border-r"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* 高级筛选器 */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t">
              <ImageFilters />
            </div>
          )}
        </CardContent>
      </Card>

      {/* 批量操作栏 */}
      {selectionMode && <BatchActions />}

      {/* 图片网格/列表 */}
      <div className="min-h-[400px]">
        {loading && images.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="aspect-square bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
              <div className="text-center text-muted-foreground mt-6">
                正在加载图片...
              </div>
            </CardContent>
          </Card>
        ) : images.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Upload className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">还没有图片</h3>
                <p className="text-muted-foreground mb-4">
                  开始上传您的第一张图片吧
                </p>
                <Button onClick={() => setShowUpload(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  上传图片
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <ImageGallery 
            images={images} 
            viewMode={viewMode}
            selectionMode={selectionMode}
          />
        )}
      </div>

      {/* 上传对话框 */}
      <ImageUploadDialog 
        open={showUpload} 
        onOpenChange={setShowUpload}
        onSuccess={() => {
          fetchImages(); // 重新加载图片列表
          showToast.success("图片上传成功");
        }}
      />
    </div>
  );
}