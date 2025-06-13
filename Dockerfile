# ---- 基础依赖阶段 ----
# 使用官方 Node.js 20 Alpine 镜像作为基础
FROM node:20-alpine AS deps
# 设置工作目录
WORKDIR /app

# 安装 pnpm 包管理器
RUN npm install -g pnpm

# 复制 package.json 和 pnpm-lock.yaml 到工作目录
# 使用通配符以兼容 pnpm-lock.yaml 可能不存在的情况
COPY package.json pnpm-lock.yaml* ./

# 使用 pnpm 安装项目依赖，--frozen-lockfile 确保使用锁定的版本
RUN pnpm install --frozen-lockfile

# ---- 构建阶段 ----
# 使用相同的 Node.js 镜像进行构建
FROM node:20-alpine AS builder
WORKDIR /app

# 从 'deps' 阶段复制已安装的依赖
COPY --from=deps /app/node_modules ./node_modules
# 复制所有项目文件
COPY . .

# 执行 Next.js 构建命令
RUN pnpm build

# ---- 生产镜像阶段 ----
# 使用轻量的 Node.js 镜像作为最终运行环境
FROM node:20-alpine AS runner
WORKDIR /app

# 设置环境变量为生产模式
ENV NODE_ENV=production

# 从 'builder' 阶段复制构建产物和必要的生产依赖
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# 暴露 Next.js 应用的默认端口 3000
EXPOSE 3000

# 定义容器启动时执行的命令
CMD ["pnpm", "start"]