import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Our Memoir",
  description: "A place for our sweetest memories",
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
