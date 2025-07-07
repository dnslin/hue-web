"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "zustand";
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
import { useUserFilterStore } from "@/lib/store/user/filter";
import { userDataStore } from "@/lib/store/user/data";

interface UserPaginationProps {
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

// 数字动画组件（保留精巧的数字变化效果）
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

export function UserPagination({ isMobile = false }: UserPaginationProps) {
  const {
    pagination: { page: currentPage, pageSize },
    goToPage,
    setPagination,
  } = useUserFilterStore();
  const { total: totalItems, loading } = useStore(userDataStore);

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
        <motion.div
          variants={itemVariants}
          className="text-center text-sm text-muted-foreground"
        >
          第 <AnimatedNumber number={startItem} />-
          <AnimatedNumber number={endItem} /> 条，共{" "}
          <AnimatedNumber number={totalItems} /> 条
        </motion.div>

        <motion.div variants={itemVariants}>
          <Pagination>
            <PaginationContent className="gap-1">
              <PaginationItem>
                <OptimizedPaginationPrevious
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage <= 1 || loading}
                />
              </PaginationItem>
              <PaginationItem>
                <span className="flex h-8 items-center justify-center px-3 text-sm font-medium">
                  <AnimatedNumber number={currentPage} /> /{" "}
                  <AnimatedNumber number={totalPages} />
                </span>
              </PaginationItem>
              <PaginationItem>
                <OptimizedPaginationNext
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage >= totalPages || loading}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </motion.div>
      </motion.div>
    );
  }

  // PC端完整分页
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <motion.div
        variants={itemVariants}
        className="flex items-center gap-4 text-sm text-muted-foreground"
      >
        <span>
          显示第 <AnimatedNumber number={startItem} />-
          <AnimatedNumber number={endItem} /> 条，共{" "}
          <AnimatedNumber number={totalItems} /> 条
        </span>
        <div className="flex items-center gap-2">
          <span>每页显示</span>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) =>
              setPagination({ pageSize: parseInt(value) })
            }
          >
            <SelectTrigger className="w-20 h-7">
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
      </motion.div>

      <motion.div variants={itemVariants}>
        <Pagination>
          <PaginationContent className="gap-1">
            <PaginationItem>
              <OptimizedPaginationPrevious
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1 || loading}
              />
            </PaginationItem>

            {pageNumbers.map((page, index) => (
              <PaginationItem key={`${page}-${index}`}>
                {page === "ellipsis" ? (
                  <PaginationEllipsis className="h-8 w-8" />
                ) : (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <PaginationLink
                      onClick={() => goToPage(page)}
                      isActive={page === currentPage}
                      size="sm"
                      className={cn(
                        "h-8 w-8",
                        loading && "pointer-events-none opacity-50"
                      )}
                    >
                      <AnimatedNumber number={page} />
                    </PaginationLink>
                  </motion.div>
                )}
              </PaginationItem>
            ))}

            <PaginationItem>
              <OptimizedPaginationNext
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages || loading}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </motion.div>
    </motion.div>
  );
}
