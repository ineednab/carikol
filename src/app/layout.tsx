import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Fraunces } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700", "900"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "CariKOL.id — Platform KOL untuk Creator Indonesia",
  description: "Bangun track record kamu sekali. Brand langsung tahu siapa kamu sebelum chat pertama.",
  icons: {
    icon: "data:image/svg+xml,<svg viewBox='0 0 500 500' xmlns='http://www.w3.org/2000/svg'><defs><linearGradient id='ckg' x1='60' y1='40' x2='450' y2='470' gradientUnits='userSpaceOnUse'><stop offset='0' stop-color='%236D28D9'/><stop offset='.55' stop-color='%239333EA'/><stop offset='1' stop-color='%23EC4899'/></linearGradient></defs><rect width='500' height='500' rx='128' fill='url(%23ckg)'/><g fill='none' stroke='%23fff' stroke-linecap='round' stroke-linejoin='round'><line x1='291' y1='291' x2='372' y2='372' stroke-width='46'/><circle cx='208' cy='208' r='112' stroke-width='38'/></g><path d='M208 150L222 194L266 208L222 222L208 266L194 222L150 208L194 194Z' fill='%23fff'/></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${jakarta.variable} ${fraunces.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
