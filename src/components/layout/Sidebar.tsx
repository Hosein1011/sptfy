"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Search,
  Library,
  Disc3,
  Heart,
  PlusCircle,
  Sparkles,
  Settings,
  User,
  Radio,
  Mic2,
  Shield,
  ChevronLeft,
  ChevronRight,
  Flame,
} from "lucide-react";
import MeloraLogo from "../brand/MeloraLogo";
import { useAuthStore } from "../../store/authStore";
import { useUIStore } from "../../store/uiStore";
import { useAtmosphere, MOOD_CONFIG, MoodType } from "../brand/AtmosphereBackground";

interface SidebarProps {
  onCreatePlaylist?: () => void;
}

export default function Sidebar({ onCreatePlaylist }: SidebarProps) {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();
  const { activeMood, setActiveMood } = useAtmosphere();
  const { sidebarCollapsed: collapsed, toggleSidebar } = useUIStore();

  const mainNav = [
    { label: "Home", href: "/", icon: Home },
    { label: "Search", href: "/search", icon: Search },
    { label: "Your Library", href: "/library", icon: Library },
    { label: "Browse Albums", href: "/albums", icon: Disc3 },
    { label: "Liked Songs", href: "/library?tab=liked", icon: Heart },
  ];

  const moodShortcuts: MoodType[] = [
    "Chill",
    "Focus",
    "Dreamy",
    "Energetic",
    "Romantic",
    "Night",
  ];

  const isCurrent = (href: string) => {
    if (href === "/" && pathname === "/") return true;
    if (href !== "/" && pathname.startsWith(href.split("?")[0])) return true;
    return false;
  };

  return (
    <aside
      className={`
        hidden md:flex flex-col shrink-0 h-screen sticky top-0
        bg-melora-bgSecondary/90 backdrop-blur-2xl border-r border-white/6
        transition-all duration-base ease-out z-30
        ${collapsed ? "w-20 px-3 py-6" : "w-64 lg:w-72 px-5 py-6"}
      `}
    >
      {/* Sidebar Header & Brand */}
      <div className="flex items-center justify-between mb-8 px-1">
        {!collapsed ? (
          <MeloraLogo size="sm" showWordmark showTagline href="/" />
        ) : (
          <MeloraLogo size="sm" showWordmark={false} href="/" />
        )}

        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg text-melora-textMuted hover:text-white hover:bg-white/8 transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Main Navigation Items */}
      <div className="space-y-1.5 mb-6">
        {mainNav.map((item) => {
          const Icon = item.icon;
          const active = isCurrent(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3.5 px-3.5 py-2.5 rounded-btn text-sm font-medium
                transition-all duration-micro group select-none
                ${
                  active
                    ? "bg-gradient-primary text-white shadow-glow border border-white/10"
                    : "text-melora-textSecondary hover:text-white hover:bg-white/6"
                }
              `}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={`w-5 h-5 shrink-0 transition-transform duration-micro ${
                  active ? "text-white scale-110" : "text-melora-textMuted group-hover:text-white"
                }`}
              />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </div>

      {/* Playlist & Quick Actions */}
      {!collapsed && (
        <div className="pt-4 pb-2 border-t border-white/6">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-melora-textMuted mb-2">
            My Space
          </p>

          <Link
            href="/playlists"
            className="flex items-center gap-3.5 px-3.5 py-2 rounded-btn text-sm font-medium text-melora-textSecondary hover:text-white hover:bg-white/6 transition-colors"
          >
            <PlusCircle className="w-4 h-4 text-melora-pink shrink-0" />
            <span>Create Playlist</span>
          </Link>
        </div>
      )}

      {/* Mood Filters Quick List */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto pt-4 pb-2 border-t border-white/6 space-y-1 custom-scrollbar">
          <div className="flex items-center justify-between px-3 mb-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-melora-textMuted flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-melora-orange" />
              <span>Atmosphere</span>
            </p>
            {activeMood !== "All" && (
              <button
                onClick={() => setActiveMood("All")}
                className="text-[10px] text-melora-purple hover:underline"
              >
                Reset
              </button>
            )}
          </div>

          <div className="space-y-1">
            {moodShortcuts.map((mood) => {
              const isActive = activeMood === mood;
              return (
                <button
                  key={mood}
                  onClick={() => setActiveMood(isActive ? "All" : mood)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium
                    transition-all duration-micro
                    ${
                      isActive
                        ? "bg-white/10 text-white font-semibold border-l-2 border-melora-pink"
                        : "text-melora-textMuted hover:text-white hover:bg-white/5"
                    }
                  `}
                >
                  <span>{mood}</span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isActive ? "bg-melora-pink shadow-glow-pink" : "bg-white/20"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom Profile / Settings Area */}
      <div className="pt-4 border-t border-white/6 mt-auto space-y-1.5">
        {user?.role === "ARTIST" && (
          <Link
            href="/artist"
            className="flex items-center gap-3.5 px-3.5 py-2 rounded-btn text-xs font-semibold text-melora-pink hover:bg-melora-pink/10 transition-colors"
          >
            <Mic2 className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Artist Studio</span>}
          </Link>
        )}

        {user?.role === "ADMIN" && (
          <Link
            href="/admin"
            className="flex items-center gap-3.5 px-3.5 py-2 rounded-btn text-xs font-semibold text-melora-orange hover:bg-melora-orange/10 transition-colors"
          >
            <Shield className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Admin Panel</span>}
          </Link>
        )}

        <Link
          href="/settings"
          className="flex items-center gap-3.5 px-3.5 py-2.5 rounded-btn text-sm font-medium text-melora-textSecondary hover:text-white hover:bg-white/6 transition-colors"
          title={collapsed ? "Settings" : undefined}
        >
          <Settings className="w-5 h-5 shrink-0 text-melora-textMuted" />
          {!collapsed && <span>Settings</span>}
        </Link>

        {isAuthenticated && user && (
          <Link
            href="/profile"
            className="flex items-center gap-3 p-2 rounded-btn bg-melora-cardSurface/60 border border-white/8 hover:border-melora-purple/40 transition-all group"
            title={collapsed ? user.name || "Profile" : undefined}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-soft-sm">
              {(user.profileImage || user.avatarUrl) ? (
                <img
                  src={(user.profileImage || user.avatarUrl)!}
                  alt=""
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                (user.name || user.email || "U").charAt(0).toUpperCase()
              )}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">
                  {user.name || user.username || "User"}
                </p>
                <p className="text-[10px] text-melora-textMuted uppercase tracking-wider">
                  {user.tier || "Free"}
                </p>
              </div>
            )}
          </Link>
        )}
      </div>
    </aside>
  );
}
