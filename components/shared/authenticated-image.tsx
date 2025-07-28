"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getImageViewAction } from "@/lib/actions/images/image";

interface AuthenticatedImageProps {
  imageId: string;
  fileName: string;
  className?: string;
  thumb?: boolean;
}

export function AuthenticatedImage({ 
  imageId, 
  fileName, 
  className = "",
  thumb = false 
}: AuthenticatedImageProps) {
  const [imageSrc, setImageSrc] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 2;

  const loadImage = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const imageData = await getImageViewAction(imageId, thumb);
      
      // 如果是字符串，说明成功获取到图片数据
      if (typeof imageData === 'string') {
        setImageSrc(imageData);
      } else if (imageData === null) {
        setError('服务器返回空数据');
      } else {
        // ErrorApiResponse 类型
        setError(imageData.msg || '获取图片失败');
      }
    } catch (err: any) {
      setError(err?.message || '未知错误');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (imageId) {
      loadImage();
    } else {
      setError('图片ID为空');
      setLoading(false);
    }
  }, [imageId, thumb, retryCount]);

  const handleRetry = () => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
    }
  };

  if (loading) {
    return (
      <div className={`bg-muted animate-pulse flex items-center justify-center ${className}`}>
        <span className="text-xs text-muted-foreground">加载中...</span>
      </div>
    );
  }

  if (error || !imageSrc) {
    return (
      <div className={`bg-muted flex flex-col items-center justify-center ${className} cursor-pointer`} onClick={handleRetry}>
        <span className="text-xs text-muted-foreground text-center px-1">
          {retryCount < maxRetries ? '点击重试' : '加载失败'}
        </span>
        {retryCount < maxRetries && (
          <span className="text-xs text-muted-foreground/60">({retryCount + 1}/{maxRetries + 1})</span>
        )}
      </div>
    );
  }

  // 检查是否为 base64 数据 URL
  const isBase64DataUrl = imageSrc.startsWith('data:');

  // 对于 base64 数据，使用普通的 img 标签避免 Next.js Image 警告
  if (isBase64DataUrl) {
    return (
      <img
        src={imageSrc}
        alt={fileName}
        className={`object-cover w-full h-full ${className}`}
        onError={() => {
          setError('图片渲染失败');
        }}
      />
    );
  }

  // 对于其他 URL，使用 Next.js Image 组件进行优化
  return (
    <Image
      src={imageSrc}
      alt={fileName}
      fill
      className={className}
      onError={() => {
        setError('图片渲染失败');
      }}
    />
  );
}