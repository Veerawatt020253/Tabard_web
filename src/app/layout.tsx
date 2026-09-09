import type { Metadata } from "next";
import { IBM_Plex_Sans_Thai } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const appSans = IBM_Plex_Sans_Thai({
  variable: "--font-app-sans",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "TaoBary — ยืม-คืนหนังสือได้ในไม่กี่คลิก",
    template: "%s · TaoBary",
  },
  description:
    "TaoBary คือห้องสมุดออนไลน์ที่ให้คุณค้นหา ยืม และคืนหนังสือได้ง่าย ๆ พร้อมติดตามกำหนดคืนในที่เดียว",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className={`${appSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-canvas">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
