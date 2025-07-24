// components/ui/date-range-picker.tsx
// 简单的日期范围选择器组件

'use client';

import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

/**
 * 日期范围接口
 */
interface DateRange {
  from?: Date;
  to?: Date;
}

/**
 * 日期范围选择器属性
 */
interface DatePickerWithRangeProps {
  /** 起始日期 */
  from?: Date;
  /** 结束日期 */
  to?: Date;
  /** 日期选择回调 */
  onSelect?: (range: DateRange | undefined) => void;
  /** 自定义样式类名 */
  className?: string;
  /** 占位文本 */
  placeholder?: string;
}

/**
 * 日期范围选择器组件
 */
export const DatePickerWithRange: React.FC<DatePickerWithRangeProps> = ({
  from,
  to,
  onSelect,
  className,
  placeholder = '选择日期范围',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempFrom, setTempFrom] = useState<Date | undefined>(from);
  const [tempTo, setTempTo] = useState<Date | undefined>(to);

  // 格式化日期显示
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // 获取显示文本
  const getDisplayText = () => {
    if (from && to) {
      return `${formatDate(from)} - ${formatDate(to)}`;
    } else if (from) {
      return `从 ${formatDate(from)}`;
    } else if (to) {
      return `到 ${formatDate(to)}`;
    }
    return placeholder;
  };

  // 处理日期输入
  const handleFromDateChange = (value: string) => {
    const date = value ? new Date(value) : undefined;
    setTempFrom(date);
    
    // 如果起始日期晚于结束日期，清空结束日期
    if (date && tempTo && date > tempTo) {
      setTempTo(undefined);
    }
  };

  const handleToDateChange = (value: string) => {
    const date = value ? new Date(value) : undefined;
    setTempTo(date);
  };

  // 应用选择
  const handleApply = () => {
    onSelect?.({ from: tempFrom, to: tempTo });
    setIsOpen(false);
  };

  // 清除选择
  const handleClear = () => {
    setTempFrom(undefined);
    setTempTo(undefined);
    onSelect?.(undefined);
    setIsOpen(false);
  };

  // 取消选择
  const handleCancel = () => {
    setTempFrom(from);
    setTempTo(to);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            (!from && !to) && 'text-muted-foreground',
            className
          )}
        >
          <Calendar className="mr-2 h-4 w-4" />
          {getDisplayText()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">起始日期</label>
            <input
              type="date"
              value={tempFrom ? tempFrom.toISOString().split('T')[0] : ''}
              onChange={(e) => handleFromDateChange(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-md text-sm"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">结束日期</label>
            <input
              type="date"
              value={tempTo ? tempTo.toISOString().split('T')[0] : ''}
              onChange={(e) => handleToDateChange(e.target.value)}
              min={tempFrom ? tempFrom.toISOString().split('T')[0] : undefined}
              className="w-full px-3 py-2 border border-input rounded-md text-sm"
            />
          </div>
          
          <div className="flex justify-between gap-2">
            <Button variant="outline" size="sm" onClick={handleClear}>
              清除
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCancel}>
                取消
              </Button>
              <Button size="sm" onClick={handleApply}>
                确定
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DatePickerWithRange;