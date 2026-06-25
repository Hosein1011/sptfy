import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

import MusicPlayer from "../components/player/MusicPlayer";
// Configure Poppins per the Melora Typography guidelines
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

// Set up the emotional and premium metadata
export const metadata: Metadata = {
  title: "Melora | Feel Every Melody",
  description:
    "A premium, calm, and immersive next-generation music streaming platform.",
  icons: {
    icon: "/favicon.ico",
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
        {/* Background Parallax & Ambient Gradients will be managed
            via global CSS or a dedicated ambient background component */}
        <div className="relative min-h-screen w-full flex flex-col">
          {children}

          {/* RENDER THE PLAYER HERE */}
          <MusicPlayer />
        </div>
      </body>
    </html>
  );
}