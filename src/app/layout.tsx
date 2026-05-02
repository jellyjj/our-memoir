import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "我们的回忆 💕",
  description: "情侣回忆录 - 记录每一个甜蜜瞬间",
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
