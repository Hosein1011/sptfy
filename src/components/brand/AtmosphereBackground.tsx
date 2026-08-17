"use client";

import React, { createContext, useContext, useState } from "react";

export type MoodType =
  | "All"
  | "Chill"
  | "Focus"
  | "Dreamy"
  | "Energetic"
  | "Romantic"
  | "Night"
  | "Workout"
  | "Happy"
  | "Sad"
  | "Deep"
  | "Party";

interface AtmosphereContextType {
  activeMood: MoodType;
  setActiveMood: (mood: MoodType) => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
}

const AtmosphereContext = createContext<AtmosphereContextType>({
  activeMood: "All",
  setActiveMood: () => {},
  accentColor: "#7B5CFF",
  setAccentColor: () => {},
});

export const useAtmosphere = () => useContext(AtmosphereContext);

export const MOOD_CONFIG: Record<
  MoodType,
  { label: string; gradient: string; orb1: string; orb2: string; orb3: string; tag: string }
> = {
  All: {
    label: "Explore All",
    gradient: "from-[#7B5CFF] to-[#FF4D7D]",
    orb1: "rgba(123, 92, 255, 0.18)",
    orb2: "rgba(255, 77, 125, 0.14)",
    orb3: "rgba(255, 180, 92, 0.10)",
    tag: "Every emotion in sound",
  },
  Chill: {
    label: "Chill",
    gradient: "from-[#6E8CFF] to-[#7B5CFF]",
    orb1: "rgba(110, 140, 255, 0.22)",
    orb2: "rgba(123, 92, 255, 0.18)",
    orb3: "rgba(34, 42, 63, 0.25)",
    tag: "Purple & deep calm blue",
  },
  Focus: {
    label: "Focus",
    gradient: "from-[#6E7CFF] to-[#B18CFF]",
    orb1: "rgba(110, 124, 255, 0.20)",
    orb2: "rgba(177, 140, 255, 0.16)",
    orb3: "rgba(20, 25, 38, 0.30)",
    tag: "Blue & lavender flow",
  },
  Dreamy: {
    label: "Dreamy",
    gradient: "from-[#B18CFF] via-[#FF4D7D] to-[#6E8CFF]",
    orb1: "rgba(177, 140, 255, 0.22)",
    orb2: "rgba(255, 77, 125, 0.18)",
    orb3: "rgba(110, 140, 255, 0.15)",
    tag: "Purple, pink & blue ethereal",
  },
  Energetic: {
    label: "Energetic",
    gradient: "from-[#FF4D7D] to-[#FFB45C]",
    orb1: "rgba(255, 77, 125, 0.25)",
    orb2: "rgba(255, 180, 92, 0.20)",
    orb3: "rgba(255, 92, 114, 0.15)",
    tag: "High voltage orange & pink",
  },
  Romantic: {
    label: "Romantic",
    gradient: "from-[#FF4D7D] to-[#FF8EAA]",
    orb1: "rgba(255, 77, 125, 0.22)",
    orb2: "rgba(255, 142, 170, 0.18)",
    orb3: "rgba(123, 92, 255, 0.12)",
    tag: "Warm rose & soft blush",
  },
  Night: {
    label: "Night",
    gradient: "from-[#151027] via-[#5C42D9] to-[#0B0F16]",
    orb1: "rgba(92, 66, 217, 0.22)",
    orb2: "rgba(21, 16, 39, 0.35)",
    orb3: "rgba(123, 92, 255, 0.15)",
    tag: "Indigo & midnight purple",
  },
  Workout: {
    label: "Workout",
    gradient: "from-[#FFB45C] to-[#FF4D7D]",
    orb1: "rgba(255, 180, 92, 0.24)",
    orb2: "rgba(255, 77, 125, 0.20)",
    orb3: "rgba(74, 222, 154, 0.12)",
    tag: "Adrenaline & pulse",
  },
  Happy: {
    label: "Happy",
    gradient: "from-[#FFB45C] to-[#4ADE9A]",
    orb1: "rgba(255, 180, 92, 0.22)",
    orb2: "rgba(74, 222, 154, 0.18)",
    orb3: "rgba(255, 77, 125, 0.12)",
    tag: "Sunlight & vibrant joy",
  },
  Sad: {
    label: "Melancholy",
    gradient: "from-[#6E8CFF] to-[#171D2E]",
    orb1: "rgba(110, 140, 255, 0.16)",
    orb2: "rgba(23, 29, 46, 0.40)",
    orb3: "rgba(116, 124, 145, 0.12)",
    tag: "Quiet rain & emotional depth",
  },
  Deep: {
    label: "Deep",
    gradient: "from-[#5C42D9] to-[#0B0F16]",
    orb1: "rgba(92, 66, 217, 0.20)",
    orb2: "rgba(36, 19, 43, 0.30)",
    orb3: "rgba(15, 20, 32, 0.50)",
    tag: "Low frequencies & heavy bass",
  },
  Party: {
    label: "Party",
    gradient: "from-[#FF4D7D] via-[#7B5CFF] to-[#FFB45C]",
    orb1: "rgba(255, 77, 125, 0.26)",
    orb2: "rgba(123, 92, 255, 0.22)",
    orb3: "rgba(255, 180, 92, 0.18)",
    tag: "Neon lights & club rhythms",
  },
};

export function AtmosphereProvider({ children }: { children: React.ReactNode }) {
  const [activeMood, setActiveMood] = useState<MoodType>("All");
  const [accentColor, setAccentColor] = useState<string>("#7B5CFF");

  const config = MOOD_CONFIG[activeMood] || MOOD_CONFIG.All;

  return (
    <AtmosphereContext.Provider
      value={{ activeMood, setActiveMood, accentColor, setAccentColor }}
    >
      <div className="relative min-h-screen w-full bg-[#0B0F16] overflow-x-hidden">
        {/* Dynamic Atmospheric Light Orbs */}
        <div
          className="fixed top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none transition-all duration-cinematic -z-10 animate-float-slow"
          style={{ backgroundColor: config.orb1 }}
        />
        <div
          className="fixed top-[20%] right-[-10%] w-[550px] h-[550px] rounded-full blur-[150px] pointer-events-none transition-all duration-cinematic -z-10 animate-pulse-glow"
          style={{ backgroundColor: config.orb2 }}
        />
        <div
          className="fixed bottom-[-10%] left-[30%] w-[700px] h-[700px] rounded-full blur-[160px] pointer-events-none transition-all duration-cinematic -z-10"
          style={{ backgroundColor: config.orb3 }}
        />

        {/* Subtle noise / ambient grain overlay */}
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-transparent via-[#0B0F16]/50 to-[#0B0F16] pointer-events-none -z-10" />

        {children}
      </div>
    </AtmosphereContext.Provider>
  );
}
