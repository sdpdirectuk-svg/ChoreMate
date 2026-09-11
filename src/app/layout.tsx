import type { Metadata, Viewport } from "next";
import { Outfit, Sora } from "next/font/google";
import "./globals.css";
import { PwaRegister } from "@/components/pwa-register";
import { getSiteUrl } from "@/lib/env";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ChoreMate — Make helping at home a game",
    template: "%s · ChoreMate",
  },
  description:
    "ChoreMate helps families turn chores into points and rewards. Start in minutes with ready-made points and rewards.",
  applicationName: "ChoreMate",
  authors: [{ name: "ChoreMate" }],
  keywords: [
    "chores",
    "family",
    "kids",
    "rewards",
    "points",
    "household",
    "chore chart",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "ChoreMate",
    title: "ChoreMate — Make helping at home a game",
    description:
      "Do chores, earn points, unlock rewards. A simple family chore app with Quick Start defaults.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "ChoreMate — Make helping at home a game",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ChoreMate — Make helping at home a game",
    description:
      "Do chores, earn points, unlock rewards. Start in minutes with ready-made points and rewards.",
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ChoreMate",
  },
  icons: {
    icon: [{ url: "/icons/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icons/apple-touch-icon.png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0f766e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${outfit.variable} ${sora.variable} h-full`}>
      <body className="min-h-full antialiased">
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
