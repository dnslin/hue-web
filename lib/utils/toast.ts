import { toast } from "sonner";

/**
 * Toast 工具函数
 * 提供统一的消息提示接口
 */

export const showToast = {
  /**
   * 显示成功消息
   */
  success: (msg: string, description?: string) => {
    toast.success(message, {
      description,
      duration: 3000,
    });
  },

  /**
   * 显示错误消息
   */
  error: (msg: string, description?: string) => {
    toast.error(message, {
      description,
      duration: 5000,
    });
  },

  /**
   * 显示警告消息
   */
  warning: (msg: string, description?: string) => {
    toast.warning(message, {
      description,
      duration: 4000,
    });
  },

  /**
   * 显示信息消息
   */
  info: (msg: string, description?: string) => {
    toast.info(message, {
      description,
      duration: 3000,
    });
  },

  /**
   * 显示加载中消息
   */
  loading: (msg: string) => {
    return toast.loading(message);
  },

  /**
   * 关闭指定的toast
   */
  dismiss: (toastId?: string | number) => {
    toast.dismiss(toastId);
  },

  /**
   * 处理API错误响应的专用方法
   */
  apiError: (error: any, defaultMessage: string = "操作失败") => {
    const message = error?.message || error?.error || defaultMessage;
    toast.error(message, {
      description: error?.code ? `错误代码: ${error.code}` : undefined,
      duration: 5000,
    });
  },
};

