# hue Pro Web

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=nextdotjs" alt="Next.js 15" />
  <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
</div>

<div align="center">
  <h3>现代化的 hue Pro 图床前端应用</h3>
  <p>基于 Next.js 15 构建的高性能图像托管解决方案</p>
</div>

## 🚀 项目简介

hue Pro Web 是一个现代化的图床服务前端应用，采用 **Next.js 15** 和 **React 19** 构建。该项目提供完整的图像托管解决方案，包括用户管理、图片上传、存储管理和权限控制等功能。

### ✨ 核心特性

- **🎨 现代化 UI 设计**: 基于 shadcn/ui 组件库，支持明暗主题无缝切换
- **📱 响应式设计**: 移动端优先，完美适配各种设备和屏幕尺寸
- **🔐 完整的权限系统**: 基于角色的访问控制 (RBAC)，支持细粒度权限管理
- **⚡ 高性能构建**: 使用 Turbopack 提升开发体验，构建速度显著提升
- **🎭 丰富的动画效果**: 集成 Magic UI 和 Motion 动画库，提供流畅的用户体验
- **🔄 轻量级状态管理**: 基于 Zustand 的状态管理，支持数据持久化
- **📊 数据可视化**: 使用 Recharts 提供直观的数据展示和分析功能
- **🔧 开发友好**: 完整的 TypeScript 支持，严格的类型检查

## 🛠️ 技术栈

### 核心框架
- **Next.js 15** - 全栈 React 框架，使用 App Router 和 Server Components
- **React 19** - 用户界面库，支持并发特性和 Suspense
- **TypeScript 5.0** - 类型安全的 JavaScript 超集
- **Tailwind CSS 4** - 实用优先的 CSS 框架，支持 OKLCH 色彩空间

### UI 组件系统
- **shadcn/ui** - 现代化组件库 (New York 风格)，基于 Radix UI
- **Radix UI** - 可访问的原始组件，符合 ARIA 标准
- **Magic UI** - 高级动画组件，支持 GPU 加速
- **Aceternity UI** - 第三方现代 UI 组件
- **Lucide React** - 美观的图标库 (主要)
- **React Icons** - 补充图标库

### 状态管理与表单
- **Zustand** - 轻量级状态管理，支持持久化和 SSR
- **React Hook Form** - 高性能表单库，最小化重渲染
- **Zod** - 类型安全的数据验证和解析库

### 动画与交互
- **Motion** - 轻量级动画库 (非 Framer Motion)
- **next-themes** - 主题切换支持，支持系统主题检测

### 开发工具与构建
- **ESLint** - 代码规范检查和自动修复
- **Turbopack** - 快速构建工具，比 Webpack 快 700 倍
- **pnpm** - 快速、节省磁盘空间的包管理器

## 📦 安装与运行

### 系统要求
- **Node.js** 18.17.0 或更高版本
- **pnpm** 8.0.0 或更高版本 (推荐)
- **Git** 2.0 或更高版本

### 🚀 快速开始

#### 1. 克隆项目
```bash
git clone https://github.com/dnslin/hue-web.git
cd hue-web
```

#### 2. 安装依赖
```bash
# 使用 pnpm (推荐)
pnpm install

# 或使用 npm
npm install

# 或使用 yarn
yarn install
```

#### 3. 环境配置
```bash
# 复制环境变量模板
cp .env.example .env.local

# 编辑环境变量
vim .env.local
```

**必要的环境变量：**
```env
# API 配置
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8080/api/v1
INTERNAL_API_URL=http://127.0.0.1:8080/api/v1

# 开发配置
NEXT_PUBLIC_USE_MOCK_API=false

# 可选配置
NODE_ENV=development
```

#### 4. 启动开发服务器
```bash
pnpm dev
```

🎉 打开浏览器访问 [http://localhost:3000](http://localhost:3000) 查看应用

### 🔧 开发工作流

#### 代码质量检查
```bash
# ESLint 检查
pnpm lint

# TypeScript 类型检查
pnpm type-check

# 格式化代码
pnpm format
```

#### 构建与预览
```bash
# 构建生产版本
pnpm build

# 预览构建结果
pnpm start

# 分析构建产物
pnpm analyze
```

## 🎯 可用脚本

| 命令 | 描述 | 说明 |
|------|------|------|
| `pnpm dev` | 启动开发服务器 | 使用 Turbopack，支持热重载 |
| `pnpm build` | 构建生产版本 | 创建 standalone 输出 |
| `pnpm start` | 启动生产服务器 | 运行构建后的应用 |
| `pnpm lint` | 运行 ESLint | 检查代码规范和潜在问题 |
| `pnpm lint:fix` | 修复 ESLint 问题 | 自动修复可修复的问题 |
| `pnpm type-check` | TypeScript 类型检查 | 检查类型错误 |
| `pnpm format` | 格式化代码 | 使用 Prettier 格式化 |
| `pnpm clean` | 清理构建产物 | 删除 .next 和 dist 目录 |

## 📁 项目架构

### 🏗️ 目录结构
```
hue-web/
├── 📁 app/                    # Next.js 15 App Router
│   ├── 📁 (admin)/           # 管理后台路由组
│   │   ├── 📁 dashboard/     # 仪表板页面
│   │   ├── 📁 users/         # 用户管理页面
│   │   ├── 📁 roles/         # 角色管理页面
│   │   └── 📁 settings/      # 系统设置页面
│   ├── 📁 (auth)/            # 认证相关路由组
│   │   ├── 📁 login/         # 登录页面
│   │   └── 📁 register/      # 注册页面
│   ├── 📁 api/               # API 路由
│   │   └── 📁 proxy/         # 代理 API 路由
│   ├── 📄 layout.tsx         # 根布局组件
│   ├── 📄 page.tsx           # 首页组件
│   ├── 📄 loading.tsx        # 全局 loading 组件
│   ├── 📄 error.tsx          # 全局错误组件
│   └── 📄 not-found.tsx      # 404 页面
├── 📁 components/            # 组件库
│   ├── 📁 ui/               # shadcn/ui 基础组件
│   │   ├── 📄 button.tsx    # 按钮组件
│   │   ├── 📄 card.tsx      # 卡片组件
│   │   ├── 📄 input.tsx     # 输入框组件
│   │   ├── 📄 dialog.tsx    # 弹窗组件
│   │   └── 📄 ...           # 其他基础组件
│   ├── 📁 magicui/          # Magic UI 动画组件
│   │   ├── 📄 magic-card.tsx    # 鼠标跟踪卡片
│   │   ├── 📄 border-beam.tsx   # 边框光束动画
│   │   ├── 📄 meteors.tsx       # 流星背景效果
│   │   ├── 📄 shimmer-button.tsx # 闪烁按钮
│   │   └── 📄 typing-animation.tsx # 打字机效果
│   ├── 📁 admin/            # 管理后台业务组件
│   ├── 📁 auth/             # 认证相关组件
│   ├── 📁 dashboard/        # 仪表板组件
│   ├── 📁 settings/         # 设置组件
│   ├── 📁 shared/           # 共享组件
│   └── 📁 layouts/          # 布局组件
├── 📁 lib/                  # 工具库
│   ├── 📁 actions/          # Server Actions
│   ├── 📁 api/              # API 服务层
│   ├── 📁 hooks/            # 自定义 Hooks
│   ├── 📁 schema/           # Zod 验证模式
│   ├── 📁 store/            # Zustand 状态管理
│   │   ├── 📄 auth-store.ts # 认证状态
│   │   └── 📁 user/         # 用户管理状态
│   ├── 📁 types/            # TypeScript 类型定义
│   └── 📁 utils/            # 工具函数
├── 📁 public/               # 静态资源
│   ├── 📄 favicon.ico       # 网站图标
│   ├── 📁 images/           # 图片资源
│   └── 📁 icons/            # 图标资源
├── 📁 styles/               # 样式文件
│   └── 📄 globals.css       # 全局样式
├── 📄 tailwind.config.js    # Tailwind CSS 配置
├── 📄 next.config.js        # Next.js 配置
├── 📄 tsconfig.json         # TypeScript 配置
├── 📄 package.json          # 项目依赖
├── 📄 swagger.yaml          # API 文档
└── 📄 CLAUDE.md             # Claude 开发指南
```

### 🏛️ 架构特点

#### 多层设计系统
1. **基础层**: shadcn/ui 提供标准、可访问的组件
2. **增强层**: Magic UI 提供高级动画效果
3. **业务层**: 项目特定的领域组件
4. **布局层**: 响应式布局和导航系统

#### 状态管理模式
- **持久化存储**: 支持 SSR 和数据保持
- **领域特定存储**: 按功能模块分离的状态管理
- **模块化架构**: 数据、过滤、缓存和操作的分离关注

#### API 集成策略
- **自动类型转换**: camelCase ↔ snake_case
- **认证管理**: 基于 HTTP-only cookies
- **错误处理**: 统一的错误处理和用户友好的消息
- **代理调用**: 通过 `/api/proxy/*` 避免 CORS 问题

## 🎨 设计系统

### 🎯 核心设计理念
- **现代简约**: 清晰的视觉层次，内容优先，最小化装饰元素
- **移动优先**: 从移动端设计开始，逐步增强到桌面端
- **动效驱动**: 有意义的过渡和微交互，提升用户体验
- **无障碍设计**: 遵循 WCAG 指南，确保所有用户都能访问

### 🌈 色彩系统
- **OKLCH 色彩空间**: 更好的色彩感知和插值
- **CSS 变量驱动**: 支持主题切换和动态调整
- **语义化命名**: 清晰的颜色用途定义

**功能性颜色映射：**
- 👤 用户相关：蓝色系统 (`#3B82F6`)
- 🖼️ 图片相关：绿色系统 (`#10B981`)
- 💾 存储相关：橙色系统 (`#F59E0B`)
- 🔑 权限相关：紫色系统 (`#8B5CF6`)

### ✨ 特色组件
- **🎪 MagicCard**: 鼠标跟踪渐变效果
- **⚡ ShimmerButton**: 闪烁按钮效果
- **🌟 BorderBeam**: 边框光束动画
- **🌠 Meteors**: 流星背景效果
- **🔢 NumberTicker**: 数字滚动动画
- **⌨️ TypingAnimation**: 打字机效果

### 📱 响应式设计
- **移动端**: < 768px (底部导航栏 64px)
- **平板端**: 768px - 1023px (抽屉式侧边栏)
- **桌面端**: ≥ 1024px (侧边栏 240px/64px)

### 🎭 动画标准
- **快速**: 150ms (按钮点击、小型交互)
- **标准**: 200-300ms (卡片展开、组件过渡)
- **缓慢**: 500-800ms (页面过渡、加载动画)

## 📚 API 文档

### 🔗 接口概览
项目根目录下的 `swagger.yaml` 文件包含完整的后端 API 文档，涵盖：

- **🔐 认证接口**: 登录、注册、登出、token 刷新
- **👥 用户管理**: 用户 CRUD、权限管理、角色分配
- **🖼️ 图片管理**: 上传、删除、批量操作、图片信息
- **💾 存储管理**: 存储配置、容量监控、清理操作
- **🔑 权限控制**: 角色管理、权限分配、访问控制

### 🔧 API 配置
```env
# 开发环境
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1

# 生产环境
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api/v1

# 内部 API (Docker 环境)
INTERNAL_API_URL=http://backend:8080/api/v1
```

### 🚀 API 特性
- **自动类型转换**: 前端 camelCase ↔ 后端 snake_case
- **统一错误处理**: 标准化的错误响应格式
- **认证管理**: 基于 HTTP-only cookies 的安全认证
- **代理支持**: 通过 `/api/proxy/*` 避免 CORS 问题
- **Mock 支持**: 开发环境可启用 Mock API

## 🔧 开发指南

### 🏗️ 架构特点
- **多层设计系统**: 基础层 (shadcn/ui) + 增强层 (Magic UI) + 业务层
- **模块化状态管理**: 按领域分离的 Zustand stores
- **自动化 API 集成**: 支持 camelCase ↔ snake_case 自动转换
- **类型安全**: 完整的 TypeScript 类型定义和严格模式

### 📋 开发规范
- **代码风格**: 使用 ESLint + Prettier 保持一致的代码风格
- **组件设计**: 遵循 shadcn/ui 组件设计规范
- **样式优先级**: Tailwind CSS > CSS Modules > 内联样式
- **代码复用**: 优先使用现有组件，避免重复代码
- **类型定义**: 所有 API 响应和组件 props 必须有类型定义

### 🚀 最佳实践
```typescript
// ✅ 推荐的组件写法
export function UserCard({ user, onEdit, onDelete }: UserCardProps) {
  const { theme } = useTheme()
  
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle>{user.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{user.email}</p>
      </CardContent>
    </Card>
  )
}

// ✅ 推荐的 API 调用
const { data, error, isLoading } = useSWR(
  '/api/users',
  fetchUsers,
  { revalidateOnFocus: false }
)
```

### 🧪 测试策略
目前项目未配置特定的测试框架，建议：
- **单元测试**: 使用 Jest + React Testing Library
- **集成测试**: 使用 Cypress 或 Playwright
- **类型测试**: 使用 TypeScript 编译检查

## 🚀 部署指南

### 🐳 Docker 部署 (推荐)
```bash
# 1. 构建镜像
docker build -t hue-web .

# 2. 运行容器
docker run -d \
  --name hue-web \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_BASE_URL=http://your-api-url \
  hue-web

# 3. 查看日志
docker logs hue-web
```

### 📦 传统部署
```bash
# 1. 安装依赖
pnpm install

# 2. 构建项目
pnpm build

# 3. 启动服务
pnpm start
```

### ☁️ 云平台部署
**Vercel 部署**:
```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署到 Vercel
vercel --prod
```

**Netlify 部署**:
```bash
# 安装 Netlify CLI
npm i -g netlify-cli

# 部署到 Netlify
netlify deploy --prod
```

### 🔧 环境变量配置
```env
# 生产环境必需变量
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com/api/v1
INTERNAL_API_URL=https://your-api-domain.com/api/v1
NODE_ENV=production

# 可选变量
NEXT_PUBLIC_USE_MOCK_API=false
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## 🛠️ 故障排除

### 🐛 常见问题

#### 1. 开发服务器启动失败
```bash
# 清理缓存
pnpm clean

# 重新安装依赖
rm -rf node_modules pnpm-lock.yaml
pnpm install

# 重新启动
pnpm dev
```

#### 2. 构建失败
```bash
# 检查 TypeScript 错误
pnpm type-check

# 检查 ESLint 错误
pnpm lint

# 修复可修复的问题
pnpm lint:fix
```

#### 3. API 请求失败
- 检查 `NEXT_PUBLIC_API_BASE_URL` 环境变量
- 确认后端服务正在运行
- 检查网络连接和防火墙设置
- 查看浏览器开发者工具的网络标签

#### 4. 样式问题
- 确认 Tailwind CSS 配置正确
- 检查 CSS 变量是否正确设置
- 清理浏览器缓存
- 验证组件的 className 是否正确

### 📝 调试技巧
```typescript
// 开发环境调试
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', data)
}

// 使用 React DevTools
// 使用 Redux DevTools (for Zustand)
```

### 🔍 性能优化
- 使用 `next/bundle-analyzer` 分析包大小
- 启用 Next.js 的图片优化
- 使用 `React.memo` 优化组件渲染
- 合理使用 `useMemo` 和 `useCallback`

## 🤝 贡献指南

### 💡 如何贡献
1. **Fork 本项目** 到您的 GitHub 账号
2. **创建特性分支** (`git checkout -b feature/AmazingFeature`)
3. **提交您的修改** (`git commit -m 'Add some AmazingFeature'`)
4. **推送到分支** (`git push origin feature/AmazingFeature`)
5. **创建 Pull Request**

### 📝 提交规范
使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：
```bash
# 新功能
git commit -m "feat: 添加用户头像上传功能"

# 问题修复
git commit -m "fix: 修复登录页面样式问题"

# 文档更新
git commit -m "docs: 更新 API 文档"

# 样式调整
git commit -m "style: 调整按钮颜色"

# 重构
git commit -m "refactor: 重构用户管理组件"
```

### 🔍 代码审查清单
在提交 PR 前，请确保：
- [ ] 代码通过 ESLint 检查 (`pnpm lint`)
- [ ] TypeScript 类型检查通过 (`pnpm type-check`)
- [ ] 新增功能有相应的类型定义
- [ ] 遵循现有的代码风格和架构模式
- [ ] 移动端友好的设计
- [ ] 添加必要的注释和文档

### 🎯 开发优先级
当前项目重点关注：
1. **性能优化**: 提升页面加载速度和响应性能
2. **用户体验**: 改善交互设计和无障碍访问
3. **功能完善**: 补充缺失的核心功能
4. **测试覆盖**: 增加单元测试和集成测试
5. **文档完善**: 改善代码文档和用户指南

### 🐛 问题报告
发现问题？请在 [Issues](https://github.com/dnslin/hue-web/issues) 中报告，包含以下信息：
- **问题描述**: 清晰描述遇到的问题
- **复现步骤**: 详细的操作步骤
- **预期行为**: 期望的正确行为
- **实际行为**: 实际发生的情况
- **环境信息**: 浏览器版本、操作系统等
- **截图**: 如果可能，提供相关截图

## 📄 许可证

本项目采用 **MIT 许可证**。详情请查看 [LICENSE](LICENSE) 文件。

## 🙏 致谢

感谢以下优秀的开源项目和贡献者：

### 核心技术栈
- [**Next.js**](https://nextjs.org/) - 强大的 React 全栈框架
- [**React**](https://react.dev/) - 用户界面构建库
- [**TypeScript**](https://www.typescriptlang.org/) - 类型安全的 JavaScript
- [**Tailwind CSS**](https://tailwindcss.com/) - 实用优先的 CSS 框架

### UI 组件库
- [**shadcn/ui**](https://ui.shadcn.com/) - 优雅的 React 组件库
- [**Radix UI**](https://www.radix-ui.com/) - 无障碍的原始组件
- [**Magic UI**](https://magicui.design/) - 精美的动画组件库
- [**Lucide React**](https://lucide.dev/) - 美观的图标库

### 开发工具
- [**Zustand**](https://github.com/pmndrs/zustand) - 轻量级状态管理
- [**React Hook Form**](https://react-hook-form.com/) - 高性能表单库
- [**Zod**](https://zod.dev/) - 类型安全的数据验证
- [**ESLint**](https://eslint.org/) - 代码规范检查工具

### 特别感谢
- 所有为本项目贡献代码的开发者
- 提供反馈和建议的用户
- 开源社区的无私奉献

---

<div align="center">
  <h3>🌟 如果这个项目对你有帮助，请给它一个 Star！</h3>
  <p>
    <a href="https://github.com/dnslin/hue-web/stargazers">
      <img alt="GitHub stars" src="https://img.shields.io/github/stars/dnslin/hue-web?style=social">
    </a>
    <a href="https://github.com/dnslin/hue-web/network/members">
      <img alt="GitHub forks" src="https://img.shields.io/github/forks/dnslin/hue-web?style=social">
    </a>
  </p>
  <p>
    <a href="https://github.com/dnslin/hue-web/issues">报告问题</a>
    ·
    <a href="https://github.com/dnslin/hue-web/pulls">提交 PR</a>
    ·
    <a href="https://github.com/dnslin/hue-web/discussions">讨论</a>
  </p>
</div>