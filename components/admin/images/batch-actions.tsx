"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Download, Share, Edit } from "lucide-react";
import { useImageSelectionStore, useImageStore, useImageListActions } from "@/lib/store/images";
import { showToast } from "@/lib/utils/toast";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";

export function BatchActions() {
  const { selectedImageIds, clearSelection, getSelectedIds } = useImageSelectionStore();
  const selectedCount = selectedImageIds.size;
  const images = useImageStore((state) => state.images);
  const { deleteImages } = useImageListActions();
  
  // 删除确认对话框状态
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // 获取选中的图片详细信息
  const selectedImages = useMemo(() => {
    const selectedIds = getSelectedIds();
    return images.filter(image => selectedIds.includes(image.id));
  }, [images, getSelectedIds]);

  const handleBatchAction = async (action: string) => {
    switch (action) {
      case 'download':
        showToast.success(`正在下载 ${selectedCount} 张图片...`);
        break;
      case 'delete':
        // 显示删除确认对话框
        setShowDeleteDialog(true);
        break;
      case 'share':
        showToast.success(`正在生成 ${selectedCount} 张图片的分享链接...`);
        break;
      case 'edit':
        showToast.success(`正在批量编辑 ${selectedCount} 张图片...`);
        break;
    }
  };

  // 确认批量删除
  const handleConfirmDelete = async () => {
    const selectedIds = getSelectedIds();
    if (selectedIds.length === 0) return;

    const result = await deleteImages(selectedIds);
    if (result.success) {
      clearSelection();
    }
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            已选择 {selectedCount} 张图片
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSelection}
            className="h-6 px-2 text-xs"
          >
            取消选择
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleBatchAction('download')}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            下载
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleBatchAction('share')}
            className="gap-2"
          >
            <Share className="h-4 w-4" />
            分享
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleBatchAction('edit')}
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            编辑
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleBatchAction('delete')}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            删除
          </Button>
        </div>
      </div>

      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        images={selectedImages}
        onConfirm={handleConfirmDelete}
        title={`批量删除 ${selectedCount} 张图片`}
        description="此操作将删除所有选中的图片，且无法撤销"
      />
    </>
  );
}