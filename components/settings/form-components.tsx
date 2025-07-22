"use client";

import {
  UseFormRegister,
  FieldValues,
  Path,
  FieldError,
} from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Info, AlertCircle, TestTube } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// 通用表单项包装器
interface FormItemProps {
  children: React.ReactNode;
  className?: string;
}

export const FormItem = ({ children, className }: FormItemProps) => (
  <div className={cn("space-y-2", className)}>{children}</div>
);

// 表单标签组件
interface FormLabelProps {
  children: React.ReactNode;
  required?: boolean;
  tooltip?: string;
  className?: string;
  htmlFor?: string;
}

export const FormLabel = ({
  children,
  required = false,
  tooltip,
  className,
  htmlFor,
}: FormLabelProps) => (
  <div className="flex items-center gap-2">
    <Label
      htmlFor={htmlFor}
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </Label>
    {tooltip && (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs">{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )}
  </div>
);

// 错误信息组件
interface FormErrorProps {
  error?: FieldError;
}

export const FormError = ({ error }: FormErrorProps) => {
  if (!error) return null;

  return (
    <div className="flex items-center gap-1 text-sm text-red-500">
      <AlertCircle className="h-4 w-4" />
      <span>{error.message}</span>
    </div>
  );
};

// 表单描述组件
interface FormDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const FormDescription = ({
  children,
  className,
}: FormDescriptionProps) => (
  <p className={cn("text-sm text-muted-foreground", className)}>{children}</p>
);

// 带标签的输入框组件
interface LabeledInputProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  register: UseFormRegister<T>;
  error?: FieldError;
  type?: string;
  placeholder?: string;
  description?: string;
  tooltip?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function LabeledInput<T extends FieldValues>({
  label,
  name,
  register,
  error,
  type = "text",
  placeholder,
  description,
  tooltip,
  required = false,
  disabled = false,
  className,
}: LabeledInputProps<T>) {
  return (
    <FormItem className={className}>
      <FormLabel required={required} tooltip={tooltip} htmlFor={name}>
        {label}
      </FormLabel>
      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        {...register(name)}
        className={cn(error && "border-red-500")}
      />
      {description && <FormDescription>{description}</FormDescription>}
      <FormError error={error} />
    </FormItem>
  );
}

// 带标签的文本域组件
interface LabeledTextareaProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  register: UseFormRegister<T>;
  error?: FieldError;
  placeholder?: string;
  description?: string;
  tooltip?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
  className?: string;
}

export function LabeledTextarea<T extends FieldValues>({
  label,
  name,
  register,
  error,
  placeholder,
  description,
  tooltip,
  required = false,
  disabled = false,
  rows = 3,
  className,
}: LabeledTextareaProps<T>) {
  return (
    <FormItem className={className}>
      <FormLabel required={required} tooltip={tooltip} htmlFor={name}>
        {label}
      </FormLabel>
      <Textarea
        id={name}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        {...register(name)}
        className={cn(error && "border-red-500")}
      />
      {description && <FormDescription>{description}</FormDescription>}
      <FormError error={error} />
    </FormItem>
  );
}

// 带标签的开关组件
interface LabeledSwitchProps {
  label: string;
  description?: string;
  tooltip?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const LabeledSwitch = ({
  label,
  description,
  tooltip,
  checked,
  onCheckedChange,
  disabled = false,
  className,
}: LabeledSwitchProps) => (
  <FormItem className={className}>
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <FormLabel tooltip={tooltip}>{label}</FormLabel>
        {description && <FormDescription>{description}</FormDescription>}
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </div>
  </FormItem>
);

// 带标签的选择框组件
interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface LabeledSelectProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  description?: string;
  tooltip?: string;
  required?: boolean;
  disabled?: boolean;
  error?: FieldError;
  className?: string;
}

export const LabeledSelect = ({
  label,
  value,
  onValueChange,
  options,
  placeholder = "请选择...",
  description,
  tooltip,
  required = false,
  disabled = false,
  error,
  className,
}: LabeledSelectProps) => (
  <FormItem className={className}>
    <FormLabel required={required} tooltip={tooltip}>
      {label}
    </FormLabel>
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={cn(error && "border-red-500")}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    {description && <FormDescription>{description}</FormDescription>}
    <FormError error={error} />
  </FormItem>
);

// 数字输入框组件
interface LabeledNumberInputProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  register: UseFormRegister<T>;
  error?: FieldError;
  placeholder?: string;
  description?: string;
  tooltip?: string;
  required?: boolean;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export function LabeledNumberInput<T extends FieldValues>({
  label,
  name,
  register,
  error,
  placeholder,
  description,
  tooltip,
  required = false,
  disabled = false,
  min,
  max,
  step,
  className,
}: LabeledNumberInputProps<T>) {
  return (
    <FormItem className={className}>
      <FormLabel required={required} tooltip={tooltip} htmlFor={name}>
        {label}
      </FormLabel>
      <Input
        id={name}
        type="number"
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        {...register(name, { valueAsNumber: true })}
        className={cn(error && "border-red-500")}
      />
      {description && <FormDescription>{description}</FormDescription>}
      <FormError error={error} />
    </FormItem>
  );
}

// 密码输入框组件
interface LabeledPasswordInputProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  register: UseFormRegister<T>;
  error?: FieldError;
  placeholder?: string;
  description?: string;
  tooltip?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function LabeledPasswordInput<T extends FieldValues>({
  label,
  name,
  register,
  error,
  placeholder,
  description,
  tooltip,
  required = false,
  disabled = false,
  className,
}: LabeledPasswordInputProps<T>) {
  return (
    <FormItem className={className}>
      <FormLabel required={required} tooltip={tooltip} htmlFor={name}>
        {label}
      </FormLabel>
      <Input
        id={name}
        type="password"
        placeholder={placeholder}
        disabled={disabled}
        {...register(name)}
        className={cn(error && "border-red-500")}
      />
      {description && <FormDescription>{description}</FormDescription>}
      <FormError error={error} />
    </FormItem>
  );
}

// 测试按钮组件
interface TestButtonProps {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  variant?: "default" | "outline" | "secondary";
  className?: string;
}

export const TestButton = ({
  onClick,
  loading = false,
  disabled = false,
  children,
  variant = "outline",
  className,
}: TestButtonProps) => (
  <Button
    type="button"
    variant={variant}
    size="sm"
    onClick={onClick}
    disabled={disabled || loading}
    className={cn("h-8", className)}
  >
    {loading ? (
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
        <span>测试中...</span>
      </div>
    ) : (
      <div className="flex items-center gap-2">
        <TestTube className="h-3 w-3" />
        <span>{children}</span>
      </div>
    )}
  </Button>
);

// 表单区块组件
interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormSection = ({
  title,
  description,
  children,
  className,
}: FormSectionProps) => (
  <div className={cn("space-y-4", className)}>
    <div className="space-y-1">
      <h3 className="text-lg font-medium">{title}</h3>
      {description && (
        <FormDescription className="text-base">{description}</FormDescription>
      )}
    </div>
    <div className="space-y-4">{children}</div>
  </div>
);

// 滑块输入组件
interface LabeledSliderProps {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  description?: string;
  tooltip?: string;
  disabled?: boolean;
  className?: string;
  formatValue?: (value: number) => string;
}

export const LabeledSlider = ({
  label,
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  description,
  tooltip,
  disabled = false,
  className,
  formatValue,
}: LabeledSliderProps) => (
  <FormItem className={className}>
    <div className="flex items-center justify-between">
      <FormLabel tooltip={tooltip}>{label}</FormLabel>
      <span className="text-sm text-muted-foreground">
        {formatValue ? formatValue(value) : value}
      </span>
    </div>
    <div className="px-3">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onValueChange(Number(e.target.value))}
        disabled={disabled}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
    {description && <FormDescription>{description}</FormDescription>}
  </FormItem>
);

// 文件选择组件
interface LabeledFileInputProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  register: UseFormRegister<T>;
  error?: FieldError;
  accept?: string;
  description?: string;
  tooltip?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function LabeledFileInput<T extends FieldValues>({
  label,
  name,
  register,
  error,
  accept,
  description,
  tooltip,
  required = false,
  disabled = false,
  className,
}: LabeledFileInputProps<T>) {
  return (
    <FormItem className={className}>
      <FormLabel required={required} tooltip={tooltip} htmlFor={name}>
        {label}
      </FormLabel>
      <Input
        id={name}
        type="file"
        accept={accept}
        disabled={disabled}
        {...register(name)}
        className={cn(
          "file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90",
          error && "border-red-500"
        )}
      />
      {description && <FormDescription>{description}</FormDescription>}
      <FormError error={error} />
    </FormItem>
  );
}

// 图片格式多选组件
interface LabeledImageFormatsCheckboxProps {
  label: string;
  value: string; // 逗号分隔的格式字符串
  onChange: (value: string) => void;
  error?: FieldError;
  description?: string;
  tooltip?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  options: Array<{ value: string; label: string }>;
}

export function LabeledImageFormatsCheckbox({
  label,
  value,
  onChange,
  error,
  description,
  tooltip,
  required = false,
  disabled = false,
  className,
  options,
}: LabeledImageFormatsCheckboxProps) {
  // 将逗号分隔的字符串转换为数组
  const selectedFormats = value ? value.split(",").map(f => f.trim()) : [];

  const handleFormatChange = (formatValue: string, checked: boolean) => {
    let newFormats: string[];
    
    if (checked) {
      // 添加格式
      newFormats = [...selectedFormats, formatValue];
    } else {
      // 移除格式
      newFormats = selectedFormats.filter(f => f !== formatValue);
    }
    
    // 转换回逗号分隔的字符串
    onChange(newFormats.join(","));
  };

  return (
    <FormItem className={className}>
      <FormLabel required={required} tooltip={tooltip}>
        {label}
      </FormLabel>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {options.map((option) => (
          <div
            key={option.value}
            className="flex items-center space-x-2 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
          >
            <Checkbox
              id={`format-${option.value}`}
              checked={selectedFormats.includes(option.value)}
              onCheckedChange={(checked) =>
                handleFormatChange(option.value, checked as boolean)
              }
              disabled={disabled}
              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <Label
              htmlFor={`format-${option.value}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
            >
              {option.label}
            </Label>
          </div>
        ))}
      </div>
      {description && <FormDescription>{description}</FormDescription>}
      <FormError error={error} />
    </FormItem>
  );
}
