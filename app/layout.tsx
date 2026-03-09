import type { Metadata } from "next";
import localFont from "next/font/local";
import { Syne, IBM_Plex_Mono } from "next/font/google";
import dynamic from "next/dynamic";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "500", "600", "700", "800"],
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
  weight: ["300", "400", "500", "600"],
});

const CustomCursor = dynamic(
  () => import("../components/layout/CustomCursor"),
  { ssr: false }
);

export const metadata: Metadata = {
  title: "StackPay - Bitcoin Payments Reimagined",
  description: "Stream, escrow, split, and yield with Bitcoin on Stacks. The future of programmable money.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${syne.variable} ${ibmPlexMono.variable}`}
    >
      <body className="antialiased">
        <CustomCursor />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
