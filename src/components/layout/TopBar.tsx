"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, ChevronDown, User, Mic2, Settings, LogOut, Shield } from "lucide-react";
import Button from "../common/Button";
import NotificationBell from "./NotificationBell"; // The bell we built earlier!

export default function TopBar() {
  // --- UI STATE (Person 3 will replace this with authStore.isAuthenticated) ---
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="w-full h-20 bg-melora-bgPrimary/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6 md:px-10 sticky top-0 z-40 transition-all duration-base">
      
      {/* Left: Search Bar & Navigation */}
      <div className="flex items-center gap-6 flex-1">
        {/* Placeholder for a Back/Forward navigation if needed */}
        
        <div className="relative w-full max-w-md hidden md:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-melora-textMuted" />
          <input 
            type="text" 
            placeholder="Search for songs, artists, or albums..."
            className="w-full bg-melora-surfaceLayer/50 border border-white/10 rounded-full py-2.5 pl-12 pr-4 text-sm text-white placeholder:text-melora-textMuted focus:outline-none focus:border-melora-purple focus:ring-1 focus:ring-melora-purple transition-all duration-base"
          />
        </div>
      </div>

      {/* Right: Auth State or User Profile */}
      <div className="flex items-center gap-4">
        
        {/* Development Toggle (Just so you can see both states!) */}
        <button 
          onClick={() => setIsLoggedIn(!isLoggedIn)}
          className="text-[10px] uppercase tracking-widest text-melora-textMuted hover:text-white mr-4"
        >
          Toggle Auth State
        </button>

        {!isLoggedIn ? (
          /* --- LOGGED OUT STATE --- */
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
          /* --- LOGGED IN STATE --- */
          <div className="flex items-center gap-4">
            
            {/* Notification Bell */}
            <NotificationBell />

            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 p-1 pr-3 rounded-full bg-melora-surfaceLayer/50 border border-white/10 hover:bg-melora-surfaceLayer transition-colors duration-base"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-01 shadow-soft flex items-center justify-center text-white font-bold text-sm">
                  A
                </div>
                <ChevronDown className="w-4 h-4 text-melora-textSecondary" />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-melora-surfaceLayer/95 backdrop-blur-[24px] border border-white/10 rounded-panel shadow-glow overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-base">
                  <div className="p-4 border-b border-white/5">
                    <p className="text-white font-bold text-sm">Alex Mercer</p>
                    <p className="text-xs text-melora-textMuted uppercase tracking-wider mt-1">Gold Tier</p>
                  </div>
                  
                  <div className="py-2">
                    <Link href="/profile" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-melora-textSecondary hover:text-white hover:bg-white/5 transition-colors">
                      <User className="w-4 h-4" /> Profile
                    </Link>
                    <Link href="/artist" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-melora-textSecondary hover:text-melora-pink hover:bg-melora-pink/5 transition-colors">
                      <Mic2 className="w-4 h-4" /> Artist Studio
                    </Link>
                    <Link href="/admin" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-melora-textSecondary hover:text-melora-orange hover:bg-melora-orange/5 transition-colors">
                      <Shield className="w-4 h-4" /> Admin Panel
                    </Link>
                    <Link href="/settings" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-melora-textSecondary hover:text-white hover:bg-white/5 transition-colors">
                      <Settings className="w-4 h-4" /> Settings
                    </Link>
                  </div>
                  
                  <div className="p-2 border-t border-white/5">
                    <button className="w-full flex items-center gap-3 px-2 py-2 text-sm text-melora-textMuted hover:text-white hover:bg-white/5 rounded-md transition-colors">
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