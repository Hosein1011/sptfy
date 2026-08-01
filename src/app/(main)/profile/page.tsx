"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Camera, Share2, Users, UserPlus, Music2, Trophy } from "lucide-react";
import { useAuthStore } from "../../../store/authStore";
import { storage } from "../../../lib/storage";
import ProfileHeader from "../../../components/profile/ProfileHeader";

export default function ProfilePage() {
  const router = useRouter();
  const storeUser = useAuthStore((state) => state.user);
  const currentUser = storeUser ?? storage.getCurrentUser();

  if (!currentUser) {
    return (
      <main className="min-h-screen flex items-center justify-center text-white">
        <div className="text-center space-y-4">
          <p className="text-xl font-semibold">کاربری یافت نشد</p>
          <button
            onClick={() => router.push("/login")}
            className="px-4 py-2 rounded-xl bg-melora-purple text-white"
          >
            رفتن به صفحه ورود
          </button>
        </div>
      </main>
    );
  }

  const displayName = currentUser.name || "User";
  const handle = currentUser.email
    ? `@${currentUser.email.split("@")[0]}`
    : "@user";
  const isArtist = currentUser.role === "ARTIST";
  const isVerified = Boolean(currentUser.isVerified);
  const subscriptionPlan =
    currentUser.tier === "GOLD" || currentUser.tier === "PREMIUM"
      ? "Premium"
      : "Free";

  const followers = 0;
  const following = 0;
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <main className="min-h-screen px-6 py-8 text-white">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="rounded-3xl bg-melora-surfaceLayer/70 border border-white/5 p-8 md:p-10 shadow-soft relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center gap-8">
            <div className="relative w-36 h-36 rounded-full bg-gradient-01 flex items-center justify-center text-white text-6xl font-bold shadow-glow">
              {avatarLetter}
              <button className="absolute right-2 bottom-2 w-10 h-10 rounded-full bg-black/40 border border-white/10 flex items-center justify-center">
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-4xl font-extrabold">{displayName}</h1>
                <p className="text-melora-textMuted mt-2">{handle}</p>
              </div>

              <p className="text-melora-textSecondary">
                {isArtist
                  ? "Artist profile on Sptfy."
                  : "Listener profile on Sptfy."}
              </p>

              <div className="flex items-center gap-8">
                <div>
                  <p className="text-2xl font-bold">{followers}</p>
                  <p className="text-xs tracking-widest text-melora-textMuted">
                    FOLLOWERS
                  </p>
                </div>
                <div className="h-10 w-px bg-white/10" />
                <div>
                  <p className="text-2xl font-bold">{following}</p>
                  <p className="text-xs tracking-widest text-melora-textMuted">
                    FOLLOWING
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button className="px-6 py-3 rounded-2xl bg-gradient-01 font-semibold text-white">
                  Edit Profile
                </button>
                <button className="w-14 h-14 rounded-2xl border border-white/10 flex items-center justify-center">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <ProfileHeader
          name={displayName}
          isArtist={isArtist}
          isVerified={isVerified}
          subscriptionPlan={subscriptionPlan}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-melora-surfaceLayer/60 border border-white/5 p-5">
            <div className="flex items-center gap-3 text-melora-textSecondary">
              <Music2 className="w-5 h-5" />
              <span>Recently Played</span>
            </div>
            <p className="mt-3 text-2xl font-bold">0</p>
          </div>

          <div className="rounded-2xl bg-melora-surfaceLayer/60 border border-white/5 p-5">
            <div className="flex items-center gap-3 text-melora-textSecondary">
              <Users className="w-5 h-5" />
              <span>Followers</span>
            </div>
            <p className="mt-3 text-2xl font-bold">{followers}</p>
          </div>

          <div className="rounded-2xl bg-melora-surfaceLayer/60 border border-white/5 p-5">
            <div className="flex items-center gap-3 text-melora-textSecondary">
              <Trophy className="w-5 h-5" />
              <span>Plan</span>
            </div>
            <p className="mt-3 text-2xl font-bold">{subscriptionPlan}</p>
          </div>
        </div>

        <div className="rounded-2xl bg-melora-surfaceLayer/60 border border-white/5 p-5">
          <div className="flex items-center gap-3 text-melora-textSecondary mb-4">
            <UserPlus className="w-5 h-5" />
            <span>About</span>
          </div>
          <p className="text-melora-textSecondary">
            {isArtist
              ? "This artist profile is connected to your current account."
              : "This listener profile is connected to your current account."}
          </p>
        </div>
      </div>
    </main>
  );
}
