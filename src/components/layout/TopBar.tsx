"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  ChevronDown,
  User,
  Mic2,
  Settings,
  LogOut,
  Shield,
  Home,
} from "lucide-react";
import Button from "../common/Button";
import NotificationBell from "./NotificationBell";
import { useAuthStore } from "../../store/authStore";

export default function TopBar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { isAuthenticated, user, logout } = useAuthStore();

  const displayName =
    user?.name || user?.username || user?.email?.split("@")[0] || "User";

  const initial = displayName.charAt(0).toUpperCase();

  const roleLabel =
    user?.role === "ADMIN"
      ? "Admin"
      : user?.role === "ARTIST"
        ? "Artist"
        : "Listener";

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
  };

  return (
    <div className="w-full h-20 bg-melora-bgPrimary/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6 md:px-10 sticky top-0 z-40 transition-all duration-base">
      <div className="flex items-center gap-6 flex-1">
        <Link href="/" className="hidden md:flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-full bg-gradient-01 shadow-soft flex items-center justify-center text-white transition-transform duration-base group-hover:scale-105">
            <Home className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold text-white group-hover:text-melora-textSecondary transition-colors duration-base">
            Home
          </span>
        </Link>

        <div className="relative w-full max-w-md hidden md:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-melora-textMuted" />
          <input
            type="text"
            placeholder="Search for songs, artists, or albums..."
            className="w-full bg-melora-surfaceLayer/50 border border-white/10 rounded-full py-2.5 pl-12 pr-4 text-sm text-white placeholder:text-melora-textMuted focus:outline-none focus:border-melora-purple focus:ring-1 focus:ring-melora-purple transition-all duration-base"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {!isAuthenticated ? (
          <div className="flex items-center gap-3">
            <Link href="/register">
              <span className="text-sm font-bold text-melora-textSecondary hover:text-white transition-colors duration-base cursor-pointer px-4 py-2">
                Sign Up
              </span>
            </Link>
            <Link href="/login">
              <Button variant="primary" className="py-2 px-6 text-sm rounded-full">
                Log In
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <NotificationBell />

            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 p-1 pr-3 rounded-full bg-melora-surfaceLayer/50 border border-white/10 hover:bg-melora-surfaceLayer transition-colors duration-base"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-01 shadow-soft flex items-center justify-center text-white font-bold text-sm">
                  {initial}
                </div>
                <ChevronDown className="w-4 h-4 text-melora-textSecondary" />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-melora-surfaceLayer/95 backdrop-blur-[24px] border border-white/10 rounded-panel shadow-glow overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-base">
                  <div className="p-4 border-b border-white/5">
                    <p className="text-white font-bold text-sm">{displayName}</p>
                    <p className="text-xs text-melora-textMuted uppercase tracking-wider mt-1">
                      {roleLabel}
                    </p>
                  </div>

                  <div className="py-2">
                    <Link
                      href="/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-melora-textSecondary hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <User className="w-4 h-4" /> Profile
                    </Link>

                    {user?.role === "ARTIST" && (
                      <Link
                        href="/artist"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-melora-textSecondary hover:text-melora-pink hover:bg-melora-pink/5 transition-colors"
                      >
                        <Mic2 className="w-4 h-4" /> Artist Studio
                      </Link>
                    )}

                    {user?.role === "ADMIN" && (
                      <Link
                        href="/admin"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-melora-textSecondary hover:text-melora-orange hover:bg-melora-orange/5 transition-colors"
                      >
                        <Shield className="w-4 h-4" /> Admin Panel
                      </Link>
                    )}

                    <Link
                      href="/settings"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-melora-textSecondary hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <Settings className="w-4 h-4" /> Settings
                    </Link>
                  </div>

                  <div className="p-2 border-t border-white/5">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-2 py-2 text-sm text-melora-textMuted hover:text-white hover:bg-white/5 rounded-md transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
