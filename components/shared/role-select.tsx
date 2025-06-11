"use client";

import { useEffect } from "react";
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
import { useRoleStore } from "@/lib/store/role-store";
import { Role } from "@/lib/types/roles";

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
  // 使用 RoleStore 获取角色数据
  const { roles, isLoadingRoles, error, fetchRoles } = useRoleStore();

  // 获取角色列表
  useEffect(() => {
    // 如果还没有角色数据，则获取
    if (roles.length === 0 && !isLoadingRoles) {
      fetchRoles(1, 100); // 获取所有角色
    }
  }, [roles.length, isLoadingRoles, fetchRoles]);

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

  if (isLoadingRoles) {
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
