import type { Metadata } from "next";
import { Sora, Newsreader } from "next/font/google";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "OmniCFO - Autonomous Corporate Treasury Agent",
  description:
    "The self-healing financial agent that audits invoices, enforces fail-closed policy gates, and triggers compliant fiat settlements through Dodo Payments.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sora.variable} ${newsreader.variable}`}>
      <body className="min-h-[100dvh] antialiased">
        {children}
      </body>
    </html>
  );
}
