import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: string;
}

export interface AdminState {
  // 侧边栏状态
  sidebarCollapsed: boolean;

  // 导航状态
  currentRoute: string;
  breadcrumbs: BreadcrumbItem[];

  // 布局状态
  showRightPanel: boolean;
  rightPanelWidth: number;

  // 操作方法
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setCurrentRoute: (route: string) => void;
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;
  toggleRightPanel: () => void;
  setRightPanelWidth: (width: number) => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      // 初始状态
      sidebarCollapsed: false,
      currentRoute: "/dashboard",
      breadcrumbs: [{ label: "控制台", href: "/dashboard", icon: "dashboard" }],
      showRightPanel: false,
      rightPanelWidth: 320,

      // 侧边栏操作
      toggleSidebar: () =>
        set((state) => ({
          sidebarCollapsed: !state.sidebarCollapsed,
        })),

      setSidebarCollapsed: (collapsed: boolean) =>
        set({
          sidebarCollapsed: collapsed,
        }),

      // 导航操作
      setCurrentRoute: (route: string) =>
        set({
          currentRoute: route,
        }),

      setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) =>
        set({
          breadcrumbs,
        }),

      // 布局操作
      toggleRightPanel: () =>
        set((state) => ({
          showRightPanel: !state.showRightPanel,
        })),

      setRightPanelWidth: (width: number) =>
        set({
          rightPanelWidth: width,
        }),
    }),
    {
      name: "admin-store",
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        rightPanelWidth: state.rightPanelWidth,
        showRightPanel: state.showRightPanel,
      }),
    }
  )
);
