"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MoreVertical, 
  Download, 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  FileImage,
  User
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ImageItem } from "@/lib/types/image";
import { ImagePreviewDialog } from "./preview-dialog";
import { formatFileSize, formatDate } from "@/lib/dashboard/formatters";

interface ImageGalleryProps {
  images: ImageItem[];
  viewMode: 'grid' | 'list';
  loading?: boolean;
}

export function ImageGallery({ images, viewMode, loading }: ImageGalleryProps) {
  const [previewImage, setPreviewImage] = useState<ImageItem | null>(null);

  if (viewMode === 'grid') {
    return (
      <>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {images.map((image) => (
            <ImageGridItem 
              key={image.id} 
              image={image} 
              onPreview={setPreviewImage}
            />
          ))}
        </div>
        
        <ImagePreviewDialog 
          image={previewImage}
          open={!!previewImage}
          onOpenChange={(open) => !open && setPreviewImage(null)}
        />
      </>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {images.map((image) => (
          <ImageListItem 
            key={image.id} 
            image={image} 
            onPreview={setPreviewImage}
          />
        ))}
      </div>
      
      <ImagePreviewDialog 
        image={previewImage}
        open={!!previewImage}
        onOpenChange={(open) => !open && setPreviewImage(null)}
      />
    </>
  );
}

interface ImageItemProps {
  image: ImageItem;
  onPreview: (image: ImageItem) => void;
}

function ImageGridItem({ image, onPreview }: ImageItemProps) {
  const handleAction = (action: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    switch (action) {
      case 'preview':
        onPreview(image);
        break;
      case 'download':
        // TODO: 实现下载功能
        console.log('Download image:', image.id);
        break;
      case 'edit':
        // TODO: 实现编辑功能
        console.log('Edit image:', image.id);
        break;
      case 'delete':
        // TODO: 实现删除功能
        console.log('Delete image:', image.id);
        break;
    }
  };

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer">
      <CardContent className="p-0">
        {/* 图片区域 */}
        <div 
          className="aspect-square relative overflow-hidden"
          onClick={() => onPreview(image)}
        >
          <img
            src={image.thumbnailUrl || image.url}
            alt={image.originalFilename}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
            loading="lazy"
          />
          
          {/* 悬停时显示的操作按钮 */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={(e) => handleAction('preview', e)}
                className="h-8 w-8 p-0"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={(e) => handleAction('download', e)}
                className="h-8 w-8 p-0"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* 右上角的操作菜单 */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 w-8 p-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => handleAction('preview', e)}>
                  <Eye className="h-4 w-4 mr-2" />
                  预览
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => handleAction('download', e)}>
                  <Download className="h-4 w-4 mr-2" />
                  下载
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => handleAction('edit', e)}>
                  <Edit className="h-4 w-4 mr-2" />
                  编辑
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={(e) => handleAction('delete', e)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  删除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* 图片信息 */}
        <div className="p-3">
          <div className="text-sm font-medium truncate mb-1">
            {image.originalFilename}
          </div>
          <div className="text-xs text-muted-foreground">
            {formatFileSize(image.size)} · {image.width}×{image.height}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ImageListItem({ image, onPreview }: ImageItemProps) {
  const handleAction = (action: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    switch (action) {
      case 'preview':
        onPreview(image);
        break;
      case 'download':
        console.log('Download image:', image.id);
        break;
      case 'edit':
        console.log('Edit image:', image.id);
        break;
      case 'delete':
        console.log('Delete image:', image.id);
        break;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* 缩略图 */}
          <div 
            className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0"
            onClick={() => onPreview(image)}
          >
            <img
              src={image.thumbnailUrl || image.url}
              alt={image.originalFilename}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          
          {/* 图片信息 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <h3 className="font-medium truncate">{image.originalFilename}</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                  <span className="flex items-center gap-1">
                    <FileImage className="h-3 w-3" />
                    {formatFileSize(image.size)}
                  </span>
                  <span>{image.width}×{image.height}</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(image.uploadedAt)}
                  </span>
                  {image.uploaderUsername && (
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {image.uploaderUsername}
                    </span>
                  )}
                </div>
                
                {/* 标签 */}
                {image.tags && image.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {image.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {image.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{image.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
              
              {/* 操作按钮 */}
              <div className="flex gap-1 ml-4">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => handleAction('preview', e)}
                  className="h-8 w-8 p-0"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => handleAction('download', e)}
                  className="h-8 w-8 p-0"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => handleAction('edit', e)}>
                      <Edit className="h-4 w-4 mr-2" />
                      编辑
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={(e) => handleAction('delete', e)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      删除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}