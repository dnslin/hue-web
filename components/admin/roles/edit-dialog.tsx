"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X, Pencil } from "lucide-react";
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
import { useRoleStore } from "@/lib/store/role";
import { useStorageStrategyStore } from "@/lib/store/storage";
import { updateRoleFormSchema, type UpdateRoleFormData } from "@/lib/schema/admin/role";
import type { Role } from "@/lib/types/user";
import type { StorageStrategy } from "@/lib/types/storage";

interface RoleEditDialogProps {
  role: Role;
  children?: React.ReactNode;
}

export function RoleEditDialog({ role, children }: RoleEditDialogProps) {
  const [open, setOpen] = useState(false);
  const { updateRole, isSubmitting } = useRoleStore();
  const { strategies, fetchStrategies } = useStorageStrategyStore();
  const [selectedStrategies, setSelectedStrategies] = useState<StorageStrategy[]>([]);

  const form = useForm<UpdateRoleFormData>({
    resolver: zodResolver(updateRoleFormSchema),
    defaultValues: {
      name: "",
      alias: "",
      storageStrategyIds: [],
    },
  });

  // 当对话框打开或角色变化时，更新表单数据
  useEffect(() => {
    if (open && role) {
      form.reset({
        name: role.name,
        alias: role.alias || "",
        storageStrategyIds: role.storageStrategyIds || [],
      });

      // 根据角色的存储策略ID设置已选中的策略
      if (role.storageStrategyIds && strategies.length > 0) {
        const roleStrategies = strategies.filter(s => 
          role.storageStrategyIds?.includes(s.id)
        );
        setSelectedStrategies(roleStrategies);
      } else {
        setSelectedStrategies([]);
      }
    }
  }, [open, role, form, strategies]);

  // 加载存储策略列表
  useEffect(() => {
    if (open) {
      fetchStrategies();
    }
  }, [open, fetchStrategies]);

  const onSubmit = useCallback(async (data: UpdateRoleFormData) => {
    try {
      // 转换数据格式，去除空的 alias
      const updateData: { name?: string; alias?: string; storageStrategyIds?: number[] } = {
        name: data.name,
        storageStrategyIds: data.storageStrategyIds,
      };

      // 只有当 alias 有值且不为空时才添加到请求中
      if (data.alias && data.alias.trim()) {
        updateData.alias = data.alias.trim();
      } else {
        updateData.alias = undefined; // 清空别名
      }

      const result = await updateRole(role.id, updateData);
      if (result) {
        // 成功更新后关闭对话框
        setOpen(false);
      }
    } catch (error) {
      console.error("更新角色失败:", error);
    }
  }, [updateRole, role.id]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // 关闭时重置选择状态
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
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-w-[95vw] mx-auto">
        <DialogHeader>
          <DialogTitle>编辑角色</DialogTitle>
          <DialogDescription>
            修改角色 &quot;{role.alias || role.name}&quot; 的基本信息和存储策略关联。
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
                    更新中...
                  </>
                ) : (
                  "保存更改"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}