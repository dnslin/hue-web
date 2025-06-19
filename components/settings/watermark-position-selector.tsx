"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { WATERMARK_POSITIONS } from "@/lib/types/settings";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface WatermarkPositionSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

// 位置选项配置
const POSITION_OPTIONS = [
  { value: WATERMARK_POSITIONS.TOP_LEFT, label: "左上", gridArea: "top-left" },
  {
    value: WATERMARK_POSITIONS.TOP_CENTER,
    label: "上中",
    gridArea: "top-center",
  },
  {
    value: WATERMARK_POSITIONS.TOP_RIGHT,
    label: "右上",
    gridArea: "top-right",
  },
  {
    value: WATERMARK_POSITIONS.MIDDLE_LEFT,
    label: "左中",
    gridArea: "middle-left",
  },
  {
    value: WATERMARK_POSITIONS.MIDDLE_CENTER,
    label: "中心",
    gridArea: "middle-center",
  },
  {
    value: WATERMARK_POSITIONS.MIDDLE_RIGHT,
    label: "右中",
    gridArea: "middle-right",
  },
  {
    value: WATERMARK_POSITIONS.BOTTOM_LEFT,
    label: "左下",
    gridArea: "bottom-left",
  },
  {
    value: WATERMARK_POSITIONS.BOTTOM_CENTER,
    label: "下中",
    gridArea: "bottom-center",
  },
  {
    value: WATERMARK_POSITIONS.BOTTOM_RIGHT,
    label: "右下",
    gridArea: "bottom-right",
  },
];

export const WatermarkPositionSelector = React.memo(
  ({
    value,
    onValueChange,
    disabled = false,
    className,
  }: WatermarkPositionSelectorProps) => {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="text-sm font-medium">水印位置</div>
        <div
          className="grid grid-cols-3 gap-2 p-4 border rounded-lg bg-muted/30"
          style={{
            gridTemplateAreas: `
            "top-left top-center top-right"
            "middle-left middle-center middle-right"
            "bottom-left bottom-center bottom-right"
          `,
          }}
        >
          {POSITION_OPTIONS.map((option) => (
            <Button
              key={option.value}
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={() => onValueChange(option.value)}
              className={cn(
                "relative h-12 w-full min-w-[44px] flex items-center justify-center text-xs font-medium transition-all duration-200",
                "hover:bg-primary/10 hover:border-primary/50 hover:scale-105",
                "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                "active:scale-95",
                value === option.value && [
                  "bg-primary text-primary-foreground border-primary",
                  "hover:bg-primary hover:text-primary-foreground",
                ],
                disabled &&
                  "opacity-50 cursor-not-allowed hover:scale-100 active:scale-100"
              )}
              style={{ gridArea: option.gridArea }}
              aria-label={`选择水印位置：${option.label}`}
              aria-pressed={value === option.value}
            >
              <span className="relative z-10">{option.label}</span>
              {value === option.value && (
                <Check className="absolute top-1 right-1 h-3 w-3 text-primary-foreground" />
              )}
            </Button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          选择水印在图片上的显示位置
        </p>
      </div>
    );
  }
);
