"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Edit3, Music2, Share2, Trophy, Users, X } from "lucide-react";
import { authApi } from "../../../lib/api";
import { useAuthStore } from "../../../store/authStore";
import { Gender, User } from "../../../types";

const tierLabel = { FREE: "Free", STANDARD: "Silver", GOLD: "Gold" } as const;

export default function ProfilePage() {
  const router = useRouter();
  const storeUser = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [profile, setProfile] = useState<User | null>(storeUser);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(storeUser?.name || "");
  const [birthDate, setBirthDate] = useState(storeUser?.birth_date || "");
  const [gender, setGender] = useState<Gender>(storeUser?.gender || "UNSPECIFIED");
  const [bio, setBio] = useState(storeUser?.bio || "");
  const [image, setImage] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    authApi.me().then((user) => {
      if (!active) return;
      setProfile(user);
      setUser(user);
      setName(user.name || "");
      setBirthDate(user.birth_date || "");
      setGender(user.gender || "UNSPECIFIED");
      setBio(user.bio || "");
    }).catch(() => {
      if (!useAuthStore.getState().user) router.push("/login");
    });

    return () => {
      active = false;
    };
  }, [router, setUser]);

  if (!profile) {
    return <main className="flex-1 flex items-center justify-center min-h-[60vh] text-melora-textSecondary">Loading profile...</main>;
  }

  // Backend users created before the follow fields were added (or stale localStorage
  // users from phase one) may not contain followingIds. Never read .length directly
  // from the API object; normalize it first.
  const followingIds = Array.isArray(profile.followingIds) ? profile.followingIds : [];
  const followingCount = typeof profile.followingCount === "number"
    ? profile.followingCount
    : followingIds.length;

  const canUploadAvatar = profile.role !== "USER" || profile.tier !== "FREE";
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const updated = await authApi.updateMe({ name, birth_date: birthDate || null, gender, bio, profile_image: image });
      setProfile(updated);
      setUser(updated);
      setEditing(false);
      setMessage("Profile updated successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update profile.");
    } finally {
      setSaving(false);
    }
  };

  const share = async () => {
    const url = `${window.location.origin}/users/${profile.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setMessage("Profile link copied.");
    } catch {
      setMessage(url);
    }
  };

  return (
    <main className="flex-1 min-h-screen px-6 py-8 pb-32 text-white">
      <div className="max-w-6xl mx-auto space-y-7">
        <section className="rounded-3xl bg-melora-surfaceLayer/60 border border-white/5 p-7 md:p-10 shadow-soft">
          <div className="flex flex-col md:flex-row md:items-center gap-8">
            <div className="relative w-36 h-36 rounded-full bg-gradient-01 overflow-hidden flex items-center justify-center text-5xl font-bold shadow-glow shrink-0">
              {profile.profileImage ? <img src={profile.profileImage} alt={profile.name} className="w-full h-full object-cover" /> : (profile.name || "U").charAt(0).toUpperCase()}
              <button onClick={() => setEditing(true)} className="absolute right-2 bottom-2 w-10 h-10 rounded-full bg-black/60 border border-white/10 flex items-center justify-center"><Camera className="w-4 h-4" /></button>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-4xl font-extrabold truncate">{profile.name}</h1>
                {profile.isVerified && <span className="text-xs font-bold rounded-full bg-melora-purple/20 text-melora-purple px-3 py-1">VERIFIED ARTIST</span>}
                {profile.role === "ARTIST" && profile.artistStatus === "PENDING" && <span className="text-xs rounded-full bg-amber-400/10 text-amber-300 px-3 py-1">PENDING APPROVAL</span>}
              </div>
              <p className="text-melora-textMuted">@{profile.username || profile.email?.split("@")[0] || "user"}</p>
              {profile.bio && <p className="mt-4 text-melora-textSecondary max-w-2xl">{profile.bio}</p>}

              <div className="flex flex-wrap gap-8 mt-6">
                <div><p className="text-2xl font-bold">{profile.followerCount ?? 0}</p><p className="text-xs tracking-widest text-melora-textMuted">FOLLOWERS</p></div>
                <div><p className="text-2xl font-bold">{followingCount}</p><p className="text-xs tracking-widest text-melora-textMuted">FOLLOWING</p></div>
                <div><p className="text-2xl font-bold">{profile.dailyStreams ?? 0}</p><p className="text-xs tracking-widest text-melora-textMuted">STREAMS TODAY</p></div>
              </div>

              <div className="flex flex-wrap gap-3 mt-6">
                <button onClick={() => setEditing(true)} className="px-5 py-3 rounded-xl bg-gradient-01 font-semibold flex items-center gap-2"><Edit3 className="w-4 h-4" /> Edit Profile</button>
                <button onClick={share} className="px-5 py-3 rounded-xl border border-white/10 flex items-center gap-2"><Share2 className="w-4 h-4" /> Share</button>
              </div>
            </div>
          </div>
        </section>

        {message && <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-melora-textSecondary">{message}</div>}

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-melora-surfaceLayer/40 border border-white/5 p-5"><div className="flex gap-3 text-melora-textSecondary"><Trophy className="w-5 h-5" /> Subscription</div><p className="mt-3 text-2xl font-bold">{tierLabel[profile.tier]}</p></div>
          <div className="rounded-2xl bg-melora-surfaceLayer/40 border border-white/5 p-5"><div className="flex gap-3 text-melora-textSecondary"><Users className="w-5 h-5" /> Role</div><p className="mt-3 text-2xl font-bold capitalize">{profile.role.toLowerCase()}</p></div>
          <div className="rounded-2xl bg-melora-surfaceLayer/40 border border-white/5 p-5"><div className="flex gap-3 text-melora-textSecondary"><Music2 className="w-5 h-5" /> Daily streams</div><p className="mt-3 text-2xl font-bold">{profile.dailyStreams ?? 0}</p></div>
          <div className="rounded-2xl bg-melora-surfaceLayer/40 border border-white/5 p-5"><p className="text-melora-textSecondary">Username</p><p className="mt-3 text-lg font-bold break-all">{profile.username || "—"}</p></div>
        </section>

        <section className="rounded-2xl bg-melora-surfaceLayer/30 border border-white/5 p-6 grid grid-cols-1 md:grid-cols-3 gap-5 text-sm">
          <div><p className="text-melora-textMuted mb-1">Email</p><p>{profile.email || "Private"}</p></div>
          <div><p className="text-melora-textMuted mb-1">Birth date</p><p>{profile.birth_date || "Not set"}</p></div>
          <div><p className="text-melora-textMuted mb-1">Gender</p><p>{profile.gender || "UNSPECIFIED"}</p></div>
        </section>
      </div>

      {editing && (
        <div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm p-4 flex items-center justify-center">
          <form onSubmit={save} className="w-full max-w-xl rounded-3xl bg-melora-surfaceLayer border border-white/10 p-6 md:p-8 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center"><h2 className="text-2xl font-bold">Edit Profile</h2><button type="button" onClick={() => setEditing(false)}><X className="w-5 h-5" /></button></div>
            <label className="block"><span className="text-sm text-melora-textSecondary">Display name</span><input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3" /></label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label><span className="text-sm text-melora-textSecondary">Birth date</span><input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="mt-1 w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3" /></label>
              <label><span className="text-sm text-melora-textSecondary">Gender</span><select value={gender} onChange={(e) => setGender(e.target.value as Gender)} className="mt-1 w-full bg-melora-bgPrimary border border-white/10 rounded-xl px-4 py-3"><option value="UNSPECIFIED">Prefer not to say</option><option value="FEMALE">Female</option><option value="MALE">Male</option><option value="OTHER">Other</option></select></label>
            </div>
            <label className="block"><span className="text-sm text-melora-textSecondary">Bio</span><textarea rows={4} value={bio} onChange={(e) => setBio(e.target.value)} className="mt-1 w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3" /></label>
            <label className="block"><span className="text-sm text-melora-textSecondary">Profile image</span><input type="file" accept="image/*" disabled={!canUploadAvatar} onChange={(e) => setImage(e.target.files?.[0] || null)} className="mt-2 block text-sm text-melora-textSecondary disabled:opacity-40" />{!canUploadAvatar && <span className="text-xs text-amber-300">Free listeners cannot upload or change a profile image.</span>}</label>
            <button disabled={saving} className="w-full py-3 rounded-xl bg-gradient-01 font-semibold disabled:opacity-50">{saving ? "Saving..." : "Save Changes"}</button>
          </form>
        </div>
      )}
    </main>
  );
}
