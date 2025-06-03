import axios from "axios";

// 创建基础API客户端
// 注意：这里我们将baseURL设置为'/api'指向Next.js的API路由，而不是直接访问后端
const apiClient = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// 添加响应拦截器处理常见错误
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;

    // 处理身份验证错误
    if (response && response.status === 401) {
      // 如果不在登录页，重定向到登录页
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    // 统一错误处理
    const errorMessage = response?.data?.message || "请求失败，请稍后重试";
    console.error(`API请求错误: ${errorMessage}`);

    return Promise.reject(error);
  }
);

export default apiClient;

