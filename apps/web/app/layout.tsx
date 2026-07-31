import type { Metadata } from "next";
import { Prompt, Sarabun } from "next/font/google";
import "./globals.css";

const prompt = Prompt({
  variable: "--font-prompt",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
});

const sarabun = Sarabun({
  variable: "--font-sarabun",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "AuraGold Durian | สวนทุเรียนและแปรรูปพรีเมียม",
  description:
    "ทุเรียนสด เนื้อสด แช่แข็ง และอบแห้ง จากสวนถึงโต๊ะอาหาร พร้อมระบบตรวจสอบย้อนกลับ LOT / Batch",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${prompt.variable} ${sarabun.variable} scroll-smooth`} data-scroll-behavior="smooth">
      <body className="flex min-h-full flex-col antialiased">{children}</body>
    </html>
  );
}
