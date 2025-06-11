"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { getRolesAction } from "@/lib/actions/roles/role.actions";
import { Role } from "@/lib/types/user";

interface RoleSelectProps {
  value?: number; // 当前选中的角色ID
  onValueChange: (roleId: number) => void; // 角色变更回调
  label?: string; // 标签文本
  placeholder?: string; // 占位符文本
  disabled?: boolean; // 是否禁用
  required?: boolean; // 是否必填
  className?: string; // 额外的CSS类
}

export function RoleSelect({
  value,
  onValueChange,
  label = "用户角色",
  placeholder = "请选择角色",
  disabled = false,
  required = false,
  className = "",
}: RoleSelectProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 获取角色列表
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getRolesAction({ page: 1, page_size: 100 }); // 获取所有角色

        if ("code" in response && response.code === 200) {
          // 处理PaginatedResponse类型
          const paginatedResponse = response as any;
          setRoles(paginatedResponse.data || []);
        } else {
          setError((response as any).message || "获取角色列表失败");
        }
      } catch (err) {
        console.error("获取角色列表失败:", err);
        setError("网络错误，请稍后重试");
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  // 处理角色选择
  const handleValueChange = (selectedValue: string) => {
    const roleId = parseInt(selectedValue);
    onValueChange(roleId);
  };

  // 获取当前选中角色的名称
  const getSelectedRoleName = () => {
    if (!value) return undefined;
    const selectedRole = roles.find((role) => role.id === value);
    return selectedRole?.name;
  };

  if (loading) {
    return (
      <div className={`space-y-2 ${className}`}>
        {label && (
          <Label className="text-sm font-medium">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}
        <Skeleton className="h-9 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-2 ${className}`}>
        {label && (
          <Label className="text-sm font-medium">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}
        <div className="flex items-center gap-2 p-3 rounded-md border border-red-200 bg-red-50 text-red-700">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <Select
        value={value?.toString()}
        onValueChange={handleValueChange}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder}>
            {getSelectedRoleName()}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {roles.map((role) => (
            <SelectItem key={role.id} value={role.id.toString()}>
              <div className="flex items-center gap-2">
                <span>{role.name}</span>
                <span className="text-xs text-muted-foreground">
                  (ID: {role.id})
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
