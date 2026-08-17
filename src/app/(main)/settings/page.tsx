"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Settings2, User, Volume2, Monitor,
  Download, Shield, ChevronRight, LogOut, AlertTriangle
} from "lucide-react";
import Button from "../../../components/common/Button";
import { useAuthStore } from "../../../store/authStore";
import { tokenStorage, userApi, UserPreferences } from "../../../lib/api";

// Custom Melora Toggle Switch
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
  const router = useRouter();
  const { user } = useAuthStore();

  const [preferences, setPreferences] = useState<UserPreferences>({
    highQuality: true,
    spatialAudio: false,
    offlineMode: true,
    privateSession: false,
    dataSaver: false,
  });
  const [isLoadingPrefs, setIsLoadingPrefs] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // واکشی تنظیمات واقعی از بک‌اند هنگام لود صفحه
  useEffect(() => {
    if (!user) return;

    const fetchPreferences = async () => {
      if (!tokenStorage.get()) {
        setIsLoadingPrefs(false);
        return;
      }
      try {
        const data = await userApi.getPreferences();
        if (data && typeof data === "object") {
          setPreferences(prev => ({ ...prev, ...data }));
        }
      } catch (error) {
        console.warn("Could not load backend preferences:", error);
      } finally {
        setIsLoadingPrefs(false);
      }
    };

    fetchPreferences();
  }, [user]);

  // اعمال تغییرات به صورت Optimistic UI و ارسال به بک‌اند
  const handleToggle = async (key: keyof UserPreferences) => {
    const currentValue = Boolean(preferences[key]);
    const newValue = !currentValue;

    setPreferences(prev => ({ ...prev, [key]: newValue }));

    if (tokenStorage.get()) {
      try {
        await userApi.updatePreferences({ [key]: newValue });
      } catch (error) {
        console.warn("Failed to save setting to backend:", error);
      }
    }
  };

  const handleLogout = async () => {
    await useAuthStore.getState().logout();
    router.push("/login");
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you absolutely sure you want to delete your account? This action cannot be undone and you will lose all your saved playlists and preferences."
    );

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await useAuthStore.getState().deleteAccount();
      router.push("/");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete account. Please try again.");
      setIsDeleting(false);
    }
  };

  if (!user) {
    return (
      <main className="flex-1 w-full p-6 md:p-10 flex items-center justify-center">
        <p className="text-melora-textMuted">Loading profile...</p>
      </main>
    );
  }

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

        {/* Left Column */}
        <div className="md:col-span-4 space-y-6">
          <div className="bg-melora-surfaceLayer/30 border border-white/5 rounded-panel p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-01 shadow-soft flex items-center justify-center text-white font-bold text-xl uppercase">
                {user.username ? user.username.charAt(0) : "U"}
              </div>
              <div>
                <h3 className="text-white font-bold truncate max-w-[150px]">{user.username}</h3>
                <span className={`text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider ${user.tier === 'GOLD' ? 'bg-melora-orange/10 text-melora-orange' :
                    user.tier === 'SILVER' ? 'bg-gray-300/10 text-gray-300' :
                      'bg-white/10 text-white/70'
                  }`}>
                  {user.tier} Tier
                </span>
              </div>
            </div>

            <Button variant="secondary" className="w-full justify-between group">
              Manage Account
              <ChevronRight className="w-4 h-4 group-hover:text-melora-purple transition-colors" />
            </Button>
          </div>

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

          <Button
            variant="danger"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 border-none"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </Button>
        </div>

        {/* Right Column */}
        <div className="md:col-span-8 space-y-6">

          {isLoadingPrefs ? (
            <div className="p-8 text-center text-melora-textMuted bg-melora-surfaceLayer/30 border border-white/5 rounded-panel">
              Loading preferences...
            </div>
          ) : (
            <>
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
                    isOn={Boolean(preferences.highQuality)}
                    onToggle={() => handleToggle('highQuality')}
                  />
                  <SettingToggle
                    label="Spatial Audio"
                    description="Enable 3D surround sound for supported tracks."
                    isOn={Boolean(preferences.spatialAudio)}
                    onToggle={() => handleToggle('spatialAudio')}
                  />
                  <SettingToggle
                    label="Data Saver"
                    description="Force audio to 128kbps when on cellular networks."
                    isOn={Boolean(preferences.dataSaver)}
                    onToggle={() => handleToggle('dataSaver')}
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
                    isOn={Boolean(preferences.offlineMode)}
                    onToggle={() => handleToggle('offlineMode')}
                  />
                  <div className="py-4">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-white font-medium">Storage Usage</p>
                      <p className="text-melora-textSecondary text-sm">4.2 GB used</p>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden flex">
                      <div className="h-full bg-melora-purple w-2/5"></div>
                      <div className="h-full bg-melora-pink w-1/5"></div>
                    </div>
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
                    isOn={Boolean(preferences.privateSession)}
                    onToggle={() => handleToggle('privateSession')}
                  />
                </div>
              </section>
            </>
          )}

          {/* Danger Zone */}
          <section className="bg-red-500/5 border border-red-500/20 rounded-panel p-6 md:p-8 mt-8">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <h2 className="text-xl font-bold text-red-400">Danger Zone</h2>
            </div>
            <p className="text-melora-textSecondary text-sm mb-6">
              Permanently delete your Melora account and all of your data. This action cannot be undone.
            </p>
            <Button
              variant="danger"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white border-none"
            >
              {isDeleting ? "Deleting..." : "Delete Account"}
            </Button>
          </section>

        </div>
      </div>
    </main>
  );
}