# ---- 基础镜像阶段 ----
# 定义一个包含 pnpm 的基础镜像，供所有后续阶段使用
FROM node:20-alpine as base
# 全局安装 pnpm
RUN npm install -g pnpm

# ---- 基础依赖阶段 ----
# 从 base 镜像开始，它已经包含了 pnpm
FROM base AS deps
WORKDIR /app

# 复制依赖描述文件
COPY package.json pnpm-lock.yaml* ./

# 安装所有依赖（包括 devDependencies 用于构建）
RUN pnpm install --frozen-lockfile

# ---- 构建阶段 ----
# 从 deps 镜像开始，它已经包含了 node_modules
FROM deps AS builder
WORKDIR /app

# 复制所有项目文件
COPY . .

# 执行 Next.js 构建命令
# 这将生成 .next/standalone 和 .next/static
RUN pnpm build

# ---- 生产镜像阶段 (最终优化) ----
# 使用一个干净的、不含 pnpm 的基础镜像，因为我们将使用 node 直接运行
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
# 如果需要，可以在这里设置其他生产环境变量
# ENV NEXT_PUBLIC_API_BASE_URL=...

# 从 'builder' 阶段复制 standalone 输出
# 这包含了运行所需的最小化的 server.js 和 node_modules
COPY --from=builder /app/.next/standalone ./

# 从 'builder' 阶段复制静态资源
COPY --from=builder /app/.next/static ./.next/static

# 从 'builder' 阶段复制 public 目录
COPY --from=builder /app/public ./public

# 暴露 Next.js 应用的默认端口 3000
EXPOSE 3000

# 定义容器启动时执行的命令
# 直接使用 node 运行 standalone 模式下的 server.js
CMD ["node", "server.js"]