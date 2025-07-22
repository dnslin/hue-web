import Link from "next/link";
import Image from "next/image";
import { useSiteInfo } from "@/lib/hooks/use-site-info";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  const { appName, logoUrl, isLoading } = useSiteInfo();
  
  if (isLoading) {
    return (
      <Link href="/" className={`flex items-center space-x-2 ${className}`}>
        <div className="w-6 h-6 bg-muted animate-pulse rounded" />
        <div className="w-20 h-5 bg-muted animate-pulse rounded" />
      </Link>
    );
  }
  
  return (
    <Link href="/" className={`flex items-center space-x-2 ${className}`}>
      <Image
        src={logoUrl}
        alt={`${appName} Logo`}
        width={24}
        height={24}
        priority={true}
      />
      <span className="font-bold text-xl">{appName}</span>
    </Link>
  );
}
