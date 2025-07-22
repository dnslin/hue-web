"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { useRoleStore } from "@/lib/store/role";
import { useStorageStrategyStore } from "@/lib/store/storage";
import { createRoleFormSchema, type CreateRoleFormData } from "@/lib/schema/admin/role";
import type { StorageStrategy } from "@/lib/types/storage";
import type { CreateRoleRequest } from "@/lib/types/roles";

interface RoleCreateDialogProps {
  children?: React.ReactNode;
}

export function RoleCreateDialog({ children }: RoleCreateDialogProps) {
  const [open, setOpen] = useState(false);
  const { createRole, isSubmitting } = useRoleStore();
  const { strategies, fetchStrategies } = useStorageStrategyStore();
  const [selectedStrategies, setSelectedStrategies] = useState<StorageStrategy[]>([]);

  const form = useForm<CreateRoleFormData>({
    resolver: zodResolver(createRoleFormSchema),
    defaultValues: {
      name: "",
      alias: "",
      storageStrategyIds: [],
    },
  });

  // 加载存储策略列表
  useEffect(() => {
    if (open) {
      fetchStrategies();
    }
  }, [open, fetchStrategies]);

  const onSubmit = useCallback(async (data: CreateRoleFormData) => {
    try {
      // 转换数据格式，去除空的 alias
      const createData: CreateRoleRequest = {
        name: data.name,
        storageStrategyIds: data.storageStrategyIds,
      };

      // 只有当 alias 有值且不为空时才添加到请求中
      if (data.alias && data.alias.trim()) {
        createData.alias = data.alias.trim();
      }

      const result = await createRole(createData);
      if (result) {
        // 成功创建后重置表单并关闭对话框
        form.reset();
        setSelectedStrategies([]);
        setOpen(false);
      }
    } catch (error) {
      console.error("创建角色失败:", error);
    }
  }, [createRole, form]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // 关闭时重置表单
      form.reset();
      setSelectedStrategies([]);
    }
  };

  // 添加存储策略
  const handleAddStrategy = (strategyId: string) => {
    const id = parseInt(strategyId);
    const strategy = strategies.find(s => s.id === id);
    if (strategy && !selectedStrategies.find(s => s.id === id)) {
      const newSelectedStrategies = [...selectedStrategies, strategy];
      setSelectedStrategies(newSelectedStrategies);
      form.setValue('storageStrategyIds', newSelectedStrategies.map(s => s.id));
    }
  };

  // 移除存储策略
  const handleRemoveStrategy = (strategyId: number) => {
    const newSelectedStrategies = selectedStrategies.filter(s => s.id !== strategyId);
    setSelectedStrategies(newSelectedStrategies);
    form.setValue('storageStrategyIds', newSelectedStrategies.map(s => s.id));
  };

  // 键盘快捷键支持 (仅对话框内有效)
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+Enter 或 Cmd+Enter 提交表单
      if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        event.preventDefault();
        form.handleSubmit(onSubmit)();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, form, onSubmit]);

  // 获取可选的存储策略列表（排除已选中的）
  const availableStrategies = strategies.filter(
    strategy => !selectedStrategies.find(s => s.id === strategy.id)
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children || (
          <ShimmerButton className="gap-2 h-9 px-4 rounded-md">
            <Plus className="h-4 w-4" />
            添加角色
          </ShimmerButton>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-w-[95vw] mx-auto">
        <DialogHeader>
          <DialogTitle>创建新角色</DialogTitle>
          <DialogDescription>
            填写角色信息来创建一个新的系统角色。角色名称将用作系统标识，别名用于界面显示。
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>角色名称 *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="例如: admin, editor, viewer"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="alias"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>角色别名</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="例如: 管理员, 编辑者, 访客"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 存储策略选择 */}
            <div className="space-y-4">
              <div className="space-y-2">
                <FormLabel>关联存储策略</FormLabel>
                <FormDescription>
                  选择该角色可以使用的存储策略，不选择则使用系统默认策略
                </FormDescription>
                
                {availableStrategies.length > 0 && (
                  <Select onValueChange={handleAddStrategy}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择要添加的存储策略" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableStrategies.map((strategy) => (
                        <SelectItem key={strategy.id} value={strategy.id.toString()}>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={strategy.type === 's3' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {strategy.type === 's3' ? 'S3' : '本地'}
                            </Badge>
                            <span>{strategy.name}</span>
                            {!strategy.isEnabled && (
                              <Badge variant="destructive" className="text-xs">
                                已禁用
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {/* 已选中的存储策略 */}
                {selectedStrategies.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">已选中的存储策略：</div>
                    <div className="flex flex-wrap gap-2">
                      {selectedStrategies.map((strategy) => (
                        <Badge
                          key={strategy.id}
                          variant="outline"
                          className="flex items-center gap-1 px-2 py-1"
                        >
                          <Badge
                            variant={strategy.type === 's3' ? 'default' : 'secondary'}
                            className="text-xs mr-1"
                          >
                            {strategy.type === 's3' ? 'S3' : '本地'}
                          </Badge>
                          {strategy.name}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => handleRemoveStrategy(strategy.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {availableStrategies.length === 0 && selectedStrategies.length === 0 && (
                  <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    暂无可用的存储策略，请先在存储策略管理中创建。
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                取消
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    创建中...
                  </>
                ) : (
                  "创建角色"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
