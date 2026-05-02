"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { HelloKittyLogo } from "./HelloKitty";

const navItems = [
  { href: "/", label: "时间轴", icon: "📅" },
  { href: "/photos", label: "照片墙", icon: "📷" },
  { href: "/diary", label: "日记", icon: "📝" },
  { href: "/miss-you", label: "想你了", icon: "💕" },
];

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/login");
    router.refresh();
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-pink-200 shadow-sm">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2">
            <HelloKittyLogo size={32} />
            <span className="font-bold text-pink-500 text-lg hidden sm:inline">航林 & 佳钰</span>
          </Link>

          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  pathname === item.href
                    ? "bg-pink-400 text-white shadow-md"
                    : "text-pink-600 hover:bg-pink-100"
                }`}
              >
                <span className="sm:hidden">{item.icon}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            ))}

            <button
              onClick={handleLogout}
              className="ml-2 px-3 py-1.5 rounded-full text-sm text-pink-400 hover:bg-pink-50 transition-all"
            >
              退出
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
