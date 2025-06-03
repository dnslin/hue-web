import { NavBar } from "@/components/shared/nav-bar";
import { Footer } from "@/components/shared/footer";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <NavBar />
      <main className="flex-1 pt-16 overflow-y-auto custom-scrollbar">
        <div className="min-h-full flex flex-col">
          <div className="flex-1">
            {children}
          </div>
          <Footer />
        </div>
      </main>
    </div>
  );
}
