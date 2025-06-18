"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { CreateRoleRequest } from "@/lib/types/roles";
import { useRoleStore } from "@/lib/store/role-store";
import { z } from "zod";

// 角色创建表单验证模式
const createRoleFormSchema = z.object({
  name: z
    .string()
    .min(1, "角色名称不能为空")
    .max(50, "角色名称不能超过50个字符")
    .regex(/^[a-zA-Z0-9_]+$/, "角色名称只能包含英文字母、数字和下划线"),
  alias: z
    .string()
    .max(100, "角色别名不能超过100个字符")
    .optional()
    .or(z.literal("")),
});

// 角色创建表单数据类型
type CreateRoleFormData = z.infer<typeof createRoleFormSchema>;

interface RoleCreateDialogProps {
  children?: React.ReactNode;
}

export function RoleCreateDialog({ children }: RoleCreateDialogProps) {
  const [open, setOpen] = useState(false);
  const { createRole, isSubmitting } = useRoleStore();

  const form = useForm<CreateRoleFormData>({
    resolver: zodResolver(createRoleFormSchema),
    defaultValues: {
      name: "",
      alias: "",
    },
  });

  const onSubmit = async (data: CreateRoleFormData) => {
    try {
      // 转换数据格式，去除空的 alias
      const createData: { name: string; alias?: string } = {
        name: data.name,
      };

      // 只有当 alias 有值且不为空时才添加到请求中
      if (data.alias && data.alias.trim()) {
        createData.alias = data.alias.trim();
      }

      const result = await createRole(createData);
      if (result) {
        // 成功创建后重置表单并关闭对话框
        form.reset();
        setOpen(false);
      }
    } catch (error) {
      console.error("创建角色失败:", error);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // 关闭时重置表单
      form.reset();
    }
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
  }, [open, form]);

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
