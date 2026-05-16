import type React from "react";
import "@/styles/globals.css";
import type { Metadata } from "next";
import { Martian_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";

const martianMono = Martian_Mono({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-martian",
});

export const metadata: Metadata = {
  icons: {
    icon: "/favicon.ico",
  },
  title: "digiflority",
  description: "create and share a digital flower bouquet",
  openGraph: {
    title: "digiflority",
    description: "create and share a digital flower bouquet",
    images: ["https://digiflority.vercel.app/metapreview.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={martianMono.variable}>
      <head>
        <meta name="apple-mobile-web-app-title" content="Digiflority" />
      </head>
      <body className="font-martian">
        <TooltipProvider disableHoverableContent delayDuration={0}>{children}</TooltipProvider>
      </body>
    </html>
  );
}
