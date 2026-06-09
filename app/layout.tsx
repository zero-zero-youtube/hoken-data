import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import HeaderNav from "@/components/HeaderNav";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "保険料相場データベース【職業・年齢別】無料｜保険データドットコム",
    template: "%s｜保険データドットコム",
  },
  description: "職業・年齢・家族構成から適正な保険料の目安を調べられる無料データベース。政府統計に基づく客観的な保険料相場情報を提供。",
  metadataBase: new URL("https://hoken-data.com"),
  openGraph: {
    siteName: "保険データドットコム",
    locale: "ja_JP",
    type: "website",
  },
  verification: {
    google: "QUjvw9AvweWwLuEXGKn-yLuQPW20uTUI7gEOlHoh6P8",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#f8fafc] text-[#1e293b]">
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-HZGB3X0LDS"
          strategy="afterInteractive"
        />
        <Script id="ga4" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-HZGB3X0LDS');
          `}
        </Script>
        <HeaderNav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
