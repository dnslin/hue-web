"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  loading?: boolean;
  isMobile?: boolean;
}

export function UserPagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  loading = false,
  isMobile = false,
}: UserPaginationProps) {
  // 如果只有一页或没有数据，不显示分页
  if (totalPages <= 1) {
    return null;
  }

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // 生成页码数组
  const generatePageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisiblePages = isMobile ? 3 : 5;

    if (totalPages <= maxVisiblePages) {
      // 如果总页数小于等于最大显示页数，显示所有页码
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 复杂分页逻辑
      if (currentPage <= 3) {
        // 当前页在前面
        for (let i = 1; i <= Math.min(maxVisiblePages - 1, totalPages); i++) {
          pages.push(i);
        }
        if (totalPages > maxVisiblePages - 1) {
          pages.push("ellipsis");
          pages.push(totalPages);
        }
      } else if (currentPage >= totalPages - 2) {
        // 当前页在后面
        pages.push(1);
        if (totalPages > maxVisiblePages - 1) {
          pages.push("ellipsis");
        }
        for (
          let i = Math.max(totalPages - maxVisiblePages + 2, 2);
          i <= totalPages;
          i++
        ) {
          pages.push(i);
        }
      } else {
        // 当前页在中间
        pages.push(1);
        pages.push("ellipsis");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = generatePageNumbers();

  if (isMobile) {
    // 移动端简化分页
    return (
      <div className="flex flex-col gap-4">
        <div className="text-center text-sm text-muted-foreground">
          第 {startItem}-{endItem} 条，共 {totalItems} 条
        </div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => onPageChange(currentPage - 1)}
                className={
                  currentPage <= 1 || loading
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
            <PaginationItem>
              <span className="flex h-9 w-auto items-center justify-center px-3 text-sm">
                {currentPage} / {totalPages}
              </span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                onClick={() => onPageChange(currentPage + 1)}
                className={
                  currentPage >= totalPages || loading
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    );
  }

  // PC端完整分页
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>
          显示第 {startItem}-{endItem} 条，共 {totalItems} 条
        </span>
        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span>每页显示</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => onPageSizeChange(parseInt(value))}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span>条</span>
          </div>
        )}
      </div>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => onPageChange(currentPage - 1)}
              className={
                currentPage <= 1 || loading
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>

          {pageNumbers.map((page, index) => (
            <PaginationItem key={index}>
              {page === "ellipsis" ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  onClick={() => onPageChange(page)}
                  isActive={page === currentPage}
                  className={
                    loading
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              onClick={() => onPageChange(currentPage + 1)}
              className={
                currentPage >= totalPages || loading
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
