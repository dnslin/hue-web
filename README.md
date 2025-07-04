# Lsky Pro Web

> 现代化的 Lsky Pro 图床前端应用，基于 Next.js 15 构建

## 🚀 项目简介

Lsky Pro Web 是一个现代化的图床服务前端应用，采用 Next.js 15 和 React 19 构建。该项目提供完整的图像托管解决方案，包括用户管理、图片上传、存储管理和权限控制等功能。

### ✨ 主要特性

- **🎨 现代化 UI 设计**: 基于 shadcn/ui 组件库，支持明暗主题切换
- **📱 响应式设计**: 移动端优先，完美适配各种设备
- **🔐 完整的权限系统**: 基于角色的访问控制 (RBAC)
- **⚡ 高性能**: 使用 Turbopack 提升开发体验
- **🎭 丰富的动画效果**: 集成 Magic UI 和 Motion 动画库
- **🔄 状态管理**: 基于 Zustand 的轻量级状态管理
- **📊 数据可视化**: 使用 Recharts 提供直观的数据展示

## 🛠️ 技术栈

### 核心框架
- **Next.js 15** - 全栈 React 框架，使用 App Router
- **React 19** - 用户界面库
- **TypeScript** - 类型安全的 JavaScript
- **Tailwind CSS 4** - 实用优先的 CSS 框架

### UI 组件系统
- **shadcn/ui** - 现代化组件库 (New York 风格)
- **Radix UI** - 可访问的原始组件
- **Magic UI** - 高级动画组件
- **Lucide React** - 图标库

### 状态管理与表单
- **Zustand** - 轻量级状态管理
- **React Hook Form** - 高性能表单库
- **Zod** - 数据验证库

### 动画与交互
- **Motion** - 轻量级动画库
- **next-themes** - 主题切换支持

### 开发工具
- **ESLint** - 代码规范检查
- **Turbopack** - 快速构建工具

## 📦 安装与运行

### 环境要求
- Node.js 18+
- pnpm (推荐)

### 快速开始

1. **克隆项目**
```bash
git clone https://github.com/dnslin/lskypro-web.git
cd lskypro-web
```

2. **安装依赖**
```bash
pnpm install
```

3. **环境配置**
```bash
# 复制环境变量模板
cp .env.example .env.local

# 配置必要的环境变量
# NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8080/api/v1
# INTERNAL_API_URL=http://127.0.0.1:8080/api/v1
# NEXT_PUBLIC_USE_MOCK_API=false
```

4. **启动开发服务器**
```bash
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 🎯 主要脚本

| 命令 | 描述 |
|------|------|
| `pnpm dev` | 启动开发服务器 (使用 Turbopack) |
| `pnpm build` | 构建生产版本 |
| `pnpm start` | 启动生产服务器 |
| `pnpm lint` | 运行 ESLint 代码检查 |

## 📁 项目结构

```
lskypro-web/
├── app/                    # Next.js 15 App Router
│   ├── (admin)/           # 管理后台路由组
│   │   ├── dashboard/     # 仪表板
│   │   ├── users/         # 用户管理
│   │   └── settings/      # 系统设置
│   ├── (auth)/            # 认证相关路由
│   │   ├── login/         # 登录页面
│   │   └── register/      # 注册页面
│   └── page.tsx           # 首页
├── components/            # 组件库
│   ├── ui/               # shadcn/ui 基础组件
│   ├── magicui/          # Magic UI 动画组件
│   ├── admin/            # 管理后台组件
│   ├── auth/             # 认证组件
│   ├── dashboard/        # 仪表板组件
│   ├── settings/         # 设置组件
│   ├── shared/           # 共享组件
│   └── layouts/          # 布局组件
├── lib/                  # 工具库
│   ├── actions/          # Server Actions
│   ├── api/              # API 服务层
│   ├── hooks/            # 自定义 Hooks
│   ├── schema/           # Zod 验证模式
│   ├── store/            # Zustand 状态管理
│   ├── types/            # TypeScript 类型定义
│   └── utils/            # 工具函数
├── public/               # 静态资源
└── styles/               # 样式文件
```

## 🎨 设计系统

### 核心设计理念
- **现代简约**: 清晰的视觉层次，内容优先
- **移动优先**: 从移动端设计开始，逐步增强到桌面端
- **动效驱动**: 有意义的过渡和微交互

### 色彩系统
- 基于 OKLCH 色彩空间，支持主题切换
- 语义化颜色命名，支持动态调整
- 功能性颜色映射：
  - 用户相关：蓝色系统
  - 图片相关：绿色系统
  - 存储相关：橙色系统
  - 权限相关：紫色系统

### 组件特色
- **MagicCard**: 鼠标跟踪渐变效果
- **ShimmerButton**: 闪烁按钮效果
- **BorderBeam**: 边框光束动画
- **TypingAnimation**: 打字机效果

## 🔧 开发指南

### 架构特点
- **多层设计系统**: 基础层 (shadcn/ui) + 增强层 (Magic UI) + 业务层
- **模块化状态管理**: 按领域分离的 Zustand stores
- **自动化 API 集成**: 支持 camelCase ↔ snake_case 自动转换
- **类型安全**: 完整的 TypeScript 类型定义

### 开发规范
- 使用 ESLint 进行代码规范检查
- 遵循 shadcn/ui 组件设计规范
- 优先使用 Tailwind CSS 进行样式设计
- 组件复用优先，避免重复代码

### 环境配置
- **开发环境**: 使用 mock API 进行本地开发
- **生产环境**: 连接实际后端 API
- **Docker 部署**: 支持 standalone 输出模式

## 🚀 部署

### Docker 部署
```bash
# 构建镜像
docker build -t lskypro-web .

# 运行容器
docker run -p 3000:3000 lskypro-web
```

### 环境变量
```bash
# API 配置
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8080/api/v1
INTERNAL_API_URL=http://127.0.0.1:8080/api/v1

# 开发配置
NEXT_PUBLIC_USE_MOCK_API=false
```

## 📚 API 文档

项目根目录下的 `swagger.yaml` 文件包含完整的后端 API 文档，包括：
- 认证接口
- 用户管理
- 图片上传
- 存储管理
- 权限控制

## 🤝 贡献指南

1. Fork 本项目
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的修改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

### 开发注意事项
- 确保代码通过 ESLint 检查
- 新增功能需要添加相应的类型定义
- 遵循现有的代码风格和架构模式
- 移动端友好的设计优先

## 📝 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Next.js](https://nextjs.org/) - 强大的 React 框架
- [shadcn/ui](https://ui.shadcn.com/) - 优秀的组件库
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
- [Zustand](https://github.com/pmndrs/zustand) - 轻量级状态管理
- [Magic UI](https://magicui.design/) - 精美的动画组件

---

<div align="center">
  <p>如果这个项目对你有帮助，请给它一个 ⭐️</p>
</div>