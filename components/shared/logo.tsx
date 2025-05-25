import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center space-x-2 ${className}`}>
      <Image
        src="/logo.svg"
        alt="Logo"
        width={24}
        height={24}
        priority={true}
      />
      <span className="font-bold text-xl">Lsky Pro</span>
    </Link>
  );
}
