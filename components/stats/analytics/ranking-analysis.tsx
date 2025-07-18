"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTopImages, useTopUsers, useStatsLoading, useStatsError } from "@/lib/store/stats";
import { Trophy, Image as ImageIcon, Users, Eye, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/shared/user-avatar";
import { AuthenticatedImage } from "@/components/shared/authenticated-image";

export function RankingAnalysis() {
  const topImages = useTopImages();
  const topUsers = useTopUsers();
  const isLoading = useStatsLoading();
  const error = useStatsError();

  // 从thumbnailUrl中提取imageId
  const extractImageId = (thumbnailUrl: string) => {
    // 从 /api/v1/images/19/view?thumb=true 中提取 19
    const match = thumbnailUrl.match(/\/images\/(\d+)\/view/);
    return match ? match[1] : null;
  };

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
    <div className="space-y-6">
      {/* 移动端：垂直堆叠，桌面端：两列布局 */}
      <div className="grid gap-4 lg:gap-6 lg:grid-cols-2">
        {/* 热门图片排行 */}
        <Card className="w-full">
          <CardHeader className="pb-3 px-3 sm:px-6">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
                <span>热门图片</span>
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                <ImageIcon className="h-3 w-3 mr-1" />
                前 {topImages?.data?.length || 0}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 space-y-2 sm:space-y-3">
            {topImages?.data?.map((image, index) => {
              const rank = index + 1;
              const badge = getRankBadge(rank);
              
              return (
                <div key={image.imageId} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border bg-card/50 hover:bg-card transition-colors">
                  {/* 排名徽章 */}
                  <div className={`flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 ${badge.color} font-bold text-xs flex-shrink-0`}>
                    {typeof badge.icon === 'string' && badge.icon.startsWith('#') ? badge.icon.slice(1) : badge.icon}
                  </div>
                  
                  {/* 图片缩略图 */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-md overflow-hidden bg-muted">
                      {(() => {
                        const imageId = extractImageId(image.thumbnailUrl);
                        return imageId ? (
                          <AuthenticatedImage
                            imageId={imageId}
                            fileName={image.fileName}
                            thumb={true}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <span className="text-xs text-muted-foreground">无法解析</span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                  
                  {/* 图片信息 */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate text-xs sm:text-sm">{image.fileName}</div>
                    <div className="flex items-center gap-2 sm:gap-3 text-xs text-muted-foreground mt-0.5">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{image.viewCount.toLocaleString()}</span>
                      </div>
                      <span className="hidden sm:inline">•</span>
                      <span className="hidden sm:inline text-xs">{image.uploader}</span>
                    </div>
                  </div>
                  
                  {/* 浏览量统计 */}
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold text-xs sm:text-sm">{image.viewCount.toLocaleString()}</div>
                  </div>
                </div>
              );
            })}
            
            {/* 图片统计汇总 */}
            <div className="mt-3 pt-3 border-t">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 text-center">
                <div>
                  <div className="text-sm sm:text-lg font-bold text-blue-600">
                    {topImages?.data?.reduce((sum, img) => sum + img.viewCount, 0)?.toLocaleString() || '0'}
                  </div>
                  <div className="text-xs text-muted-foreground">总浏览</div>
                </div>
                <div>
                  <div className="text-sm sm:text-lg font-bold text-green-600">
                    {topImages?.data?.reduce((sum, img) => sum + img.size, 0) ? 
                      ((topImages.data?.reduce((sum, img) => sum + img.size, 0) || 0) / (1024 * 1024)).toFixed(1) + 'MB' :
                      '0MB'
                    }
                  </div>
                  <div className="text-xs text-muted-foreground">总大小</div>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <div className="text-sm sm:text-lg font-bold text-purple-600">
                    {topImages?.data?.length || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">图片数</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 热门用户排行 */}
        <Card className="w-full">
          <CardHeader className="pb-3 px-3 sm:px-6">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <Star className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                <span>热门用户</span>
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                <Users className="h-3 w-3 mr-1" />
                前 {topUsers?.data?.length || 0}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 space-y-2 sm:space-y-3">
            {topUsers?.data?.map((user, index) => {
              const rank = index + 1;
              const badge = getRankBadge(rank);
              
              return (
                <div key={user.userId} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border bg-card/50 hover:bg-card transition-colors">
                  {/* 排名徽章 */}
                  <div className={`flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 ${badge.color} font-bold text-xs flex-shrink-0`}>
                    {typeof badge.icon === 'string' && badge.icon.startsWith('#') ? badge.icon.slice(1) : badge.icon}
                  </div>
                  
                  {/* 用户头像 */}
                  <UserAvatar 
                    user={{
                      userId: user.userId,
                      username: user.username,
                      email: user.email,
                      role: { name: 'user' } // 默认角色，因为排行榜中没有详细角色信息
                    } as any}
                    size="lg"
                  />
                  
                  {/* 用户信息 */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate text-xs sm:text-sm">{user.username}</div>
                    <div className="flex items-center gap-2 sm:gap-3 text-xs text-muted-foreground mt-0.5">
                      <div className="flex items-center gap-1">
                        <ImageIcon className="h-3 w-3" />
                        <span>{user.uploadCount}</span>
                      </div>
                      <span className="hidden sm:inline">•</span>
                      <div className="hidden sm:flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{user.totalImageViews.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* 浏览量统计 */}
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold text-xs sm:text-sm">{user.totalImageViews.toLocaleString()}</div>
                  </div>
                </div>
              );
            })}
            
            {/* 用户统计汇总 */}
            <div className="mt-3 pt-3 border-t">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 text-center">
                <div>
                  <div className="text-sm sm:text-lg font-bold text-blue-600">
                    {topUsers?.data?.reduce((sum, user) => sum + user.totalImageViews, 0)?.toLocaleString() || '0'}
                  </div>
                  <div className="text-xs text-muted-foreground">总浏览</div>
                </div>
                <div>
                  <div className="text-sm sm:text-lg font-bold text-green-600">
                    {topUsers?.data?.reduce((sum, user) => sum + user.uploadCount, 0)?.toLocaleString() || '0'}
                  </div>
                  <div className="text-xs text-muted-foreground">总图片</div>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <div className="text-sm sm:text-lg font-bold text-purple-600">
                    {topUsers?.data?.length || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">用户数</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}