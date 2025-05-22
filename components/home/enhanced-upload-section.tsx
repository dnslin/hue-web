"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Copy, ExternalLink } from "lucide-react";
import { useState, useRef } from "react";
import { motion } from "framer-motion";

// 增强版BorderBeam组件实现
function BorderBeam({ className = "" }) {
  return (
    <div className={`absolute inset-0 rounded-lg overflow-hidden ${className}`}>
      {/* 边框基础 */}
      <div
        className="absolute inset-0 rounded-lg"
        style={{
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          padding: "1px",
          background: "rgba(99, 102, 241, 0.1)",
        }}
      >
        {/* 主光束 - 顺时针方向 */}
        <motion.div
          className="absolute"
          style={{
            width: 80,
            height: 80,
            background: "linear-gradient(to right, #6366f1, #8b5cf6)",
            filter: "blur(15px)",
            borderRadius: "50%",
            left: "-40px",
            top: "-40px",
            offsetPath: "path('M0,0 V100 H100 V0 H0')",
            offsetRotate: "0deg",
          }}
          animate={{
            pathLength: 1,
            offsetDistance: "100%",
          }}
          initial={{
            offsetDistance: "0%",
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* 第二个光束 - 逆时针方向 */}
        <motion.div
          className="absolute"
          style={{
            width: 60,
            height: 60,
            background: "linear-gradient(to right, #8b5cf6, #ec4899)",
            filter: "blur(12px)",
            borderRadius: "50%",
            right: "-30px",
            bottom: "-30px",
            offsetPath: "path('M100,100 H0 V0 H100 V100')",
            offsetRotate: "0deg",
          }}
          animate={{
            pathLength: 1,
            offsetDistance: "100%",
          }}
          initial={{
            offsetDistance: "0%",
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* 第三个小型光束 - 更快速 */}
        <motion.div
          className="absolute"
          style={{
            width: 30,
            height: 30,
            background: "linear-gradient(to right, #ec4899, #6366f1)",
            filter: "blur(8px)",
            borderRadius: "50%",
            right: "-15px",
            top: "-15px",
            offsetPath: "path('M100,0 V100 H0 V0 H100')",
            offsetRotate: "0deg",
          }}
          animate={{
            pathLength: 1,
            offsetDistance: "100%",
          }}
          initial={{
            offsetDistance: "0%",
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* 角落闪光效果 */}
        <div className="absolute top-0 left-0 w-4 h-4 bg-primary/30 rounded-full blur-md"></div>
        <div className="absolute top-0 right-0 w-4 h-4 bg-purple-500/30 rounded-full blur-md"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 bg-pink-500/30 rounded-full blur-md"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 bg-primary/30 rounded-full blur-md"></div>
      </div>
    </div>
  );
}

export function EnhancedUploadSection() {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // 触发文件选择
  const triggerFileSelect = () => {
    inputRef.current?.click();
  };

  return (
    <section className="py-12 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="max-w-2xl mx-auto overflow-hidden relative shadow-lg">
          {/* 添加增强版BorderBeam特效 */}
          <BorderBeam />
          <CardContent className="p-6 relative z-10">
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
                onClick={triggerFileSelect}
              >
                <motion.div
                  className="flex flex-col items-center justify-center gap-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-medium">点击或拖放上传图片</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      支持 JPG, PNG, GIF, WebP 等格式
                    </p>
                  </div>
                  <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </motion.div>
              </div>
            ) : (
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative aspect-video rounded-lg overflow-hidden border">
                  <img
                    src={uploadedImage}
                    alt="已上传图片预览"
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={imageUrl || ""}
                      readOnly
                      className="w-full h-10 pl-3 pr-10 border rounded-md bg-muted/30"
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
              </motion.div>
            )}

            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-20">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                  <p className="text-sm font-medium">正在上传...</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p>注册账号可获得图片管理、分享设置等更多功能</p>
        </div>
      </div>
    </section>
  );
}
