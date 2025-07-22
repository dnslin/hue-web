"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getImageData } from "@/lib/actions/images/image";

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
      
      const imageData = await getImageData(imageId, thumb);
      
      if (imageData) {
        setImageSrc(imageData);
      } else {
        setError('服务器返回空数据');
      }
    } catch (err: any) {
      const errorMsg = err?.msg || err?.message || '未知错误';
      setError(errorMsg);
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