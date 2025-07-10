"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TimeSelectorProps {
  selectedPeriod: "7d" | "30d" | "90d" | "1y";
  onPeriodChange: (period: "7d" | "30d" | "90d" | "1y") => void;
}

const periodOptions = [
  { value: "7d", label: "7天", description: "过去一周" },
  { value: "30d", label: "30天", description: "过去一个月" },
  { value: "90d", label: "90天", description: "过去三个月" },
  { value: "1y", label: "1年", description: "过去一年" },
] as const;

export function TimeSelector({ selectedPeriod, onPeriodChange }: TimeSelectorProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">时间范围</span>
          </div>
          <Badge variant="outline" className="text-xs">
            <Calendar className="h-3 w-3 mr-1" />
            {periodOptions.find(p => p.value === selectedPeriod)?.description}
          </Badge>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {periodOptions.map((option) => (
            <Button
              key={option.value}
              variant={selectedPeriod === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => onPeriodChange(option.value)}
              className={cn(
                "transition-all duration-200",
                selectedPeriod === option.value && "shadow-sm"
              )}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}