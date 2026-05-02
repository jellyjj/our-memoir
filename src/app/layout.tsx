import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "航林 & 佳钰 · 我们的故事",
  description: "记录属于我们的每一个甜蜜时刻",
  icons: {
    icon: "/kitty/icon_new.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
