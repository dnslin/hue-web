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
# 从 base 镜像开始
FROM base AS builder
WORKDIR /app

# 从 'deps' 阶段复制已安装的依赖
COPY --from=deps /app/node_modules ./node_modules
# 复制所有项目文件
COPY . .

# 执行 Next.js 构建命令
RUN pnpm build

# ---- 生产镜像阶段 (优化后) ----
# 从 base 镜像开始
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# 复制 package.json 和 lockfile
COPY --from=builder /app/package.json /app/pnpm-lock.yaml* ./

# 只安装生产依赖，大大减小 node_modules 体积
RUN pnpm install --prod --frozen-lockfile

# 从 'builder' 阶段只复制构建产物
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next

# 暴露 Next.js 应用的默认端口 3000
EXPOSE 3000

# 定义容器启动时执行的命令
CMD ["pnpm", "start"]