"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface StorageStrategyPaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  isMobile?: boolean;
}

// 轻微的动画变体
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.2,
      staggerChildren: 0.03,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 4 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.15,
      ease: "easeOut",
    },
  },
};

// 数字动画组件
const AnimatedNumber = ({ number }: { number: number }) => (
  <AnimatePresence mode="wait">
    <motion.span
      key={number}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.15, ease: "easeInOut" }}
      className="inline-block"
    >
      {number}
    </motion.span>
  </AnimatePresence>
);

// 优化的上一页按钮
const OptimizedPaginationPrevious = ({
  onClick,
  disabled,
  className,
}: {
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) => (
  <motion.a
    whileHover={disabled ? {} : { scale: 1.02 }}
    whileTap={disabled ? {} : { scale: 0.98 }}
    onClick={disabled ? undefined : onClick}
    aria-label="Go to previous page"
    className={cn(
      buttonVariants({
        variant: "ghost",
        size: "sm",
      }),
      "h-8 px-3 flex items-center gap-1.5",
      disabled && "pointer-events-none opacity-50 cursor-not-allowed",
      className
    )}
  >
    <ChevronLeft className="h-4 w-4" />
    <span className="hidden sm:inline">上一页</span>
  </motion.a>
);

// 优化的下一页按钮
const OptimizedPaginationNext = ({
  onClick,
  disabled,
  className,
}: {
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) => (
  <motion.a
    whileHover={disabled ? {} : { scale: 1.02 }}
    whileTap={disabled ? {} : { scale: 0.98 }}
    onClick={disabled ? undefined : onClick}
    aria-label="Go to next page"
    className={cn(
      buttonVariants({
        variant: "ghost",
        size: "sm",
      }),
      "h-8 px-3 flex items-center gap-1.5",
      disabled && "pointer-events-none opacity-50 cursor-not-allowed",
      className
    )}
  >
    <span className="hidden sm:inline">下一页</span>
    <ChevronRight className="h-4 w-4" />
  </motion.a>
);

export function StorageStrategyPagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  isMobile = false,
}: StorageStrategyPaginationProps) {
  // 如果没有数据，不显示分页
  if (totalItems === 0) {
    return null;
  }

  const totalPages = Math.ceil(totalItems / pageSize);
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // 生成页码数组
  const generatePageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisiblePages = isMobile ? 3 : 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= Math.min(maxVisiblePages - 1, totalPages); i++) {
          pages.push(i);
        }
        if (totalPages > maxVisiblePages - 1) {
          pages.push("ellipsis");
          pages.push(totalPages);
        }
      } else if (currentPage >= totalPages - 2) {
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
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-3"
      >
        {/* 分页信息 */}
        <motion.div
          variants={itemVariants}
          className="text-center text-sm text-muted-foreground"
        >
          显示第 <AnimatedNumber number={startItem} /> -{" "}
          <AnimatedNumber number={endItem} /> 条， 共{" "}
          <AnimatedNumber number={totalItems} /> 条
        </motion.div>

        {/* 分页控件 */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-center gap-2"
        >
          <OptimizedPaginationPrevious
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="mobile-pagination-button"
          />

          <div className="flex items-center gap-1">
            {pageNumbers.map((page, index) => (
              <React.Fragment key={index}>
                {page === "ellipsis" ? (
                  <PaginationEllipsis className="w-8 h-8" />
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onPageChange(page)}
                    className={cn(
                      buttonVariants({
                        variant: currentPage === page ? "default" : "ghost",
                        size: "sm",
                      }),
                      "w-8 h-8 p-0 mobile-pagination-button"
                    )}
                  >
                    <AnimatedNumber number={page} />
                  </motion.button>
                )}
              </React.Fragment>
            ))}
          </div>

          <OptimizedPaginationNext
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="mobile-pagination-button"
          />
        </motion.div>

        {/* 每页显示数量选择器 */}
        {onPageSizeChange && (
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-center gap-2"
          >
            <span className="text-sm text-muted-foreground">每页显示</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => onPageSizeChange(parseInt(value))}
            >
              <SelectTrigger className="w-20 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">条</span>
          </motion.div>
        )}
      </motion.div>
    );
  }

  // 桌面端完整分页
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex items-center justify-between"
    >
      {/* 分页信息 */}
      <motion.div
        variants={itemVariants}
        className="text-sm text-muted-foreground"
      >
        显示第 <AnimatedNumber number={startItem} /> -{" "}
        <AnimatedNumber number={endItem} /> 条， 共{" "}
        <AnimatedNumber number={totalItems} /> 条
      </motion.div>

      {/* 分页控件 */}
      <motion.div variants={itemVariants}>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <OptimizedPaginationPrevious
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
              />
            </PaginationItem>

            {pageNumbers.map((page, index) => (
              <PaginationItem key={index}>
                {page === "ellipsis" ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    onClick={() => onPageChange(page)}
                    isActive={currentPage === page}
                    className="cursor-pointer"
                  >
                    <AnimatedNumber number={page} />
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            <PaginationItem>
              <OptimizedPaginationNext
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </motion.div>

      {/* 每页显示数量选择器 */}
      {onPageSizeChange && (
        <motion.div variants={itemVariants} className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">每页显示</span>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => onPageSizeChange(parseInt(value))}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">条</span>
        </motion.div>
      )}
    </motion.div>
  );
}
