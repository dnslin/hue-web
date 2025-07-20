// lib/types/auth.ts
import type { User } from "./user";
import type {
  SuccessApiResponse,
  ErrorApiResponse,
} from "./common";

/**
 * 登录请求体 - 对应后端 dtos.LoginRequest
 */
export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

/**
 * 注册请求体 - 对应后端 dtos.RegisterRequest
 */
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

/**
 * 认证成功响应数据
 * 后端直接返回包含 token 和 user 的对象
 */
export interface AuthResponseData {
  token: string;
  user: User;
}

/**
 * 认证API响应类型
 */
export type AuthApiResponse =
  | SuccessApiResponse<AuthResponseData>
  | ErrorApiResponse;

/**
 * 忘记密码请求 - 对应后端 dtos.ForgotPasswordRequest
 */
export interface ForgotPasswordRequest {
  email: string;
}

/**
 * 重置密码请求 - 对应后端 dtos.ResetPasswordRequest
 */
export interface ResetPasswordRequest {
  email: string;
  password: string;
  confirmPassword: string;
  code: string;
}

/**
 * 账户激活请求 - 对应后端 dtos.AccountActivationRequest
 */
export interface AccountActivationRequest {
  email: string;
  code: string;
}

/**
 * 重发激活邮件请求 - 对应后端 dtos.ResendActivationEmailRequest
 */
export interface ResendActivationEmailRequest {
  email: string;
}

/**
 * 更新个人信息请求 - 对应后端 dtos.UpdateMeDTO
 */
export interface UpdateMeRequest {
  email?: string;
  nickname?: string;
  password?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

/**
 * 认证相关API响应类型
 */
export type AuthActionResponse = SuccessApiResponse<any> | ErrorApiResponse;
