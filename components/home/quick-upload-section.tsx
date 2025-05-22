"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Copy, ExternalLink } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

export function QuickUploadSection() {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // 处理拖放事件
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    // 这里仅为演示，实际开发时需要替换为真实的上传逻辑
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  // 处理文件选择
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  // 处理上传
  const handleUpload = (file: File) => {
    // 演示用，实际开发时需要替换为真实的上传API调用
    setIsUploading(true);

    // 模拟上传过程
    setTimeout(() => {
      const objectUrl = URL.createObjectURL(file);
      setUploadedImage(objectUrl);
      setImageUrl(`https://example.com/images/${file.name}`);
      setIsUploading(false);
    }, 1500);
  };

  // 复制链接
  const copyToClipboard = () => {
    if (imageUrl) {
      navigator.clipboard.writeText(imageUrl);
      // 这里可以添加复制成功的提示
    }
  };

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-3xl font-bold tracking-tight">快速体验</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            无需注册，立即体验Lsky Pro的便捷上传
          </p>
        </div>

        <Card className="max-w-3xl mx-auto border-2">
          <CardContent className="p-6">
            {!uploadedImage ? (
              <div
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/20 hover:border-primary/50"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium">上传您的图片</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      拖放文件到此处，或者{" "}
                      <label className="text-primary cursor-pointer hover:underline">
                        浏览
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                      </label>
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    支持 JPG, PNG, GIF, WebP 等格式，单个文件最大 5MB
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="relative aspect-video rounded-lg overflow-hidden border">
                  {uploadedImage && (
                    <Image
                      src={uploadedImage}
                      alt="Uploaded preview"
                      className="object-contain"
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={imageUrl || ""}
                      readOnly
                      className="w-full h-10 pl-3 pr-10 border rounded-md"
                    />
                    <button
                      onClick={copyToClipboard}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(uploadedImage, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      查看
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setUploadedImage(null);
                        setImageUrl(null);
                      }}
                    >
                      再次上传
                    </Button>
                  </div>
                </div>

                <div className="text-center pt-2">
                  <p className="text-sm text-muted-foreground">
                    注册账号以获得更多功能，如图片管理、分享设置等
                  </p>
                </div>
              </div>
            )}

            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                  <p className="text-sm font-medium">正在上传...</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
