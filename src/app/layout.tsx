import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import AppShell from "../components/layout/AppShell";

// Configure Poppins per the Melora Typography guidelines
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

// Viewport configuration for responsive layout and PWA theme bar
export const viewport: Viewport = {
  themeColor: "#0B0F16",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// Set up the emotional and premium metadata with Progressive Web App specs
export const metadata: Metadata = {
  title: "Melora — Feel Every Melody",
  description:
    "A modern, emotional, immersive music platform focused on making users feel music rather than simply browse and play songs.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Melora",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} font-sans`}>
      <body
        className="
          bg-[#0B0F16]
          text-[#FFFFFF]
          antialiased
          overflow-x-hidden
          selection:bg-[#7B5CFF]
          selection:text-white
          transition-colors
          duration-500
          ease-out
        "
      >
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}