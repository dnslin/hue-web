"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

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

// 动画变体
const containerVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
};

const buttonVariants = {
  idle: { scale: 1, backgroundColor: "transparent" },
  hover: {
    scale: 1.05,
    backgroundColor: "hsl(var(--accent))",
    transition: { duration: 0.2 },
  },
  tap: { scale: 0.95, transition: { duration: 0.1 } },
  disabled: { scale: 1, opacity: 0.5 },
};

const activeButtonVariants = {
  idle: {
    scale: 1,
    backgroundColor: "hsl(var(--primary))",
    color: "hsl(var(--primary-foreground))",
  },
  hover: {
    scale: 1.05,
    backgroundColor: "hsl(var(--primary))",
    transition: { duration: 0.2 },
  },
  tap: { scale: 0.95, transition: { duration: 0.1 } },
};

// 数字动画组件
const AnimatedNumber = ({ number }: { number: number }) => (
  <AnimatePresence mode="wait">
    <motion.span
      key={number}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="inline-block"
    >
      {number}
    </motion.span>
  </AnimatePresence>
);

// 分页按钮组件
const PaginationButton = ({
  children,
  onClick,
  disabled = false,
  active = false,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  className?: string;
}) => (
  <motion.button
    variants={active ? activeButtonVariants : buttonVariants}
    initial="idle"
    whileHover={disabled ? "disabled" : "hover"}
    whileTap={disabled ? "disabled" : "tap"}
    animate={disabled ? "disabled" : "idle"}
    onClick={disabled ? undefined : onClick}
    disabled={disabled}
    className={cn(
      "relative flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-medium transition-colors",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      active
        ? "border-primary bg-primary text-primary-foreground shadow-sm"
        : "border-border bg-background hover:bg-accent hover:text-accent-foreground",
      disabled && "cursor-not-allowed opacity-50",
      className
    )}
  >
    {children}
  </motion.button>
);

// 椭圆指示器组件
const EllipsisIndicator = () => (
  <motion.div
    variants={itemVariants}
    className="flex h-9 w-9 items-center justify-center"
  >
    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
  </motion.div>
);

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
  // 如果没有数据，不显示分页
  if (totalItems === 0) {
    return null;
  }

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
    // 移动端精简分页
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-4"
      >
        <motion.div
          variants={itemVariants}
          className="text-center text-sm text-muted-foreground"
        >
          第 <AnimatedNumber number={startItem} />-
          <AnimatedNumber number={endItem} /> 条，共{" "}
          <AnimatedNumber number={totalItems} /> 条
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="flex items-center justify-center gap-2"
        >
          <PaginationButton
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1 || loading}
            className="px-3"
          >
            <ChevronLeft className="h-4 w-4" />
          </PaginationButton>

          <motion.div
            className="flex h-9 items-center justify-center rounded-lg border bg-background px-3 text-sm font-medium"
            variants={itemVariants}
          >
            <AnimatedNumber number={currentPage} /> /{" "}
            <AnimatedNumber number={totalPages} />
          </motion.div>

          <PaginationButton
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || loading}
            className="px-3"
          >
            <ChevronRight className="h-4 w-4" />
          </PaginationButton>
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
      className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
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
        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span>每页显示</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => onPageSizeChange(parseInt(value))}
            >
              <SelectTrigger className="w-20 h-8">
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
      </motion.div>

      <motion.div variants={itemVariants} className="flex items-center gap-1">
        <PaginationButton
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1 || loading}
          className="px-3"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline ml-1">上一页</span>
        </PaginationButton>

        <AnimatePresence mode="wait">
          {pageNumbers.map((page, index) => (
            <motion.div
              key={`${page}-${index}`}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              layout
            >
              {page === "ellipsis" ? (
                <EllipsisIndicator />
              ) : (
                <PaginationButton
                  onClick={() => onPageChange(page)}
                  active={page === currentPage}
                  disabled={loading}
                >
                  <AnimatedNumber number={page} />
                </PaginationButton>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        <PaginationButton
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || loading}
          className="px-3"
        >
          <span className="hidden sm:inline mr-1">下一页</span>
          <ChevronRight className="h-4 w-4" />
        </PaginationButton>
      </motion.div>
    </motion.div>
  );
}
