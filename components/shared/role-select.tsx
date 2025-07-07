"use client";

import { useEffect } from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { useRoleStore } from "@/lib/store/role";
import { Role } from "@/lib/types/roles";
import { cn } from "@/lib/utils";

interface RoleSelectProps {
  value?: number; // 当前选中的角色ID
  onValueChange: (roleId: number) => void; // 角色变更回调
  label?: string; // 标签文本
  placeholder?: string; // 占位符文本
  disabled?: boolean; // 是否禁用
  required?: boolean; // 是否必填
  className?: string; // 额外的CSS类
  portalContainer?: HTMLElement | null; // Portal容器，用于解决嵌套Portal冲突
}

export function RoleSelect({
  value,
  onValueChange,
  label = "用户角色",
  placeholder = "请选择角色",
  disabled = false,
  required = false,
  className = "",
  portalContainer,
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
    return selectedRole?.alias || selectedRole?.name;
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
      <SelectPrimitive.Root
        value={value?.toString() ?? ""}
        onValueChange={handleValueChange}
        disabled={disabled}
      >
        <SelectPrimitive.Trigger
          className={cn(
            "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 h-9"
          )}
        >
          <SelectPrimitive.Value placeholder={placeholder}>
            {getSelectedRoleName()}
          </SelectPrimitive.Value>
          <SelectPrimitive.Icon asChild>
            <ChevronDownIcon className="size-4 opacity-50" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal container={portalContainer}>
          <SelectPrimitive.Content
            className={cn(
              "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border shadow-md"
            )}
            position="popper"
          >
            <SelectPrimitive.ScrollUpButton className="flex cursor-default items-center justify-center py-1">
              <ChevronUpIcon className="size-4" />
            </SelectPrimitive.ScrollUpButton>
            <SelectPrimitive.Viewport className="p-1">
              {roles.map((role) => (
                <SelectPrimitive.Item
                  key={role.id}
                  value={role.id.toString()}
                  className={cn(
                    "focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                  )}
                >
                  <span className="absolute right-2 flex size-3.5 items-center justify-center">
                    <SelectPrimitive.ItemIndicator>
                      <CheckIcon className="size-4" />
                    </SelectPrimitive.ItemIndicator>
                  </span>
                  <SelectPrimitive.ItemText>
                    <div className="flex items-center gap-2">
                      <span>{role.alias || role.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({role.name})
                      </span>
                    </div>
                  </SelectPrimitive.ItemText>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
            <SelectPrimitive.ScrollDownButton className="flex cursor-default items-center justify-center py-1">
              <ChevronDownIcon className="size-4" />
            </SelectPrimitive.ScrollDownButton>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </div>
  );
}
