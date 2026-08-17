"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Library, Sparkles, User } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useAtmosphere, MOOD_CONFIG, MoodType } from "../brand/AtmosphereBackground";
import Modal from "../ui/Modal";
import Chip from "../ui/Chip";

export default function BottomNav() {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();
  const { activeMood, setActiveMood } = useAtmosphere();
  const [moodModalOpen, setMoodModalOpen] = useState(false);

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Search", href: "/search", icon: Search },
    { label: "Library", href: "/library", icon: Library },
    { label: "Moods", href: "#moods", icon: Sparkles, onClick: () => setMoodModalOpen(true) },
    {
      label: "Profile",
      href: isAuthenticated ? "/profile" : "/login",
      icon: User,
    },
  ];

  const moodsList = Object.keys(MOOD_CONFIG) as MoodType[];

  return (
    <>
      <nav
        className="
          md:hidden fixed bottom-0 left-0 right-0 z-40
          h-16 px-4
          glass-player border-t border-white/8
          flex items-center justify-around
        "
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href !== "#moods" &&
            (item.href === "/" ? pathname === "/" : pathname.startsWith(item.href));

          if (item.onClick) {
            return (
              <button
                key={item.label}
                onClick={item.onClick}
                className="flex flex-col items-center justify-center gap-1 min-w-[56px] py-1 text-melora-textSecondary hover:text-white select-none relative group"
              >
                <div
                  className={`p-1.5 rounded-full transition-all duration-micro ${
                    activeMood !== "All"
                      ? "text-melora-pink bg-melora-pink/15 shadow-glow-pink"
                      : "text-melora-textSecondary group-hover:text-white"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold tracking-tight">
                  {activeMood !== "All" ? activeMood : item.label}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-col items-center justify-center gap-1 min-w-[56px] py-1 select-none relative group"
            >
              <div
                className={`p-1.5 rounded-full transition-all duration-micro ${
                  isActive
                    ? "text-white bg-gradient-primary shadow-glow"
                    : "text-melora-textSecondary group-hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span
                className={`text-[10px] font-semibold tracking-tight ${
                  isActive ? "text-white" : "text-melora-textMuted"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Mood Selector Modal for Mobile */}
      <Modal
        isOpen={moodModalOpen}
        onClose={() => setMoodModalOpen(false)}
        title="Select Atmosphere"
        description="Transform Melora's lighting and soundtrack to match your mood."
      >
        <div className="flex flex-wrap gap-2.5 pt-2">
          {moodsList.map((mood) => {
            const config = MOOD_CONFIG[mood];
            const isSelected = activeMood === mood;

            return (
              <Chip
                key={mood}
                label={config.label}
                isActive={isSelected}
                variant="gradient"
                onClick={() => {
                  setActiveMood(mood);
                  setMoodModalOpen(false);
                }}
              />
            );
          })}
        </div>
      </Modal>
    </>
  );
}
