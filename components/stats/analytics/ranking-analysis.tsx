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
    <div className="grid gap-6 lg:grid-cols-2">
      {/* 热门图片排行 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              <span>热门图片排行</span>
            </CardTitle>
            <Badge variant="outline">
              <ImageIcon className="h-3 w-3 mr-1" />
              前 {topImages?.data?.length || 0} 名
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topImages?.data?.map((image, index) => {
              const rank = index + 1;
              const badge = getRankBadge(rank);
              
              return (
                <div key={image.id} className="flex items-center space-x-4 p-3 rounded-lg border bg-card/50 hover:bg-card transition-colors">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${badge.color} font-bold text-sm`}>
                    {badge.icon}
                  </div>
                  
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                      <img
                        src={image.thumbnailUrl || image.url}
                        alt={image.filename}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder-image.svg";
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{image.filename}</div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                      <div className="flex items-center space-x-1">
                        <Eye className="h-3 w-3" />
                        <span>{image.views.toLocaleString()}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(image.uploadDate).toLocaleDateString("zh-CN")}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-bold text-lg">{image.views.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">浏览量</div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* 图片统计汇总 */}
          <div className="mt-6 pt-4 border-t">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {topImages?.data?.reduce((sum, img) => sum + img.views, 0)?.toLocaleString() || '0'}
                </div>
                <div className="text-sm text-muted-foreground">总浏览量</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {topImages?.data?.reduce((sum, img) => sum + img.size, 0) ? 
                    ((topImages.data?.reduce((sum, img) => sum + img.size, 0) || 0) / (1024 * 1024)).toFixed(1) + 'MB' :
                    '0 MB'
                  }
                </div>
                <div className="text-sm text-muted-foreground">总文件大小</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {topImages?.data?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">热门图片</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 热门用户排行 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-blue-600" />
              <span>热门用户排行</span>
            </CardTitle>
            <Badge variant="outline">
              <Users className="h-3 w-3 mr-1" />
              前 {topUsers?.data?.length || 0} 名
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topUsers?.data?.map((user, index) => {
              const rank = index + 1;
              const badge = getRankBadge(rank);
              
              return (
                <div key={user.id} className="flex items-center space-x-4 p-3 rounded-lg border bg-card/50 hover:bg-card transition-colors">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${badge.color} font-bold text-sm`}>
                    {badge.icon}
                  </div>
                  
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.avatar} alt={user.username} />
                    <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{user.username}</div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                      <div className="flex items-center space-x-1">
                        <ImageIcon className="h-3 w-3" />
                        <span>{user.totalUploads}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="h-3 w-3" />
                        <span>{user.totalViews.toLocaleString()}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(user.joinDate).toLocaleDateString("zh-CN")} 加入
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-bold text-lg">{user.totalViews.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">总浏览量</div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* 用户统计汇总 */}
          <div className="mt-6 pt-4 border-t">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {topUsers?.data?.reduce((sum, user) => sum + user.totalViews, 0)?.toLocaleString() || '0'}
                </div>
                <div className="text-sm text-muted-foreground">总浏览量</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {topUsers?.data?.reduce((sum, user) => sum + user.totalUploads, 0)?.toLocaleString() || '0'}
                </div>
                <div className="text-sm text-muted-foreground">总图片数</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {topUsers?.data?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">活跃用户</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}