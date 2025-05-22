import { NavBar } from "@/components/shared/nav-bar";
import { Footer } from "@/components/shared/footer";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </div>
  );
}
