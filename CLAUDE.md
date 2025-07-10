# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
You must communicate with me in Chinese.
## Development Commands

**Essential Commands:**
- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build for production (creates standalone output) [No execution without my permission.]
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

**Package Manager:** This project uses `pnpm` as the package manager.

## Project Architecture

This is a **Next.js 15** frontend application for **Lsky Pro**, an image hosting service. The architecture follows modern React patterns with comprehensive state management and API integration.

### Technology Stack

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

#### Core Application
```
app/
├── (admin)/               # Admin route group
│   ├── dashboard/        # Dashboard pages
│   ├── users/           # User management
│   └── settings/        # Settings pages
└── (auth)/               # Authentication route group
    ├── login/           # Login page
    └── register/        # Registration page
```

#### Component Architecture
```
components/
├── ui/                   # shadcn/ui base components
│   ├── button.tsx       # Base button component
│   ├── card.tsx         # Base card component
│   ├── input.tsx        # Base input component
│   └── ...              # Other shadcn/ui components
├── magicui/             # Magic UI animation components
│   ├── magic-card.tsx   # Mouse-tracking card effects
│   ├── border-beam.tsx  # Border beam animations
│   ├── meteors.tsx      # Meteor background effects
│   ├── shimmer-button.tsx # Shimmering button effects
│   ├── typing-animation.tsx # Typewriter effects
│   └── ...              # Other advanced animation components
├── admin/               # Admin-specific business components
├── auth/                # Authentication business components
├── dashboard/           # Dashboard visualization components
├── settings/            # Settings form components
├── shared/              # Cross-cutting shared components
└── layouts/             # Layout and navigation components
```

#### State and Data Layer
```
lib/
├── store/               # Zustand stores
│   ├── auth-store.ts   # Authentication state with persistence
│   └── user/           # Modular user management stores
│       ├── data.ts     # Data management
│       ├── filter.ts   # Filtering logic
│       ├── cache..ts    # Caching layer
│       └── batch.ts    # Batch operations
├── actions/             # Server actions organized by domain
├── api/                 # API service layer with case conversion
├── schema/              # Zod schemas for validation
└── types/               # TypeScript type definitions
```

### System Architecture

#### Multi-Layer Design System
1. **Foundation Layer:** shadcn/ui provides standard, accessible components
2. **Enhancement Layer:** Magic UI provides advanced animation effects
3. **Business Layer:** Project-specific domain components
4. **Layout Layer:** Responsive layout and navigation systems

#### State Management Pattern
- **Persistent stores** with hydration handling
- **Domain-specific stores** (auth, users, settings, roles)
- **Modular architecture** with separate concerns for data, filtering, caching, and operations

#### API Integration
- **Automatic case conversion** (camelCase ↔ snake_case)
- **Authentication** via HTTP-only cookies
- **Comprehensive error handling** with user-friendly messages
- **Proxied API calls** through `/api/proxy/*` to avoid CORS
- **Environment-based configuration** with mock API support

#### Authentication System
- **Server-side sessions** with HTTP-only cookies for security
- **JWT tokens** managed server-side
- **Client-side auth state** via Zustand store
- **Hydration-aware** authentication checks
- **Role-based access control** (RBAC)

### Environment Configuration

**Required Variables:**
- `NEXT_PUBLIC_API_BASE_URL` - Backend API URL (default: http://127.0.0.1:8080/api/v1)
- `INTERNAL_API_URL` - Internal API URL for Docker deployments
- `NEXT_PUBLIC_USE_MOCK_API` - Enable/disable mock API mode

**Build Configuration:**
- Standalone output for Docker deployment
- ESLint errors ignored during production builds
- Turbopack for fast development builds
- SVG support via @svgr/webpack

**API Documentation:** `swagger.yaml` contains comprehensive API documentation for backend integration.

## UI Design Style Guide

### Design Philosophy

Lsky Pro's UI design follows these core principles:

1. **Modern Minimal Design**
   - Clear visual hierarchy with minimal decorative elements
   - Content-focused design where UI elements serve functionality
   - Generous whitespace for breathing room

2. **Mobile-First Responsive**
   - Design starts from mobile and progressively enhances to desktop
   - Ensure all functionality is touch-device friendly
   - Adapt to various screen sizes and device orientations

3. **Motion-Driven Experience**
   - Meaningful transitions and micro-interactions
   - Enhance UX without being distracting
   - Performance-first approach for smooth interactions

### Color System

#### Core Features
- **OKLCH Color Space**: Better color perception and interpolation
- **CSS Variable Driven**: Support for theme switching and dynamic adjustments
- **Semantic Naming**: Clear color purpose definitions

#### Color Variables
```css
/* Base Colors */
--background: oklch(1 0 0);          /* Background color */
--foreground: oklch(0.145 0 0);      /* Foreground color (text) */
--primary: oklch(0.205 0 0);         /* Primary color */
--secondary: oklch(0.97 0 0);        /* Secondary color */
--accent: oklch(0.97 0 0);           /* Accent color */
--muted: oklch(0.97 0 0);            /* Muted color */
--destructive: oklch(0.577 0.245 27.325); /* Danger/Error color */

/* Functional Color Mapping */
- User-related: Blue system (#3B82F6)
- Image-related: Green system (#10B981)
- Storage-related: Orange system (#F59E0B)
- Access-related: Purple system (#8B5CF6)

/* Signature Gradients */
--gradient-primary: linear-gradient(90deg, #9E7AFF 0%, #FE8BBB 100%);
```

#### Dark Mode Adaptation
- Automatic light/dark relationship inversion
- Reduced contrast to avoid eye strain
- Added transparency layers

### Layout and Spacing

#### Border Radius System
```css
--radius: 0.625rem (10px)        /* Base radius */
--radius-sm: calc(var(--radius) - 4px)  /* Small radius 6px */
--radius-md: calc(var(--radius) - 2px)  /* Medium radius 8px */
--radius-lg: var(--radius)              /* Large radius 10px */
--radius-xl: calc(var(--radius) + 4px)  /* Extra large radius 14px */
```

#### Responsive Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1023px
- **Desktop**: ≥ 1024px

#### Spacing Standards
- **Card Padding**: 24px (p-6)
- **Mobile Spacing**: 12px (gap-3), 16px (gap-4), 20px (gap-5)
- **Grid Layout**: Flexible use of gap-2 to gap-6

### Typography

#### Font System
```css
--font-sans: Geist Sans, system-ui, -apple-system, sans-serif
--font-mono: Geist Mono, ui-monospace, monospace
```

#### Font Standards
- **Base Font Size**: 14px (text-sm)
- **Mobile Input**: 16px (prevents iOS zoom)
- **Heading Hierarchy**: h1: 2rem, h2: 1.5rem, h3: 1.25rem, h4: 1.125rem
- **Font Weights**: Normal (400), Medium (500), Semibold (600), Bold (700)

### Shadow System

#### Shadow Levels
```css
shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05)     /* Subtle shadow */
shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.06)     /* Small shadow */
shadow: 0 4px 12px rgba(0, 0, 0, 0.1)        /* Standard shadow */
shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.1)    /* Large shadow */
```

#### Special Effects
- **Inset Shadow**: Button press effects
- **Multi-layer Shadow**: Creates depth hierarchy
- **Dynamic Shadow**: Enhanced hover effects

### Animation Standards

#### Animation Library
- **Motion**: Lightweight animation library (not Framer Motion)
- **Custom CSS Animations**: Optimized for specific effects

#### Transition Durations
- **Fast**: 150ms (button clicks, small interactions)
- **Standard**: 200-300ms (card expansion, component transitions)
- **Slow**: 500-800ms (page transitions, loading animations)

#### Signature Components
- **MagicCard**: Mouse tracking gradient effects
- **ShimmerButton**: Shimmering button effects
- **BorderBeam**: Border beam animations
- **Meteors**: Meteor background effects
- **NumberTicker**: Number scrolling animations
- **TypingAnimation**: Typewriter effects

#### Easing Functions
```css
/* Standard easing */
cubic-bezier(0.4, 0, 0.2, 1)

/* Elastic easing */
cubic-bezier(0.68, -0.55, 0.265, 1.55)

/* Smooth easing */
cubic-bezier(0.4, 0, 0.6, 1)
```

### Responsive Design Strategy

#### Mobile Optimization
1. **Touch Target Standards**: Minimum 44x44px with 8px spacing
2. **Layout Adaptation**: 
   - Desktop: Sidebar navigation (240px expanded/64px collapsed)
   - Mobile: Bottom navigation bar (64px height)
   - Tablet: Drawer-style sidebar
3. **Component Responsiveness**: Automatic table ↔ card view switching
4. **Performance Optimization**: will-change, lazy loading, reduced animation complexity

#### iOS Special Handling
```css
/* Safe area adaptation */
padding-bottom: env(safe-area-inset-bottom);

/* Scroll optimization */
-webkit-overflow-scrolling: touch;

/* Prevent input zoom */
input { font-size: 16px; }
```

### Component Standards

#### Button Variants and Sizes
```tsx
/* Variants */
- default: Black primary button, white text
- destructive: Red warning button
- outline: Border button, transparent background
- secondary: Gray secondary button
- ghost: No background hover effect
- link: Link style

/* Sizes */
- sm: h-8, lg: h-10, icon: size-9
```

#### Input and Card Styles
```css
/* Input Features */
- Transparent background, thin border, unified h-9 height
- Focus ring: 3px indicator, Dark mode: bg-input/30

/* Card Features */
- Border radius: rounded-xl, Shadow: shadow-sm
- Hover effect: translateY(-2px), Transition: 0.2s
```

### Admin Interface Styles

#### Sidebar and Enhanced Components
- **Sidebar**: 240px/64px width with 0.3s cubic-bezier transition
- **Role Cards**: Top gradient bar, multi-layer shadows
- **Permission Items**: Hover lift, icon scaling
- **Badge**: Shimmer sweep effect

#### Border System
```css
/* Light mode */
--admin-border: #d1d5db, --admin-border-hover: #9ca3af

/* Dark mode */
--admin-border: #4b5563, --admin-border-hover: #6b7280
```

### Best Practices

1. **Performance Priority**: GPU-accelerated transforms, proper will-change usage
2. **Accessibility**: Sufficient contrast, keyboard navigation, semantic HTML
3. **Consistency**: Follow design system, use predefined spacing/colors
4. **Progressive Enhancement**: Base functionality without JavaScript, animations as enhancement

### Development Tools

#### CSS Variable Debugging
```javascript
// View all CSS variables
Array.from(document.styleSheets)
  .flatMap(sheet => Array.from(sheet.cssRules))
  .filter(rule => rule.style && rule.selectorText === ':root')
  .flatMap(rule => Array.from(rule.style))
  .filter(prop => prop.startsWith('--'))
```

#### Testing Guidelines
- Chrome DevTools device simulation
- Real device testing priority
- Consider touch vs mouse differences

## Development Guidelines

### Testing
No specific test framework is configured. Check with the team for testing approach when implementing tests.

### Platform Requirements
- **Environment**: Ubuntu 22.04 with bash terminal
- **Commands**: All terminal commands should conform to bash syntax
- **Package Manager**: pnpm for dependency management

### Design Principles
- **Mobile-First**: UI design must be mobile compatible
- **Accessibility**: Follow WCAG guidelines and use semantic HTML
- **Performance**: Optimize for Core Web Vitals
- **Animation**: Use motion thoughtfully for enhanced UX without overwhelming users

## Communication Guidelines

### Language Usage
- **Documentation**: English (for token efficiency)
- **Communication**: Chinese (for user interaction)
- **Comments/Logs**: Chinese output as specified

### Available Tools
- **fetch MCP**: For URL requests
- **Context7 MCP**: For dependency documentation
- **Github MCP**: For repository access
- **aceternity**: For aceternity UI
- **@magicuidesign/mcp** For magicui UI

### Development Context
- Platform: Ubuntu 22.04, bash terminal environment
- All terminal commands must conform to bash syntax
- Use pnpm as package manager for all operations