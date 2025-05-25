import { create } from "zustand";

interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
}

interface AppState {
  // 用户相关状态
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // 主题相关状态
  theme: "light" | "dark" | "system";

  // 系统状态
  isUploading: boolean;
  uploadProgress: number;

  // 操作方法
  setUser: (user: User | null) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
  setIsUploading: (isUploading: boolean) => void;
  setUploadProgress: (progress: number) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // 初始状态
  user: null,
  isAuthenticated: false,
  isLoading: true,
  theme: "system",
  isUploading: false,
  uploadProgress: 0,

  // 操作方法
  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
  setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setTheme: (theme) => {
    console.log("AppStore setTheme调用:", { theme });

    set({ theme });

    // 确保DOM类正确应用
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      document.documentElement.classList.toggle("dark", systemTheme === "dark");
      console.log("系统主题应用:", {
        systemTheme,
        hasDarkClass: document.documentElement.classList.contains("dark"),
      });
    } else {
      document.documentElement.classList.toggle("dark", theme === "dark");
      console.log("主题应用:", {
        theme,
        hasDarkClass: document.documentElement.classList.contains("dark"),
      });
    }
  },
  setIsUploading: (isUploading) => set({ isUploading }),
  setUploadProgress: (uploadProgress) => set({ uploadProgress }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
