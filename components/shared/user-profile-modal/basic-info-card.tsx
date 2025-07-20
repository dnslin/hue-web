"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit2, Save, X, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { showToast } from "@/lib/utils/toast";
import { updateCurrentUserAction } from "@/lib/actions/auth/update-me";
import { basicInfoSchema, type BasicInfoFormData } from "@/lib/schema/user-profile";
import type { User as UserType } from "@/lib/types/user";

interface BasicInfoCardProps {
  user: UserType;
  onUserUpdate: (updatedUser: UserType) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const BasicInfoCard: React.FC<BasicInfoCardProps> = ({
  user,
  onUserUpdate,
  isLoading,
  setIsLoading,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<BasicInfoFormData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      nickname: user.nickname || "",
      email: user.email,
    },
  });

  const onSubmit = async (data: BasicInfoFormData) => {
    if (isLoading) return;

    try {
      setIsLoading(true);

      // 只提交有变化的字段
      const updateData: Partial<BasicInfoFormData> = {};
      if (data.nickname !== (user.nickname || "")) {
        updateData.nickname = data.nickname;
      }
      if (data.email !== user.email) {
        updateData.email = data.email;
      }

      // 如果没有变化，直接退出编辑模式
      if (Object.keys(updateData).length === 0) {
        setIsEditing(false);
        showToast.info("没有信息需要更新");
        return;
      }

      const updatedUser = await updateCurrentUserAction(updateData);
      if (updatedUser) {
        onUserUpdate(updatedUser);
        setIsEditing(false);
        showToast.success("基本信息更新成功");
      }
    } catch (error) {
      console.error("更新基本信息失败:", error);
      showToast.error(error instanceof Error ? error.message : "更新失败");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    form.reset({
      nickname: user.nickname || "",
      email: user.email,
    });
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <User className="h-4 w-4" />
          基本信息
        </CardTitle>
        {!isEditing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            disabled={isLoading}
            className="h-8 px-2"
          >
            <Edit2 className="h-3 w-3 mr-1" />
            编辑
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* 用户名（只读） */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">用户名</Label>
                <Input
                  value={user.username}
                  disabled
                  className="bg-muted/50"
                />
              </div>

              {/* 昵称 */}
              <FormField
                control={form.control}
                name="nickname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>昵称</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="请输入昵称（可选）"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 邮箱 */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>邮箱</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="请输入邮箱地址"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 操作按钮 */}
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  <X className="h-3 w-3 mr-1" />
                  取消
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isLoading}
                  className="min-w-[60px]"
                >
                  {isLoading ? (
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-background border-t-foreground" />
                  ) : (
                    <>
                      <Save className="h-3 w-3 mr-1" />
                      保存
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <div className="space-y-3">
            {/* 用户名 */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">用户名</Label>
              <p className="text-sm">{user.username}</p>
            </div>

            {/* 昵称 */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">昵称</Label>
              <p className="text-sm">{user.nickname || "未设置"}</p>
            </div>

            {/* 邮箱 */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">邮箱</Label>
              <p className="text-sm">{user.email}</p>
            </div>

            {/* 角色 */}
            <div className="space-y-1">
              <Label className="text-sm font-medium text-muted-foreground">角色</Label>
              <p className="text-sm">{user.role?.name || "用户"}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};