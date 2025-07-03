# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Essential Commands:**
- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build for production (creates standalone output)
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

**Package Manager:** This project uses `pnpm` as the package manager.

## Project Architecture

This is a **Next.js 15** frontend application for **Lsky Pro**, an image hosting service. The architecture follows modern React patterns with comprehensive state management and API integration.

### Key Technology Stack

#### Core Framework
- **Framework:** Next.js 15 with App Router and React 19
- **Styling:** Tailwind CSS 4
- **State Management:** Zustand with persistence
- **Forms:** React Hook Form with Zod validation
- **API Client:** Axios with custom interceptors
- **Theme:** next-themes for dark/light mode

#### UI Component System
- **shadcn/ui:** Core UI component library (New York style)
- **Magic UI:** Advanced animation components for enhanced UX
- **Aceternity UI:** Third-party modern UI components
- **Radix UI:** Underlying primitive components for accessibility
- **Icons:** Lucide React (primary) + React Icons (supplementary)

#### Animation Framework
- **Motion:** Lightweight animation library (not Framer Motion)
- **Features:** GPU-accelerated animations, mouse tracking effects, micro-interactions
- **Performance:** Optimized for both desktop and mobile experiences

### Directory Structure

**Core Application Structure:**
- `app/` - Next.js App Router structure
  - `(admin)/` - Admin route group with dashboard, users, settings
  - `(auth)/` - Authentication route group (login, register)

**Component Architecture:**
```
components/
├── ui/                     # shadcn/ui base components
│   ├── button.tsx         # Base button component
│   ├── card.tsx           # Base card component
│   ├── input.tsx          # Base input component
│   └── ...                # Other shadcn/ui components
├── magicui/               # Magic UI animation components
│   ├── magic-card.tsx     # Mouse-tracking card effects
│   ├── animated-grid-pattern.tsx
│   ├── border-beam.tsx
│   ├── box-reveal.tsx
│   ├── interactive-hover-button.tsx
│   ├── meteors.tsx
│   ├── number-ticker.tsx
│   ├── ripple-button.tsx
│   ├── shimmer-button.tsx
│   ├── shine-border.tsx
│   ├── text-animate.tsx
│   ├── typing-animation.tsx
│   └── ...                # Other advanced animation components
├── admin/                 # Admin-specific business components
├── auth/                  # Authentication business components
├── dashboard/             # Dashboard visualization components
├── settings/              # Settings form components
├── shared/                # Cross-cutting shared components
└── layouts/               # Layout and navigation components
```

**State and Data Layer:**
- `lib/store/` - Zustand stores with sophisticated patterns
  - `auth-store.ts` - Comprehensive auth state with persistence
  - `user/` - Modular user management stores (data, filters, cache, etc.)
- `lib/actions/` - Server actions organized by domain
- `lib/api/` - API service layer with case conversion and error handling
- `lib/schema/` - Zod schemas for validation
- `lib/types/` - TypeScript type definitions

### UI System Architecture

#### Multi-Layer Design System
1. **Foundation Layer:** shadcn/ui provides standard, accessible components
2. **Enhancement Layer:** Magic UI provides advanced animation effects
3. **Business Layer:** Project-specific domain components
4. **Layout Layer:** Responsive layout and navigation systems

#### Animation Performance
- **Motion Library:** Lighter weight than Framer Motion, better performance
- **Hardware Acceleration:** Leverages GPU rendering for smooth animations
- **Lazy Loading:** Component-level animation imports
- **Mobile Optimization:** Touch-optimized interactions and performance

### State Management Architecture

**Zustand Store Pattern:**
- Persistent stores with hydration handling
- Domain-specific stores (auth, users, settings, roles)
- Modular user store architecture with separate concerns:
  - Data management (`user-data.store.ts`)
  - Filtering (`user-filter.store.ts`)
  - Caching (`user-cache.store.ts`)
  - Batch operations (`user-batch.store.ts`)

### API Integration

**Custom API Service:**
- Automatic case conversion (camelCase ↔ snake_case)
- Authentication via HTTP-only cookies
- Comprehensive error handling with user-friendly messages
- Token expiration handling with automatic cleanup

**Key Features:**
- Proxied API calls through `/api/proxy/*` to avoid CORS
- Environment-based API URL configuration
- Mock API support via `NEXT_PUBLIC_USE_MOCK_API`

### Authentication System

The auth system uses server-side sessions with HTTP-only cookies for security:
- JWT tokens managed server-side
- Zustand store for client-side auth state
- Hydration-aware authentication checks
- Automatic token expiration handling
- Role-based access control (RBAC)

### Component Patterns

**UI Components:** Multi-layered component system with shadcn/ui + Magic UI
**Form Handling:** React Hook Form with Zod validation schemas
**Layout System:** Conditional layouts based on route groups and auth state
**Animation Integration:** Motion-powered micro-interactions and transitions

### Development Notes

**Environment Configuration:**
- `NEXT_PUBLIC_API_BASE_URL` - Backend API URL (default: http://127.0.0.1:8080/api/v1)
- `INTERNAL_API_URL` - Internal API URL for Docker deployments
- `NEXT_PUBLIC_USE_MOCK_API` - Enable/disable mock API mode

**Build Configuration:**
- Standalone output for Docker deployment
- ESLint errors ignored during production builds
- Turbopack for fast development builds
- SVG support via @svgr/webpack

**API Documentation:** `swagger.yaml` contains comprehensive API documentation for backend integration.

### Mobile Compatibility

**Responsive Design:**
- All components support mobile-first responsive design
- Touch-optimized interactions and gestures
- Performance-optimized animations for mobile devices
- Adaptive layouts for different screen sizes

**Animation Considerations:**
- Reduced motion preferences support
- Battery and performance optimizations
- Touch-friendly interaction zones

## Testing

No specific test framework is configured. Check with the team for testing approach when implementing tests.

## Development Platform

**Environment:** Ubuntu 22.04 with bash terminal
**Commands:** All terminal commands should conform to bash syntax
**Package Manager:** pnpm for dependency management

## Design Guidelines

- **Mobile-First:** UI design must be mobile compatible
- **Accessibility:** Follow WCAG guidelines and use semantic HTML
- **Performance:** Optimize for Core Web Vitals
- **Animation:** Use motion thoughtfully for enhanced UX without overwhelming users

## Necessary Conditions

1. Please use Chinese output for comments and logs
2. If you need to use the fetch MCP to request the URL you want, and you can use the Context7 MCP to get the latest documentation of certain dependencies, and you can use the Github MCP to get the repository and code.
3. Our development platform is on Ubuntu 22.04, the terminal environment is bash, the commands you have given should conform to the syntax of bash.

## Design Guidelines

- Your UI style needs to be mobile compatible

## Communication Guidelines

- You have to talk to me in Chinese.
- Available MCP tools: fetch MCP for URL requests, Context7 MCP for dependency documentation, Github MCP for repository access