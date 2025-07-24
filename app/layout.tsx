import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ConditionalLayout } from "@/components/layouts/conditional-layout";
import { AuthProvider } from "@/components/providers/auth-provider";
import { Toaster } from "@/components/ui/sonner";
import { getPublicSiteDetailsAction } from "@/lib/actions/settings/settings";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 动态生成元数据
export async function generateMetadata(): Promise<Metadata> {
  try {
    const siteDetails = await getPublicSiteDetailsAction();

    // 检查是否是错误响应
    if ('code' in siteDetails) {
      // 使用默认值
      return {
        title: "Hue",
        description: "现代化的图床服务，为您提供简单、功能强大且高性能的图片托管解决方案",
      };
    }

    return {
      title: siteDetails.appName || "Hue",
      description: siteDetails.siteDescription || "现代化的图床服务，为您提供简单、功能强大且高性能的图片托管解决方案",
    };
  } catch (error) {
    // 发生错误时使用默认值
    return {
      title: "Hue",
      description: "现代化的图床服务，为您提供简单、功能强大且高性能的图片托管解决方案",
    };
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme') || 'system';
                  
                  if (theme === 'system') {
                    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                    document.documentElement.classList.toggle('dark', systemTheme === 'dark');
                  } else {
                    document.documentElement.classList.toggle('dark', theme === 'dark');
                  }
                } catch (e) {
                  console.error('无法应用主题', e);
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <ConditionalLayout>{children}</ConditionalLayout>
          <Toaster position="top-center" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}

