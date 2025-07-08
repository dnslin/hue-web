"use client";

import React, { useState, useMemo } from "react";
import { 
  Check, 
  Ban, 
  X, 
  Shield, 
  Users, 
  MoreHorizontal,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUserSelectionStore } from "@/lib/store/user/selection";
import { useUserBatchStore, BatchAction } from "@/lib/store/user/batch";
import { userDataStore } from "@/lib/store/user/data";
import { UserStatus } from "@/lib/types/user";
import { cn } from "@/lib/utils";

interface BatchActionsProps {
  className?: string;
  isMobile?: boolean;
}

interface ConfirmDialogState {
  open: boolean;
  action: BatchAction | null;
  title: string;
  description: string;
  needsReason: boolean;
}

/**
 * 根据批量操作类型获取允许的用户状态
 */
const getAllowedStatusesForAction = (action: BatchAction): UserStatus[] => {
  switch (action) {
    case "approve":
      return [UserStatus.PENDING];
    case "ban":
      return [UserStatus.NORMAL];
    case "reject":
      return [UserStatus.PENDING];
    case "unban":
      return [UserStatus.BANNED];
    default:
      return [];
  }
};

export function BatchActions({ className, isMobile = false }: BatchActionsProps) {
  const { selectedUserIds, clearSelection } = useUserSelectionStore();
  const { executeBatchAction, isBatching } = useUserBatchStore();
  const allUsers = userDataStore.getState().users;
  
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    open: false,
    action: null,
    title: "",
    description: "",
    needsReason: false,
  });
  const [reason, setReason] = useState("");

  const selectedCount = selectedUserIds.size;

  // 计算每种操作能够执行的用户数
  const actionCounts = useMemo(() => {
    const selectedIds = Array.from(selectedUserIds);
    const counts: Record<BatchAction, { valid: number; total: number; filteredIds: number[] }> = {
      approve: { valid: 0, total: selectedIds.length, filteredIds: [] },
      ban: { valid: 0, total: selectedIds.length, filteredIds: [] },
      reject: { valid: 0, total: selectedIds.length, filteredIds: [] },
      unban: { valid: 0, total: selectedIds.length, filteredIds: [] },
    };

    (['approve', 'ban', 'reject', 'unban'] as BatchAction[]).forEach(action => {
      const allowedStatuses = getAllowedStatusesForAction(action);
      const validIds: number[] = [];
      const filteredIds: number[] = [];

      selectedIds.forEach(id => {
        const user = allUsers.find((u: any) => u.id === id);
        if (user && allowedStatuses.includes(user.status)) {
          validIds.push(id);
        } else {
          filteredIds.push(id);
        }
      });

      counts[action] = {
        valid: validIds.length,
        total: selectedIds.length,
        filteredIds
      };
    });

    return counts;
  }, [selectedUserIds, allUsers]);

  const handleBatchAction = (action: BatchAction) => {
    const actionCount = actionCounts[action];
    const actionConfig = {
      approve: {
        title: "批量批准用户",
        description: actionCount.valid > 0 
          ? `确定要批准选中的 ${actionCount.valid} 个待审核用户吗？`
          : `选中的用户中没有待审核状态的用户可以批准。`,
        needsReason: false,
      },
      ban: {
        title: "批量封禁用户",
        description: actionCount.valid > 0
          ? `确定要封禁选中的 ${actionCount.valid} 个正常用户吗？此操作将禁止这些用户登录系统。`
          : `选中的用户中没有正常状态的用户可以封禁。`,
        needsReason: false,
      },
      reject: {
        title: "批量拒绝用户",
        description: actionCount.valid > 0
          ? `确定要拒绝选中的 ${actionCount.valid} 个待审核用户吗？请说明拒绝理由。`
          : `选中的用户中没有待审核状态的用户可以拒绝。`,
        needsReason: actionCount.valid > 0,
      },
      unban: {
        title: "批量解封用户",
        description: actionCount.valid > 0
          ? `确定要解封选中的 ${actionCount.valid} 个封禁用户吗？`
          : `选中的用户中没有封禁状态的用户可以解封。`,
        needsReason: false,
      },
    };

    const config = actionConfig[action];
    setConfirmDialog({
      open: true,
      action,
      title: config.title,
      description: config.description,
      needsReason: config.needsReason,
    });
    setReason("");
  };

  const confirmBatchAction = async () => {
    if (!confirmDialog.action) return;

    const result = await executeBatchAction(
      confirmDialog.action,
      confirmDialog.needsReason ? reason : undefined
    );

    if (result.success) {
      setConfirmDialog({
        open: false,
        action: null,
        title: "",
        description: "",
        needsReason: false,
      });
      setReason("");
    }
  };

  const cancelBatchAction = () => {
    setConfirmDialog({
      open: false,
      action: null,
      title: "",
      description: "",
      needsReason: false,
    });
    setReason("");
  };

  if (selectedCount === 0) {
    return null;
  }

  // 移动端布局
  if (isMobile) {
    return (
      <>
        <div className={cn(
          "fixed bottom-20 left-4 right-4 z-40 bg-background/95 backdrop-blur-sm border rounded-xl p-3 space-y-3",
          "transform transition-all duration-300 ease-in-out",
          "shadow-xl border-border/50",
          "animate-in slide-in-from-bottom-2 fade-in-0",
          className
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 rounded-full">
                <Users className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-sm font-medium">
                已选择 <span className="font-bold text-primary">{selectedCount}</span> 个用户
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSelection}
              disabled={isBatching}
              className="h-7 px-2 text-xs rounded-full"
            >
              取消
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBatchAction("approve")}
              disabled={isBatching}
              className="gap-1.5 h-8 text-xs rounded-lg bg-green-50 border-green-200 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300 transition-all duration-200"
            >
              <Check className="h-3.5 w-3.5" />
              批准
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBatchAction("reject")}
              disabled={isBatching}
              className="gap-1.5 h-8 text-xs rounded-lg bg-red-50 border-red-200 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300 transition-all duration-200"
            >
              <X className="h-3.5 w-3.5" />
              拒绝
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBatchAction("ban")}
              disabled={isBatching}
              className="gap-1.5 h-8 text-xs rounded-lg bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-300 transition-all duration-200"
            >
              <Ban className="h-3.5 w-3.5" />
              封禁
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBatchAction("unban")}
              disabled={isBatching}
              className="gap-1.5 h-8 text-xs rounded-lg bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300 transition-all duration-200"
            >
              <Shield className="h-3.5 w-3.5" />
              解封
            </Button>
          </div>
          
          {/* 小装饰元素 */}
          <div className="absolute top-2 right-3">
            <div className="w-1 h-1 bg-primary/30 rounded-full"></div>
          </div>
        </div>

        <Dialog open={confirmDialog.open} onOpenChange={cancelBatchAction}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{confirmDialog.title}</DialogTitle>
              <DialogDescription>{confirmDialog.description}</DialogDescription>
            </DialogHeader>
            
            {/* 显示过滤信息 */}
            {confirmDialog.action && actionCounts[confirmDialog.action] && (
              (() => {
                const count = actionCounts[confirmDialog.action];
                const filteredCount = count.total - count.valid;
                
                return (
                  <>
                    {filteredCount > 0 && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          选中的 {count.total} 个用户中，有 {filteredCount} 个用户因状态不符合而被过滤，
                          实际将对 {count.valid} 个用户执行操作。
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {count.valid === 0 && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          选中的用户中没有符合条件的用户，无法执行此操作。
                        </AlertDescription>
                      </Alert>
                    )}
                  </>
                );
              })()
            )}
            
            {confirmDialog.needsReason && (
              <div className="space-y-2">
                <Label htmlFor="reason">拒绝理由</Label>
                <Textarea
                  id="reason"
                  placeholder="请输入拒绝理由..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                />
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={cancelBatchAction}>
                取消
              </Button>
              <Button 
                onClick={confirmBatchAction}
                disabled={
                  isBatching || 
                  (confirmDialog.needsReason && !reason.trim()) ||
                  (confirmDialog.action ? (actionCounts[confirmDialog.action]?.valid === 0) : false)
                }
              >
                {isBatching && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                确认
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // 桌面端布局
  return (
    <>
      <div className={cn(
        "flex items-center justify-between p-4 bg-muted/50 rounded-lg border",
        "transition-all duration-200 ease-in-out",
        className
      )}>
        <div className="flex items-center gap-3">
          <Users className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium">
            已选择 <Badge variant="secondary" className="mx-1">{selectedCount}</Badge> 个用户
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBatchAction("approve")}
              disabled={isBatching}
              className="gap-2"
            >
              <Check className="h-4 w-4" />
              批准
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBatchAction("reject")}
              disabled={isBatching}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              拒绝
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={isBatching}>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleBatchAction("ban")}>
                  <Ban className="mr-2 h-4 w-4" />
                  批量封禁
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBatchAction("unban")}>
                  <Shield className="mr-2 h-4 w-4" />
                  批量解封
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* 移动端显示更多操作菜单 */}
          <div className="sm:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={isBatching}>
                  操作
                  <MoreHorizontal className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleBatchAction("approve")}>
                  <Check className="mr-2 h-4 w-4" />
                  批量批准
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBatchAction("reject")}>
                  <X className="mr-2 h-4 w-4" />
                  批量拒绝
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleBatchAction("ban")}>
                  <Ban className="mr-2 h-4 w-4" />
                  批量封禁
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBatchAction("unban")}>
                  <Shield className="mr-2 h-4 w-4" />
                  批量解封
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSelection}
            disabled={isBatching}
          >
            取消选择
          </Button>
        </div>
      </div>

      <Dialog open={confirmDialog.open} onOpenChange={cancelBatchAction}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{confirmDialog.title}</DialogTitle>
            <DialogDescription>{confirmDialog.description}</DialogDescription>
          </DialogHeader>
          
          {/* 显示过滤信息 */}
          {confirmDialog.action && actionCounts[confirmDialog.action] && (
            (() => {
              const count = actionCounts[confirmDialog.action];
              const filteredCount = count.total - count.valid;
              
              return (
                <>
                  {filteredCount > 0 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        选中的 {count.total} 个用户中，有 {filteredCount} 个用户因状态不符合而被过滤，
                        实际将对 {count.valid} 个用户执行操作。
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {count.valid === 0 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        选中的用户中没有符合条件的用户，无法执行此操作。
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              );
            })()
          )}
          
          {confirmDialog.needsReason && (
            <div className="space-y-2">
              <Label htmlFor="reason">拒绝理由</Label>
              <Textarea
                id="reason"
                placeholder="请输入拒绝理由..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={cancelBatchAction}>
              取消
            </Button>
            <Button 
              onClick={confirmBatchAction}
              disabled={
                isBatching || 
                (confirmDialog.needsReason && !reason.trim()) ||
                (confirmDialog.action ? (actionCounts[confirmDialog.action]?.valid === 0) : false)
              }
            >
              {isBatching && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              确认
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}