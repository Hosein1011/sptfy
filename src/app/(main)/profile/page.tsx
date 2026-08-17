"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  Edit3,
  Music2,
  Share2,
  Trophy,
  Users,
  X,
  BadgeCheck,
  Sparkles,
  Flame,
  Clock,
  Radio,
} from "lucide-react";
import { authApi } from "../../../lib/api";
import { useAuthStore } from "../../../store/authStore";
import { Gender, User } from "../../../types";
import Button from "../../../components/common/Button";
import IconButton from "../../../components/ui/IconButton";
import Modal from "../../../components/ui/Modal";
import Input from "../../../components/ui/Input";
import { useToast } from "../../../components/ui/ToastProvider";

const tierLabel = { FREE: "Free", STANDARD: "Silver", GOLD: "Gold VIP" } as const;

export default function ProfilePage() {
  const router = useRouter();
  const storeUser = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const { toast } = useToast();

  const [profile, setProfile] = useState<User | null>(storeUser);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(storeUser?.name || "");
  const [birthDate, setBirthDate] = useState(storeUser?.birth_date || "");
  const [gender, setGender] = useState<Gender>(storeUser?.gender || "UNSPECIFIED");
  const [bio, setBio] = useState(storeUser?.bio || "");
  const [image, setImage] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    authApi
      .me()
      .then((user) => {
        if (!active) return;
        setProfile(user);
        setUser(user);
        setName(user.name || "");
        setBirthDate(user.birth_date || "");
        setGender(user.gender || "UNSPECIFIED");
        setBio(user.bio || "");
      })
      .catch(() => {
        if (!useAuthStore.getState().user) router.push("/login");
      });

    return () => {
      active = false;
    };
  }, [router, setUser]);

  if (!profile) {
    return (
      <main className="w-full p-20 text-center text-xs text-melora-textMuted flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4 text-melora-purple animate-pulse" />
        <span>Loading your profile universe...</span>
      </main>
    );
  }

  const followingIds = Array.isArray(profile.followingIds) ? profile.followingIds : [];
  const followingCount =
    typeof profile.followingCount === "number"
      ? profile.followingCount
      : followingIds.length;

  const canUploadAvatar = profile.role !== "USER" || profile.tier !== "FREE";

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const updated = await authApi.updateMe({
        name,
        birth_date: birthDate || null,
        gender,
        bio,
        profile_image: image,
      });
      setProfile(updated);
      setUser(updated);
      setEditing(false);
      toast("Profile updated successfully", "success");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Could not update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const share = async () => {
    const url = `${window.location.origin}/users/${profile.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast("Profile link copied to clipboard", "info");
    } catch {
      toast("Could not copy link", "error");
    }
  };

  return (
    <main className="w-full px-4 md:px-8 lg:px-10 py-6 md:py-8 max-w-7xl mx-auto space-y-8">
      {/* Profile Visual Header */}
      <section className="relative rounded-hero glass-panel p-6 md:p-10 border border-white/10 overflow-hidden shadow-soft-lg flex flex-col md:flex-row items-center md:items-end gap-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-primary opacity-20 blur-[130px] pointer-events-none -z-10" />

        {/* Avatar */}
        <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-full bg-gradient-primary overflow-hidden flex items-center justify-center text-5xl font-bold shadow-glow shrink-0 border border-white/20">
          {profile.profileImage ? (
            <img
              src={profile.profileImage}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
          ) : (
            (profile.name || "U").charAt(0).toUpperCase()
          )}
          <button
            onClick={() => setEditing(true)}
            className="absolute right-2 bottom-2 w-9 h-9 rounded-full bg-black/70 border border-white/20 flex items-center justify-center text-white hover:bg-melora-purple hover:scale-105 transition-all shadow-md"
            title="Change Avatar"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>

        {/* User Info */}
        <div className="flex-1 text-center md:text-left min-w-0">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight truncate">
              {profile.name}
            </h1>
            {profile.isVerified && (
              <BadgeCheck className="w-6 h-6 text-melora-purple" />
            )}
            <span className="text-xs font-bold rounded-full bg-melora-purple/20 text-melora-lavender border border-melora-purple/30 px-3 py-0.5">
              {tierLabel[profile.tier]}
            </span>
          </div>

          <p className="text-xs font-mono text-melora-textMuted">
            @{profile.username || profile.email?.split("@")[0] || "listener"}
          </p>

          {profile.bio && (
            <p className="mt-3 text-xs md:text-sm text-melora-textSecondary max-w-2xl">
              {profile.bio}
            </p>
          )}

          {/* Social Counts */}
          <div className="flex flex-wrap justify-center md:justify-start gap-8 mt-5">
            <div>
              <p className="text-xl md:text-2xl font-bold text-white">
                {(profile.followerCount ?? 0).toLocaleString()}
              </p>
              <p className="text-[10px] tracking-widest uppercase font-bold text-melora-textMuted">
                Followers
              </p>
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold text-white">
                {followingCount.toLocaleString()}
              </p>
              <p className="text-[10px] tracking-widest uppercase font-bold text-melora-textMuted">
                Following
              </p>
            </div>
            <div>
              <p className="text-xl md:text-2xl font-bold text-white">
                {(profile.dailyStreams ?? 0).toLocaleString()}
              </p>
              <p className="text-[10px] tracking-widest uppercase font-bold text-melora-textMuted">
                Streams Today
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-6">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Edit3 className="w-3.5 h-3.5" />}
              onClick={() => setEditing(true)}
              className="rounded-full shadow-glow"
            >
              Edit Profile
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Share2 className="w-3.5 h-3.5" />}
              onClick={share}
              className="rounded-full"
            >
              Share Space
            </Button>
          </div>
        </div>
      </section>

      {/* Visual Listening Stats Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-card-lg p-5 border border-white/6">
          <div className="flex items-center gap-2.5 text-melora-orange">
            <Trophy className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Membership</span>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-white">
            {tierLabel[profile.tier]}
          </p>
          <p className="text-[11px] text-melora-textMuted mt-1">High-resolution spatial audio</p>
        </div>

        <div className="glass-card rounded-card-lg p-5 border border-white/6">
          <div className="flex items-center gap-2.5 text-melora-purple">
            <Users className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Role</span>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-white capitalize">
            {profile.role.toLowerCase()}
          </p>
          <p className="text-[11px] text-melora-textMuted mt-1">Platform community permissions</p>
        </div>

        <div className="glass-card rounded-card-lg p-5 border border-white/6">
          <div className="flex items-center gap-2.5 text-melora-pink">
            <Flame className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Listening Streak</span>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-white">
            12 Days
          </p>
          <p className="text-[11px] text-melora-textMuted mt-1">Consistent melody discovery</p>
        </div>

        <div className="glass-card rounded-card-lg p-5 border border-white/6">
          <div className="flex items-center gap-2.5 text-melora-lavender">
            <Music2 className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Top Genre</span>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-white">
            Synthwave
          </p>
          <p className="text-[11px] text-melora-textMuted mt-1">68% of recent sessions</p>
        </div>
      </section>

      {/* Account Info Details */}
      <section className="glass-panel rounded-card-lg p-6 border border-white/6 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
        <div>
          <p className="font-semibold text-melora-textMuted uppercase tracking-wider mb-1">Email</p>
          <p className="text-white font-medium">{profile.email || "Private"}</p>
        </div>
        <div>
          <p className="font-semibold text-melora-textMuted uppercase tracking-wider mb-1">Birth Date</p>
          <p className="text-white font-medium">{profile.birth_date || "Not set"}</p>
        </div>
        <div>
          <p className="font-semibold text-melora-textMuted uppercase tracking-wider mb-1">Gender</p>
          <p className="text-white font-medium">{profile.gender || "UNSPECIFIED"}</p>
        </div>
      </section>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={editing}
        onClose={() => setEditing(false)}
        title="Edit Profile"
        description="Update your personal sound identity on Melora."
      >
        <form onSubmit={save} className="space-y-4">
          <Input
            label="Display Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Birth Date"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-melora-textSecondary ml-1">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
                className="w-full h-11 bg-melora-cardElevated border border-white/8 rounded-input text-xs text-white px-3 focus:outline-none focus:border-melora-purple/60"
              >
                <option value="UNSPECIFIED">Prefer not to say</option>
                <option value="FEMALE">Female</option>
                <option value="MALE">Male</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-melora-textSecondary ml-1">
              Biography
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell listeners about your sound..."
              className="w-full bg-melora-cardElevated border border-white/8 rounded-input text-xs text-white p-3 focus:outline-none focus:border-melora-purple/60"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-melora-textSecondary ml-1">
              Profile Photo
            </label>
            <input
              type="file"
              accept="image/*"
              disabled={!canUploadAvatar}
              onChange={(e) => setImage(e.target.files?.[0] || null)}
              className="text-xs text-melora-textSecondary file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-melora-purple file:text-white hover:file:bg-melora-purple/80"
            />
            {!canUploadAvatar && (
              <p className="text-[11px] text-amber-300 ml-1">
                Avatar customization requires a Silver or Gold membership.
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setEditing(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={saving}
              className="rounded-full shadow-glow"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </main>
  );
}
