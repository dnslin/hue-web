// lib/types/auth.ts
import type { User } from "./user";

/**
 * 登录请求体 - 基于 swagger.yaml controllers.LoginRequest
 */
export interface LoginRequest {
  usernameOrEmail: string;
  password: string; // 根据 swagger.yaml controllers.LoginRequest，密码是必填的
}

/**
 * 注册请求体 - 基于 swagger.yaml controllers.RegisterRequest
 */
export interface RegisterRequest {
  username: string;
  email: string;
  password: string; // 根据 swagger.yaml controllers.RegisterRequest，密码是必填的
}

/**
 * 认证成功响应体
 * 后端直接返回包含 token 和 user 的对象
 */
export interface AuthResponseData {
  token: string;
  user: User;
  message?: string; // 可选的消息字段
}

/**
 * 认证相关的Server Action统一成功响应结构
 */
export interface ActionSuccessResponse<T = AuthResponseData> {
  success: true;
  data: T;
  message?: string;
}

/**
 * 认证相关的Server Action统一错误响应结构
 */
export interface ActionErrorResponse {
  success: false;
  message: string;
  error?: any; // 更详细的错误信息
  code?: number; // HTTP状态码或业务错误码
}

/**
 * Server Action 的通用返回类型
 */
export type ServerActionResponse<TSuccessData = AuthResponseData> =
  | ActionSuccessResponse<TSuccessData>
  | ActionErrorResponse;

// 新增：忘记密码请求接口
export interface ForgotPasswordRequest {
  email: string;
}

// 新增：重置密码请求接口
export interface ResetPasswordRequest {
  email: string;
  password: string;
  confirmPassword: string;
  code: string;
}

// 新增：账户激活请求接口
export interface AccountActivationRequest {
  email: string;
  code: string;
}

// 新增：重发激活邮件请求接口
export interface ResendActivationEmailRequest {
  email: string;
}

// 新增：密码重置和激活相关的响应类型
export interface PasswordResetResponse {
  message: string;
}

export interface AccountActivationResponse {
  message: string;
  user?: User;
}

export interface ResendActivationResponse {
  message: string;
}
