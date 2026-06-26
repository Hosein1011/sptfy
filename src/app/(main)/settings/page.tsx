// If you navigate to localhost:3000/settings, you'll see those premium toggles in action.
"use client";

import React, { useState } from "react";
import { 
  Settings2, User, Volume2, Monitor, 
  Download, Shield, ChevronRight, LogOut
} from "lucide-react";
import Button from "../../../components/common/Button";

// Custom Melora Toggle Switch (UI Only - Person 3 will wire to state later)
const SettingToggle = ({ label, description, isOn, onToggle }: { label: string, description?: string, isOn: boolean, onToggle: () => void }) => (
  <div className="flex items-center justify-between py-3">
    <div className="pr-4">
      <p className="text-white font-medium">{label}</p>
      {description && <p className="text-sm text-melora-textSecondary mt-0.5">{description}</p>}
    </div>
    <button 
      onClick={onToggle}
      className={`
        w-12 h-6 rounded-full relative flex-shrink-0 transition-all duration-base
        ${isOn ? "bg-melora-purple shadow-glow" : "bg-white/10 border border-white/5"}
      `}
    >
      <div 
        className={`
          absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-base
          ${isOn ? "translate-x-7" : "translate-x-1"}
        `}
      />
    </button>
  </div>
);

export default function SettingsPage() {
  // --- UI STATE (Person 3 will replace with user preferences store) ---
  const [highQuality, setHighQuality] = useState(true);
  const [spatialAudio, setSpatialAudio] = useState(false);
  const [offlineMode, setOfflineMode] = useState(true);
  const [privateSession, setPrivateSession] = useState(false);
  const [dataSaver, setDataSaver] = useState(false);

  return (
    <main className="flex-1 w-full p-6 md:p-10 pb-32">
      
      {/* Header */}
      <header className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <Settings2 className="w-8 h-8 text-melora-purple" />
          Preferences
        </h1>
        <p className="text-melora-textSecondary font-medium">
          Customize your Melora experience.
        </p>
      </header>

      <div className="max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Column: Navigation / Account Summary */}
        <div className="md:col-span-4 space-y-6">
          {/* Account Card */}
          <div className="bg-melora-surfaceLayer/30 border border-white/5 rounded-panel p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-01 shadow-soft flex items-center justify-center text-white font-bold text-xl">
                A
              </div>
              <div>
                <h3 className="text-white font-bold">Alex Mercer</h3>
                <span className="text-xs font-bold px-2 py-1 bg-melora-orange/10 text-melora-orange rounded-md uppercase tracking-wider">
                  Gold Tier
                </span>
              </div>
            </div>
            
            <Button variant="secondary" className="w-full justify-between group">
              Manage Account
              <ChevronRight className="w-4 h-4 group-hover:text-melora-purple transition-colors" />
            </Button>
          </div>

          {/* Quick Menu */}
          <nav className="bg-melora-surfaceLayer/30 border border-white/5 rounded-panel overflow-hidden hidden md:block">
            {[
              { icon: User, label: "Account" },
              { icon: Volume2, label: "Audio Quality" },
              { icon: Monitor, label: "Appearance" },
              { icon: Download, label: "Downloads" },
              { icon: Shield, label: "Privacy & Social" },
            ].map((item, idx) => (
              <button key={idx} className="w-full flex items-center gap-4 px-6 py-4 text-melora-textSecondary hover:text-white hover:bg-white/5 transition-colors duration-base border-b border-white/5 last:border-0">
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
          
          <Button variant="danger" className="w-full flex items-center justify-center gap-2">
            <LogOut className="w-5 h-5" />
            Sign Out
          </Button>
        </div>

        {/* Right Column: Settings Panels */}
        <div className="md:col-span-8 space-y-6">
          
          {/* Audio Settings */}
          <section className="bg-melora-surfaceLayer/30 border border-white/5 rounded-panel p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <Volume2 className="w-6 h-6 text-melora-pink" />
              <h2 className="text-xl font-bold text-white">Audio Quality</h2>
            </div>
            
            <div className="space-y-2 divide-y divide-white/5">
              <SettingToggle 
                label="High-Fidelity Streaming" 
                description="Stream in lossless 24-bit/192kHz audio. Consumes more data."
                isOn={highQuality}
                onToggle={() => setHighQuality(!highQuality)}
              />
              <SettingToggle 
                label="Spatial Audio" 
                description="Enable 3D surround sound for supported tracks."
                isOn={spatialAudio}
                onToggle={() => setSpatialAudio(!spatialAudio)}
              />
              <SettingToggle 
                label="Data Saver" 
                description="Force audio to 128kbps when on cellular networks."
                isOn={dataSaver}
                onToggle={() => setDataSaver(!dataSaver)}
              />
            </div>
          </section>

          {/* Downloads Settings */}
          <section className="bg-melora-surfaceLayer/30 border border-white/5 rounded-panel p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <Download className="w-6 h-6 text-melora-purple" />
              <h2 className="text-xl font-bold text-white">Downloads & Storage</h2>
            </div>
            
            <div className="space-y-2 divide-y divide-white/5">
              <SettingToggle 
                label="Offline Mode" 
                description="Only play music that has been downloaded to this device."
                isOn={offlineMode}
                onToggle={() => setOfflineMode(!offlineMode)}
              />
              <div className="py-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-white font-medium">Storage Usage</p>
                  <p className="text-melora-textSecondary text-sm">4.2 GB used</p>
                </div>
                {/* Custom Storage Bar */}
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden flex">
                  <div className="h-full bg-melora-purple w-2/5"></div>
                  <div className="h-full bg-melora-pink w-1/5"></div>
                </div>
                <div className="flex gap-4 mt-3">
                  <span className="text-xs flex items-center gap-1 text-melora-textMuted"><div className="w-2 h-2 rounded-full bg-melora-purple"></div> Downloads</span>
                  <span className="text-xs flex items-center gap-1 text-melora-textMuted"><div className="w-2 h-2 rounded-full bg-melora-pink"></div> Cache</span>
                </div>
              </div>
              
              <div className="pt-4 flex justify-end">
                <Button variant="secondary" className="text-sm px-4 py-2">
                  Clear Cache
                </Button>
              </div>
            </div>
          </section>

          {/* Privacy Settings */}
          <section className="bg-melora-surfaceLayer/30 border border-white/5 rounded-panel p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-melora-orange" />
              <h2 className="text-xl font-bold text-white">Privacy & Social</h2>
            </div>
            
            <div className="space-y-2 divide-y divide-white/5">
              <SettingToggle 
                label="Private Session" 
                description="Temporarily hide your listening activity from followers."
                isOn={privateSession}
                onToggle={() => setPrivateSession(!privateSession)}
              />
              <div className="py-4 flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Blocked Accounts</p>
                  <p className="text-sm text-melora-textSecondary mt-0.5">Manage users you have blocked.</p>
                </div>
                <Button variant="secondary" className="text-sm px-4 py-2">
                  Manage
                </Button>
              </div>
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}