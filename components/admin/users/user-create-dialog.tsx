"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AdminUserCreateRequest } from "@/lib/types/user";
import { useUserActionStore } from "@/lib/store/user/user-action.store";
import { showToast } from "@/lib/utils/toast";
import { RoleSelect } from "@/components/shared/role-select";

interface UserCreateDialogProps {
  children: React.ReactNode;
}

interface CreateUserForm {
  username: string;
  email: string;
  password: string;
  role_id: number;
}

interface CreateUserFormErrors {
  username?: string;
  email?: string;
  password?: string;
  role_id?: string;
}

export function UserCreateDialog({ children }: UserCreateDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreateUserForm>({
    username: "",
    email: "",
    password: "",
    role_id: 0,
  });
  const [errors, setErrors] = useState<CreateUserFormErrors>({});
  const dialogContentRef = useRef<HTMLDivElement>(null);

  const { loading, error, createUser, clearError } = useUserActionStore();
  const isSubmitting = loading.isCreating;

  // 表单验证
  const validateForm = (): boolean => {
    const newErrors: CreateUserFormErrors = {};

    // 用户名验证 (3-50字符)
    if (!form.username) {
      newErrors.username = "用户名不能为空";
    } else if (form.username.length < 3) {
      newErrors.username = "用户名至少需要3个字符";
    } else if (form.username.length > 50) {
      newErrors.username = "用户名不能超过50个字符";
    }

    // 邮箱验证
    if (!form.email) {
      newErrors.email = "邮箱不能为空";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "请输入有效的邮箱地址";
    }

    // 密码验证 (8-100字符)
    if (!form.password) {
      newErrors.password = "密码不能为空";
    } else if (form.password.length < 8) {
      newErrors.password = "密码至少需要8个字符";
    } else if (form.password.length > 100) {
      newErrors.password = "密码不能超过100个字符";
    }

    // 角色验证
    if (!form.role_id || form.role_id === 0) {
      newErrors.role_id = "请选择用户角色";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 重置表单
  const resetForm = () => {
    setForm({
      username: "",
      email: "",
      password: "",
      role_id: 0,
    });
    setErrors({});
    clearError("createError" as keyof typeof error);
  };

  // 处理表单提交
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    clearError("createError" as keyof typeof error);

    const userData: AdminUserCreateRequest = {
      username: form.username,
      email: form.email,
      password: form.password,
      role_id: form.role_id,
    };

    const result = await createUser(userData);

    if (result.success) {
      showToast.success(`用户 ${form.username} 创建成功`);
      setOpen(false);
      resetForm();
    }
    // 错误处理已由 store 完成，这里只处理成功情况
  };

  // 处理弹窗关闭
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isSubmitting) {
      resetForm();
    }
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md" ref={dialogContentRef}>
        <DialogHeader>
          <DialogTitle>添加用户</DialogTitle>
          <DialogDescription>
            创建一个新的用户账户。用户创建后将收到邮件通知。
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* 用户名输入 */}
          <div className="space-y-2">
            <Label htmlFor="create-username">
              用户名 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="create-username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="请输入用户名 (3-50字符)"
              className={errors.username ? "border-red-500" : ""}
            />
            {errors.username && (
              <p className="text-sm text-red-500">{errors.username}</p>
            )}
          </div>

          {/* 邮箱输入 */}
          <div className="space-y-2">
            <Label htmlFor="create-email">
              邮箱 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="create-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="请输入邮箱地址"
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          {/* 密码输入 */}
          <div className="space-y-2">
            <Label htmlFor="create-password">
              密码 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="create-password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="请输入密码 (8-100字符)"
              className={errors.password ? "border-red-500" : ""}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          {/* 角色选择 */}
          <div
            className={`space-y-2 ${errors.role_id ? "border-red-500" : ""}`}
          >
            <RoleSelect
              value={form.role_id}
              onValueChange={(roleId) => setForm({ ...form, role_id: roleId })}
              label="用户角色"
              placeholder="请选择角色"
              required
              portalContainer={dialogContentRef.current}
            />
            {errors.role_id && (
              <p className="text-sm text-red-500">{errors.role_id}</p>
            )}
          </div>

          {/* 显示服务器错误 */}
          {error.createError && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error.createError}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
          >
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "创建中..." : "创建用户"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
