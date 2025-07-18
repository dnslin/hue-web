"use client";

import { useState, useEffect } from "react";
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
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      try {
        setLoading(true);
        setError(false);
        
        const imageData = await getImageData(imageId, thumb);
        
        if (imageData) {
          setImageSrc(imageData);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('加载图片失败:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadImage();
  }, [imageId, thumb]);

  if (loading) {
    return (
      <div className={`bg-muted animate-pulse flex items-center justify-center ${className}`}>
        <span className="text-xs text-muted-foreground">加载中...</span>
      </div>
    );
  }

  if (error || !imageSrc) {
    return (
      <div className={`bg-muted flex items-center justify-center ${className}`}>
        <span className="text-xs text-muted-foreground">无法加载</span>
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={fileName}
      className={className}
    />
  );
}