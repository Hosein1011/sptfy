"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Settings2,
  User,
  Volume2,
  Monitor,
  Download,
  Shield,
  ChevronRight,
  LogOut,
  AlertTriangle,
  Radio,
  Sparkles,
} from "lucide-react";
import Button from "../../../components/common/Button";
import Toggle from "../../../components/ui/Toggle";
import { useAuthStore } from "../../../store/authStore";
import { tokenStorage, userApi, UserPreferences } from "../../../lib/api";
import { useToast } from "../../../components/ui/ToastProvider";

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { toast } = useToast();

  const [preferences, setPreferences] = useState<UserPreferences>({
    highQuality: true,
    spatialAudio: false,
    offlineMode: true,
    privateSession: false,
    dataSaver: false,
  });
  const [isLoadingPrefs, setIsLoadingPrefs] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

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
          setPreferences((prev) => ({ ...prev, ...data }));
        }
      } catch (error) {
        console.warn("Could not load backend preferences:", error);
      } finally {
        setIsLoadingPrefs(false);
      }
    };

    fetchPreferences();
  }, [user]);

  const handleToggle = async (key: keyof UserPreferences) => {
    const currentValue = Boolean(preferences[key]);
    const newValue = !currentValue;

    setPreferences((prev) => ({ ...prev, [key]: newValue }));

    if (tokenStorage.get()) {
      try {
        await userApi.updatePreferences({ [key]: newValue });
        toast("Setting updated", "info");
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
      "Are you absolutely sure you want to delete your account? This action cannot be undone."
    );

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await useAuthStore.getState().deleteAccount();
      router.push("/");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete account.");
      setIsDeleting(false);
    }
  };

  if (!user) {
    return (
      <main className="w-full p-20 text-center text-xs text-melora-textMuted">
        Loading settings...
      </main>
    );
  }

  return (
    <main className="w-full px-4 md:px-8 lg:px-10 py-6 md:py-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <header>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Settings2 className="w-8 h-8 text-melora-purple" />
          Preferences
        </h1>
        <p className="text-xs md:text-sm text-melora-textSecondary mt-1">
          Customize audio fidelity, offline cache, privacy, and atmospheric defaults.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Side Profile Summary */}
        <div className="md:col-span-4 space-y-6">
          <div className="glass-panel rounded-card-lg p-6 border border-white/8 space-y-5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-gradient-primary shadow-soft flex items-center justify-center text-white font-bold text-lg uppercase shrink-0">
                {user.username ? user.username.charAt(0) : "U"}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-white font-bold text-sm truncate">
                  {user.username || user.name}
                </h3>
                {user.username && (
                  <p className="text-xs text-melora-textMuted">@{user.username}</p>
                )}
                <span
                  className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider mt-0.5 ${
                    user.tier === "GOLD"
                      ? "bg-amber-500/20 text-yellow-300 border border-yellow-400/30"
                      : user.tier === "SILVER"
                        ? "bg-slate-300/20 text-slate-200 border border-slate-300/30"
                        : "bg-white/10 text-white/70"
                  }`}
                >
                  {user.tier} Tier
                </span>
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push("/profile")}
              className="w-full justify-between rounded-btn"
            >
              <span>Manage Profile</span>
              <ChevronRight className="w-4 h-4 text-melora-textMuted" />
            </Button>
          </div>

          <Button
            variant="danger"
            size="md"
            onClick={handleLogout}
            className="w-full rounded-btn"
            leftIcon={<LogOut className="w-4 h-4" />}
          >
            Sign Out
          </Button>
        </div>

        {/* Right Settings Groups */}
        <div className="md:col-span-8 space-y-6">
          {isLoadingPrefs ? (
            <div className="p-8 text-center text-xs text-melora-textMuted glass-card rounded-card-lg">
              Loading preferences...
            </div>
          ) : (
            <>
              {/* Audio Quality Settings */}
              <section className="glass-panel rounded-card-lg p-6 md:p-7 border border-white/8 space-y-4">
                <div className="flex items-center gap-2.5 text-melora-pink">
                  <Volume2 className="w-5 h-5" />
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    Audio Quality & Streaming
                  </h2>
                </div>

                <div className="divide-y divide-white/6">
                  <Toggle
                    label="High-Fidelity Lossless"
                    description="Stream in 24-bit studio audio fidelity. Consumes more bandwidth."
                    isOn={Boolean(preferences.highQuality)}
                    onToggle={() => handleToggle("highQuality")}
                  />
                  <Toggle
                    label="Spatial Audio & Surround"
                    description="Immersive 3D acoustic positioning for supported master tracks."
                    isOn={Boolean(preferences.spatialAudio)}
                    onToggle={() => handleToggle("spatialAudio")}
                  />
                  <Toggle
                    label="Data Saver"
                    description="Compress stream on mobile data connections."
                    isOn={Boolean(preferences.dataSaver)}
                    onToggle={() => handleToggle("dataSaver")}
                  />
                </div>
              </section>

              {/* Downloads & Storage Settings */}
              <section className="glass-panel rounded-card-lg p-6 md:p-7 border border-white/8 space-y-4">
                <div className="flex items-center gap-2.5 text-melora-purple">
                  <Download className="w-5 h-5" />
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    Downloads & Offline Cache
                  </h2>
                </div>

                <div className="divide-y divide-white/6">
                  <Toggle
                    label="Offline Mode"
                    description="Only play melodies stored in your local device cache."
                    isOn={Boolean(preferences.offlineMode)}
                    onToggle={() => handleToggle("offlineMode")}
                  />

                  <div className="py-3">
                    <div className="flex justify-between items-center text-xs mb-2">
                      <span className="text-white font-medium">Cached Melodies</span>
                      <span className="text-melora-textSecondary font-mono">3.4 GB / 64 GB</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden flex">
                      <div className="h-full bg-gradient-primary w-1/4 rounded-full" />
                    </div>
                  </div>
                </div>
              </section>

              {/* Privacy & Session Settings */}
              <section className="glass-panel rounded-card-lg p-6 md:p-7 border border-white/8 space-y-4">
                <div className="flex items-center gap-2.5 text-melora-orange">
                  <Shield className="w-5 h-5" />
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    Privacy & Listening Session
                  </h2>
                </div>

                <div className="divide-y divide-white/6">
                  <Toggle
                    label="Private Session"
                    description="Temporarily hide current playback activity from followers."
                    isOn={Boolean(preferences.privateSession)}
                    onToggle={() => handleToggle("privateSession")}
                  />
                </div>
              </section>

              {/* Danger Zone */}
              <section className="glass-card rounded-card-lg p-6 border border-melora-error/30 bg-melora-error/5 space-y-4">
                <div className="flex items-center gap-2.5 text-melora-error">
                  <AlertTriangle className="w-5 h-5" />
                  <h2 className="text-lg font-bold">Danger Zone</h2>
                </div>
                <p className="text-xs text-melora-textSecondary leading-relaxed">
                  Permanently delete your Melora account and all saved playlists, listening history, and preferences.
                </p>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="rounded-btn"
                >
                  {isDeleting ? "Deleting Account..." : "Delete Account"}
                </Button>
              </section>
            </>
          )}
        </div>
      </div>
    </main>
  );
}