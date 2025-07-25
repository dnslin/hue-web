"use client";

import { Button } from "@/components/ui/button";
import { Trash2, Download, Share, Edit } from "lucide-react";
import { useImageSelectionStore } from "@/lib/store/images";
import { showToast } from "@/lib/utils/toast";

export function BatchActions() {
  const { selectedImageIds, clearSelection } = useImageSelectionStore();
  const selectedCount = selectedImageIds.size;

  const handleBatchAction = async (action: string) => {
    // TODO: 实现批量操作逻辑
    switch (action) {
      case 'download':
        showToast.success(`正在下载 ${selectedCount} 张图片...`);
        break;
      case 'delete':
        showToast.success(`已删除 ${selectedCount} 张图片`);
        clearSelection();
        break;
      case 'share':
        showToast.success(`正在生成 ${selectedCount} 张图片的分享链接...`);
        break;
      case 'edit':
        showToast.success(`正在批量编辑 ${selectedCount} 张图片...`);
        break;
    }
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
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
  );
}