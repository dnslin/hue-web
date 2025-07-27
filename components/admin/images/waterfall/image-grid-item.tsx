// components/admin/images/waterfall/image-grid-item.tsx
// 瀑布流图片项组件

'use client';

import { useState, useCallback, useRef } from 'react';
import { motion } from 'motion/react';

import { ImageGridItemProps, ImageDimensions, GALLERY_CONSTANTS } from '@/lib/types/gallery';
import { ImageItem } from '@/lib/types/image';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MagicCard } from '@/components/magicui/magic-card';
import { ShimmerButton } from '@/components/magicui/shimmer-button';
import { AuthenticatedImage } from '@/components/shared/authenticated-image';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import {
  Eye,
  Download,
  Edit,
  Trash2,
  MoreVertical,
  Check,
  FileImage,
  Calendar,
  User,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { formatBytes } from '@/lib/utils/date-formatter';

/**
 * 图片项元数据组件
 */
const ImageMetadata = ({ image }: { image: ImageItem }) => (
  <div className="p-3 space-y-2">
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium truncate flex-1 mr-2">
        {image.originalFilename}
      </span>
      <Badge variant="secondary" className="text-xs">
        {formatBytes(image.size)}
      </Badge>
    </div>
    
    <div className="flex items-center gap-4 text-xs text-muted-foreground">
      <div className="flex items-center gap-1">
        <FileImage className="size-3" />
        <span>{image.width} × {image.height}</span>
      </div>
      
      <div className="flex items-center gap-1">
        <Eye className="size-3" />
        <span>{image.viewCount}</span>
      </div>
      
      <div className="flex items-center gap-1">
        <Download className="size-3" />
        <span>{image.downloadCount}</span>
      </div>
    </div>
    
    {image.uploaderUsername && (
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <User className="size-3" />
        <span className="truncate">{image.uploaderUsername}</span>
      </div>
    )}
  </div>
);

/**
 * 图片操作按钮组件
 */
const ImageActions = ({ 
  image, 
  onPreview, 
  onEdit, 
  onDelete,
  index 
}: { 
  image: ImageItem;
  onPreview?: (image: ImageItem, index: number) => void;
  onEdit?: (image: ImageItem) => void;
  onDelete?: (image: ImageItem) => void;
  index: number;
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        size="sm"
        variant="ghost"
        className="size-8 p-0 hover:bg-background/80 backdrop-blur-sm"
      >
        <MoreVertical className="size-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-48">
      {onPreview && (
        <DropdownMenuItem onClick={() => onPreview(image, index)}>
          <Eye className="mr-2 size-4" />
          预览
        </DropdownMenuItem>
      )}
      
      <DropdownMenuItem onClick={() => window.open(image.url, '_blank')}>
        <Download className="mr-2 size-4" />
        下载
      </DropdownMenuItem>
      
      {onEdit && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onEdit(image)}>
            <Edit className="mr-2 size-4" />
            编辑
          </DropdownMenuItem>
        </>
      )}
      
      {onDelete && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => onDelete(image)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 size-4" />
            删除
          </DropdownMenuItem>
        </>
      )}
    </DropdownMenuContent>
  </DropdownMenu>
);

/**
 * 瀑布流图片项组件
 */
const ImageGridItem: React.FC<ImageGridItemProps> = ({
  image,
  index,
  width,
  selected = false,
  loading = false,
  onClick,
  onSelect,
  onPreview,
  onEdit,
  onDelete,
  onLoad,
  onError,
  borderRadius = 12,
  showOverlay = true,
  showActions = true,
  showMetadata = true,
  enableHoverEffect = true,
  enableSelectAnimation = true,
  className = '',
  style,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  // 计算图片显示高度
  const calculateHeight = useCallback(() => {
    if (!image.dimensions && (image.width && image.height)) {
      const aspectRatio = image.width / image.height;
      return width / aspectRatio;
    }
    
    if (image.dimensions) {
      return width / image.dimensions.aspectRatio;
    }
    
    return width * 1.2; // 默认高度比例
  }, [image.dimensions, image.width, image.height, width]);

  const displayHeight = calculateHeight();

  // 处理图片加载完成
  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
    setImageError(false);
    
    if (imageRef.current && onLoad) {
      const { naturalWidth, naturalHeight } = imageRef.current;
      const dimensions: ImageDimensions = {
        width: naturalWidth,
        height: naturalHeight,
        aspectRatio: naturalWidth / naturalHeight,
        displayWidth: width,
        displayHeight: width / (naturalWidth / naturalHeight),
      };
      onLoad(image.id, dimensions);
    }
  }, [image.id, width, onLoad]);

  // 处理图片加载错误
  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(false);
    
    if (onError) {
      onError(image.id, '图片加载失败');
    }
  }, [image.id, onError]);

  // 处理点击事件
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (onSelect && (e.ctrlKey || e.metaKey)) {
      onSelect(image.id);
    } else if (onClick) {
      onClick(image, index);
    } else if (onPreview) {
      onPreview(image, index);
    }
  }, [image, index, onClick, onSelect, onPreview]);

  // 处理选择按钮点击
  const handleSelectClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(image.id);
    }
  }, [image.id, onSelect]);

  return (
    <motion.div
      className={cn('relative group cursor-pointer', className)}
      style={{
        width: width,
        ...style,
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        y: selected && enableSelectAnimation ? -4 : 0,
      }}
      whileHover={enableHoverEffect ? { y: -2 } : undefined}
      transition={{
        duration: GALLERY_CONSTANTS.ANIMATION_CONFIG.STANDARD_DURATION / 1000,
        ease: GALLERY_CONSTANTS.ANIMATION_CONFIG.EASING,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <MagicCard
        className={cn(
          'overflow-hidden border-2 transition-all duration-200',
          selected 
            ? 'border-primary ring-2 ring-primary/20' 
            : 'border-transparent hover:border-primary/50',
          imageError && 'border-destructive/50'
        )}
        style={{ borderRadius }}
        gradientColor={selected ? 'var(--primary)' : undefined}
      >
        {/* 选择指示器 */}
        {onSelect && (
          <div className="absolute top-2 left-2 z-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: selected ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="size-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg">
                <Check className="size-4" />
              </div>
            </motion.div>
            
            {!selected && (
              <Button
                size="sm"
                variant="ghost"
                className={cn(
                  'size-6 p-0 bg-background/80 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground transition-all',
                  'opacity-0 group-hover:opacity-100'
                )}
                onClick={handleSelectClick}
              >
                <div className="size-4 border-2 border-current rounded-full" />
              </Button>
            )}
          </div>
        )}

        {/* 操作按钮 */}
        {showActions && (
          <div className="absolute top-2 right-2 z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: isHovered || selected ? 1 : 0,
                scale: isHovered || selected ? 1 : 0.8,
              }}
              transition={{ duration: 0.2 }}
            >
              <ImageActions
                image={image}
                index={index}
                onPreview={onPreview}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </motion.div>
          </div>
        )}

        {/* 图片内容 */}
        <div className="relative">
          {loading || !imageLoaded ? (
            <div 
              className="bg-muted animate-pulse flex items-center justify-center"
              style={{ width, height: displayHeight }}
            >
              <FileImage className="size-8 text-muted-foreground" />
            </div>
          ) : imageError ? (
            <div 
              className="bg-destructive/10 border border-destructive/20 flex items-center justify-center"
              style={{ width, height: displayHeight }}
            >
              <div className="text-center">
                <FileImage className="size-8 text-destructive mx-auto mb-2" />
                <p className="text-xs text-destructive">加载失败</p>
              </div>
            </div>
          ) : (
            <AuthenticatedImage
              ref={imageRef}
              src={image.thumbnailUrl || image.url}
              alt={image.originalFilename}
              width={width}
              height={displayHeight}
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              onLoad={handleImageLoad}
              onError={handleImageError}
              draggable={false}
            />
          )}

          {/* 悬浮覆盖层 */}
          {showOverlay && (
            <motion.div
              className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200"
              initial={false}
              animate={{ opacity: isHovered ? 1 : 0 }}
            />
          )}
        </div>

        {/* 元数据信息 */}
        {showMetadata && <ImageMetadata image={image} />}
      </MagicCard>
    </motion.div>
  );
};

export default ImageGridItem;