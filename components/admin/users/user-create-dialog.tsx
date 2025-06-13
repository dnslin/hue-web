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
import {
  AdminUserCreateRequest,
  ROLE_ID_MAP,
  UserRole,
} from "@/lib/types/user";
import { useUserActionStore } from "@/lib/store/user/user-action.store";
import { showToast } from "@/lib/utils/toast";
import { RoleSelect } from "@/components/shared/role-select";
import { generateUserPassword } from "@/lib/utils/password";
import { RefreshCw, Eye, EyeOff } from "lucide-react";

interface UserCreateDialogProps {
  children: React.ReactNode;
}

interface CreateUserForm {
  username: string;
  email: string;
  password: string;
  roleId: number;
}

interface CreateUserFormErrors {
  username?: string;
  email?: string;
  password?: string;
  roleId?: string;
}

export function UserCreateDialog({ children }: UserCreateDialogProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreateUserForm>({
    username: "",
    email: "",
    password: "",
    roleId: ROLE_ID_MAP[UserRole.USER], // 默认设置为user角色 (ID: 2)
  });
  const [errors, setErrors] = useState<CreateUserFormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
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
    if (!form.roleId) {
      newErrors.roleId = "请选择用户角色";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 生成密码
  const handleGeneratePassword = () => {
    const newPassword = generateUserPassword();
    setForm({ ...form, password: newPassword });
    setShowPassword(true); // 生成后显示密码以便用户查看

    // 清除密码相关错误
    if (errors.password) {
      const newErrors = { ...errors };
      delete newErrors.password;
      setErrors(newErrors);
    }

    showToast.success("密码已生成");
  };

  // 重置表单
  const resetForm = () => {
    setForm({
      username: "",
      email: "",
      password: "",
      roleId: ROLE_ID_MAP[UserRole.USER], // 重置时也设置默认角色
    });
    setErrors({});
    setShowPassword(false); // 重置密码显示状态
    clearError("createError" as keyof typeof error);
  };

  // 处理表单提交
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!validateForm()) {
      return;
    }

    clearError("createError" as keyof typeof error);

    const userData: AdminUserCreateRequest = {
      username: form.username,
      email: form.email,
      password: form.password,
      roleId: form.roleId,
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

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Escape键关闭对话框
    if (e.key === "Escape" && !isSubmitting) {
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className="w-[calc(100vw-2rem)] max-w-md max-h-[85vh] overflow-y-auto sm:w-full"
        ref={dialogContentRef}
        onKeyDown={handleKeyDown}
      >
        <DialogHeader>
          <DialogTitle>添加用户</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            <span className="hidden sm:inline">创建一个新的用户账户。</span>
            用户创建后将收到邮件通知。
          </DialogDescription>
        </DialogHeader>
        <form id="user-create-form" onSubmit={handleSubmit} noValidate>
          <div className="space-y-4 py-2 sm:py-4">
            {/* 用户名输入 */}
            <div className="space-y-2">
              <Label htmlFor="create-username">
                用户名 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="create-username"
                name="username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="3-50字符"
                className={errors.username ? "border-red-500" : ""}
                autoComplete="username"
                required
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
                name="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="example@domain.com"
                className={errors.email ? "border-red-500" : ""}
                autoComplete="email"
                required
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
              <div className="space-y-2 sm:space-y-0">
                {/* 移动端：垂直布局，桌面端：水平布局 */}
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative flex-1">
                    <Input
                      id="create-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                      placeholder="8-100字符"
                      className={`pr-10 ${
                        errors.password ? "border-red-500" : ""
                      }`}
                      autoComplete="new-password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGeneratePassword}
                    className="w-full sm:w-auto shrink-0 justify-center sm:justify-start"
                    title="生成安全密码"
                  >
                    <RefreshCw className="h-4 w-4 mr-2 sm:mr-0" />
                    <span className="sm:hidden">生成密码</span>
                  </Button>
                </div>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
              {form.password && (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  建议将生成的密码发送给用户，并要求首次登录后修改
                </p>
              )}
            </div>

            {/* 角色选择 */}
            <div
              className={`space-y-2 ${errors.roleId ? "border-red-500" : ""}`}
            >
              <RoleSelect
                value={form.roleId}
                onValueChange={(roleId) =>
                  setForm({ ...form, roleId: roleId })
                }
                label="用户角色"
                placeholder="请选择角色"
                required
                portalContainer={dialogContentRef.current}
              />
              {errors.roleId && (
                <p className="text-sm text-red-500">{errors.roleId}</p>
              )}
              {form.roleId === ROLE_ID_MAP[UserRole.USER] && (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  默认选择普通用户角色，可根据需要修改
                </p>
              )}
            </div>

            {/* 显示服务器错误 */}
            {error.createError && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md leading-relaxed">
                {error.createError}
              </div>
            )}
          </div>
        </form>
        <DialogFooter className="gap-3 pt-4 sm:pt-6">
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
            form="user-create-form"
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? "创建中..." : "创建用户"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
