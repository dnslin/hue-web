import { useState, useEffect } from 'react'

/**
 * 响应式列数计算 Hook
 * 基于 CLAUDE.md 定义的断点规范自动计算瀑布流列数
 */
export function useResponsiveColumns() {
  const [columnCount, setColumnCount] = useState(1)

  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth
      
      // 基于 CLAUDE.md 的断点规范
      if (width < 768) {
        // Mobile: < 768px -> 1列
        setColumnCount(1)
      } else if (width < 1024) {
        // Tablet: 768px - 1023px -> 2-3列
        setColumnCount(width < 900 ? 2 : 3)
      } else {
        // Desktop: ≥ 1024px -> 3-5列
        if (width < 1200) {
          setColumnCount(3)
        } else if (width < 1600) {
          setColumnCount(4)
        } else {
          setColumnCount(5)
        }
      }
    }

    updateColumns()
    window.addEventListener('resize', updateColumns)
    return () => window.removeEventListener('resize', updateColumns)
  }, [])

  return columnCount
}