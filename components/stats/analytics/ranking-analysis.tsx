"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTopImages, useTopUsers, useStatsLoading, useStatsError } from "@/lib/store/stats";
import { Trophy, Image as ImageIcon, Users, Eye, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function RankingAnalysis() {
  const topImages = useTopImages();
  const topUsers = useTopUsers();
  const isLoading = useStatsLoading();
  const error = useStatsError();

  if (isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-muted rounded w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-20 bg-muted rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-muted rounded w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              无法加载排行榜数据
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 获取排名徽章样式
  const getRankBadge = (rank: number) => {
    if (rank === 1) return { icon: "🥇", color: "bg-yellow-100 text-yellow-800 border-yellow-300" };
    if (rank === 2) return { icon: "🥈", color: "bg-gray-100 text-gray-800 border-gray-300" };
    if (rank === 3) return { icon: "🥉", color: "bg-orange-100 text-orange-800 border-orange-300" };
    return { icon: `#${rank}`, color: "bg-blue-100 text-blue-800 border-blue-300" };
  };

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {/* 热门图片排行 */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Trophy className="h-5 w-5 text-yellow-600" />
              <span>热门图片排行</span>
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              <ImageIcon className="h-3 w-3 mr-1" />
              前 {topImages?.data?.length || 0} 名
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {topImages?.data?.map((image, index) => {
            const rank = index + 1;
            const badge = getRankBadge(rank);
            
            return (
              <div key={image.imageId} className="flex items-center space-x-3 p-3 rounded-lg border bg-card/50 hover:bg-card transition-colors">
                {/* 排名徽章 */}
                <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 ${badge.color} font-bold text-xs sm:text-sm flex-shrink-0`}>
                  {badge.icon}
                </div>
                
                {/* 图片缩略图 */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-muted">
                    <img
                      src={image.thumbnailUrl}
                      alt={image.fileName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder-image.svg";
                      }}
                    />
                  </div>
                </div>
                
                {/* 图片信息 */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate text-sm sm:text-base">{image.fileName}</div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs sm:text-sm text-muted-foreground mt-1 space-y-1 sm:space-y-0">
                    <div className="flex items-center space-x-1">
                      <Eye className="h-3 w-3" />
                      <span>{image.viewCount.toLocaleString()}</span>
                    </div>
                    <div className="hidden sm:block text-xs">
                      {new Date(image.uploadedAt).toLocaleDateString("zh-CN")}
                    </div>
                    <div className="text-xs">
                      上传者: {image.uploader}
                    </div>
                  </div>
                </div>
                
                {/* 浏览量统计 */}
                <div className="text-right flex-shrink-0">
                  <div className="font-bold text-sm sm:text-lg">{image.viewCount.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">浏览量</div>
                </div>
              </div>
            );
          })}
          
          {/* 图片统计汇总 */}
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-lg sm:text-2xl font-bold text-blue-600">
                  {topImages?.data?.reduce((sum, img) => sum + img.viewCount, 0)?.toLocaleString() || '0'}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">总浏览量</div>
              </div>
              <div>
                <div className="text-lg sm:text-2xl font-bold text-green-600">
                  {topImages?.data?.reduce((sum, img) => sum + img.size, 0) ? 
                    ((topImages.data?.reduce((sum, img) => sum + img.size, 0) || 0) / (1024 * 1024)).toFixed(1) + 'MB' :
                    '0 MB'
                  }
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">总文件大小</div>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <div className="text-lg sm:text-2xl font-bold text-purple-600">
                  {topImages?.data?.length || 0}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">热门图片</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 热门用户排行 */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Star className="h-5 w-5 text-blue-600" />
              <span>热门用户排行</span>
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              <Users className="h-3 w-3 mr-1" />
              前 {topUsers?.data?.length || 0} 名
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {topUsers?.data?.map((user, index) => {
            const rank = index + 1;
            const badge = getRankBadge(rank);
            
            return (
              <div key={user.userId} className="flex items-center space-x-3 p-3 rounded-lg border bg-card/50 hover:bg-card transition-colors">
                {/* 排名徽章 */}
                <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 ${badge.color} font-bold text-xs sm:text-sm flex-shrink-0`}>
                  {badge.icon}
                </div>
                
                {/* 用户头像 */}
                <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                  <AvatarFallback className="text-xs sm:text-sm">{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                
                {/* 用户信息 */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate text-sm sm:text-base">{user.username}</div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs sm:text-sm text-muted-foreground mt-1 space-y-1 sm:space-y-0">
                    <div className="flex items-center space-x-1">
                      <ImageIcon className="h-3 w-3" />
                      <span>{user.uploadCount}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="h-3 w-3" />
                      <span>{user.totalImageViews.toLocaleString()}</span>
                    </div>
                    <div className="text-xs">
                      用户ID: {user.userId}
                    </div>
                  </div>
                </div>
                
                {/* 浏览量统计 */}
                <div className="text-right flex-shrink-0">
                  <div className="font-bold text-sm sm:text-lg">{user.totalImageViews.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">总浏览量</div>
                </div>
              </div>
            );
          })}
          
          {/* 用户统计汇总 */}
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-lg sm:text-2xl font-bold text-blue-600">
                  {topUsers?.data?.reduce((sum, user) => sum + user.totalImageViews, 0)?.toLocaleString() || '0'}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">总浏览量</div>
              </div>
              <div>
                <div className="text-lg sm:text-2xl font-bold text-green-600">
                  {topUsers?.data?.reduce((sum, user) => sum + user.uploadCount, 0)?.toLocaleString() || '0'}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">总图片数</div>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <div className="text-lg sm:text-2xl font-bold text-purple-600">
                  {topUsers?.data?.length || 0}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">活跃用户</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}