"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  User,
  Mic2,
  Settings,
  LogOut,
  Shield,
  Heart,
  Library,
  Crown,
  Sparkles,
} from "lucide-react";
import MeloraLogo from "../brand/MeloraLogo";
import SearchBar from "../ui/SearchBar";
import Button from "../common/Button";
import NotificationBell from "./NotificationBell";
import PWAInstallButton from "../pwa/PWAInstallButton";
import { useAuthStore } from "../../store/authStore";
import { useAtmosphere } from "../brand/AtmosphereBackground";

export default function TopBar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const router = useRouter();

  const { isAuthenticated, user, logout } = useAuthStore();
  const { activeMood } = useAtmosphere();

  const displayName =
    user?.name || user?.username || user?.email?.split("@")[0] || "Listener";

  const initial = displayName.charAt(0).toUpperCase();

  const roleLabel =
    user?.role === "ADMIN"
      ? "Admin"
      : user?.role === "ARTIST"
        ? "Artist"
        : `${user?.tier || "Free"} Member`;

  const handleSearchSubmit = (value: string) => {
    setSearchValue(value);
    if (value.trim()) {
      router.push(`/search?q=${encodeURIComponent(value.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    router.push("/login");
  };

  return (
    <header className="w-full h-18 md:h-20 bg-[#0B0F16]/70 backdrop-blur-xl border-b border-white/6 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40 transition-all duration-base">
      {/* Left Area: Mobile Logo & Desktop Search */}
      <div className="flex items-center gap-6 flex-1 max-w-2xl">
        {/* Mobile Logo */}
        <div className="md:hidden">
          <MeloraLogo size="sm" showWordmark={false} href="/" />
        </div>

        {/* Global Search Bar (Desktop) */}
        <div className="hidden md:block w-full max-w-md">
          <SearchBar
            value={searchValue}
            onChange={handleSearchSubmit}
            placeholder="Search songs, artists, albums, or moods... (Press /)"
            size="sm"
          />
        </div>

        {/* Active Mood Pill indicator on desktop */}
        {activeMood !== "All" && (
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-melora-purple/15 border border-melora-purple/30 text-xs font-semibold text-melora-lavender">
            <Sparkles className="w-3.5 h-3.5 text-melora-pink animate-pulse" />
            <span>Atmosphere: {activeMood}</span>
          </div>
        )}
      </div>

      {/* Right Controls Area */}
      <div className="flex items-center gap-2.5 md:gap-4 shrink-0">
        {/* PWA Install Button */}
        <PWAInstallButton variant="topbar" />

        {!isAuthenticated ? (
          <div className="flex items-center gap-2 md:gap-3">
            <Link href="/register">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                Sign Up
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="primary" size="sm" className="rounded-full shadow-glow">
                Log In
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-2 md:gap-3">
            <NotificationBell />

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 p-1 pr-2.5 rounded-full bg-melora-cardSurface/70 border border-white/10 hover:border-melora-purple/40 hover:bg-melora-surfaceHover transition-all duration-micro"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-primary shadow-soft flex items-center justify-center text-white font-bold text-xs overflow-hidden shrink-0">
                  {(user?.profileImage || user?.avatarUrl) ? (
                    <img
                      src={(user?.profileImage || user?.avatarUrl)!}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    initial
                  )}
                </div>
                <span className="hidden sm:inline-block text-xs font-bold text-white max-w-[100px] truncate">
                  {displayName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-melora-textSecondary" />
              </button>

              {isDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-3 w-60 glass-modal rounded-card-lg border border-white/10 shadow-glow-purple overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-micro">
                    {/* Header */}
                    <div className="p-4 border-b border-white/6 bg-white/[0.02]">
                      <p className="text-white font-bold text-sm truncate">
                        {displayName}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Crown className="w-3 h-3 text-melora-orange" />
                        <p className="text-[11px] text-melora-textMuted uppercase tracking-wider font-semibold">
                          {roleLabel}
                        </p>
                      </div>
                    </div>

                    {/* Menu links */}
                    <div className="py-2 px-1.5 space-y-0.5">
                      <Link
                        href="/profile"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-btn text-xs font-medium text-melora-textSecondary hover:text-white hover:bg-white/8 transition-colors"
                      >
                        <User className="w-4 h-4 text-melora-purple" />
                        <span>Your Profile</span>
                      </Link>

                      <Link
                        href="/library"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-btn text-xs font-medium text-melora-textSecondary hover:text-white hover:bg-white/8 transition-colors"
                      >
                        <Library className="w-4 h-4 text-melora-pink" />
                        <span>Music Library</span>
                      </Link>

                      {user?.role === "ARTIST" && (
                        <Link
                          href="/artist"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-btn text-xs font-medium text-melora-pink hover:bg-melora-pink/10 transition-colors"
                        >
                          <Mic2 className="w-4 h-4" />
                          <span>Artist Studio</span>
                        </Link>
                      )}

                      {user?.role === "ADMIN" && (
                        <Link
                          href="/admin"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-btn text-xs font-medium text-melora-orange hover:bg-melora-orange/10 transition-colors"
                        >
                          <Shield className="w-4 h-4" />
                          <span>Admin Console</span>
                        </Link>
                      )}

                      <Link
                        href="/settings"
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 rounded-btn text-xs font-medium text-melora-textSecondary hover:text-white hover:bg-white/8 transition-colors"
                      >
                        <Settings className="w-4 h-4 text-melora-textMuted" />
                        <span>Settings & Audio</span>
                      </Link>

                      <PWAInstallButton variant="menu" />
                    </div>

                    {/* Footer */}
                    <div className="p-1.5 border-t border-white/6">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-melora-error hover:bg-melora-error/10 rounded-btn transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
