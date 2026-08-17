"use client";

import React from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import BottomNav from "./BottomNav";
import PWAManager from "../pwa/PWAManager";
import AuthBootstrap from "../auth/AuthBootstrap";
import { AtmosphereProvider } from "../brand/AtmosphereBackground";
import { ToastProvider } from "../ui/ToastProvider";
import MusicPlayer from "../player/MusicPlayer";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AtmosphereProvider>
      <ToastProvider>
        <PWAManager />
        <AuthBootstrap />

        <div className="flex min-h-screen w-full bg-[#0B0F16] text-white">
          {/* Desktop Left Sidebar */}
          <Sidebar />

          {/* Main Layout Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Ambient Sticky TopBar */}
            <TopBar />

            {/* Main scrollable view with padding at bottom for floating player and mobile nav */}
            <div className="flex-1 pb-32 md:pb-36 overflow-x-hidden">
              {children}
            </div>

            {/* Mobile Bottom Navigation */}
            <BottomNav />
          </div>

          {/* Floating Player Component */}
          <MusicPlayer />
        </div>
      </ToastProvider>
    </AtmosphereProvider>
  );
}
