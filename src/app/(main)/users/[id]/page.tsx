"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { UserCheck, UserPlus } from "lucide-react";
import { usersApi } from "../../../../lib/api";
import { useAuthStore } from "../../../../store/authStore";
import { User } from "../../../../types";

export default function PublicUserProfilePage() {
  const params = useParams<{ id: string }>();
  const currentUser = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [profile, setProfile] = useState<User | null>(null);
  const [error, setError] = useState("");
  const following = Boolean(currentUser?.followingIds?.includes(params.id));

  useEffect(() => {
    usersApi.get(params.id).then(setProfile).catch((e) => setError(e instanceof Error ? e.message : "User not found."));
  }, [params.id]);

  const toggleFollow = async () => {
    if (!currentUser || !profile || currentUser.id === profile.id) return;
    try {
      if (following) await usersApi.unfollow(profile.id); else await usersApi.follow(profile.id);
      const currentFollowingIds = Array.isArray(currentUser.followingIds) ? currentUser.followingIds : [];
      const updated = {
        ...currentUser,
        followingIds: following
          ? currentFollowingIds.filter((id) => id !== profile.id)
          : [...currentFollowingIds, profile.id],
      };
      setUser(updated);
      setProfile({ ...profile, followerCount: Math.max(0, (profile.followerCount || 0) + (following ? -1 : 1)) });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update follow state.");
    }
  };

  if (error) return <main className="flex-1 p-10 text-red-300">{error}</main>;
  if (!profile) return <main className="flex-1 p-10 text-melora-textSecondary">Loading profile...</main>;
  if (profile.role === "ARTIST") return <main className="flex-1 p-10"><p className="mb-4">This is an artist account.</p><Link href={`/artists/${profile.id}`} className="text-melora-purple">Open artist profile</Link></main>;

  return (
    <main className="flex-1 p-6 md:p-10 pb-32">
      <div className="max-w-4xl mx-auto rounded-3xl bg-melora-surfaceLayer/50 border border-white/5 p-8 md:p-10">
        <div className="flex flex-col sm:flex-row items-center gap-7">
          <div className="w-36 h-36 rounded-full bg-gradient-01 overflow-hidden flex items-center justify-center text-5xl font-bold">{profile.profileImage ? <img src={profile.profileImage} alt="" className="w-full h-full object-cover" /> : profile.name.charAt(0).toUpperCase()}</div>
          <div className="flex-1 text-center sm:text-left"><h1 className="text-4xl font-bold">{profile.name}</h1><p className="text-melora-textMuted mt-1">@{profile.username || "user"}</p>{profile.bio && <p className="text-melora-textSecondary mt-4">{profile.bio}</p>}<div className="flex flex-wrap justify-center sm:justify-start gap-8 mt-5"><span><b>{profile.followerCount ?? 0}</b> followers</span><span><b>{profile.followingCount ?? 0}</b> following</span><span><b>{profile.dailyStreams ?? 0}</b> streams today</span><span><b>{profile.tier === "STANDARD" ? "Silver" : profile.tier === "GOLD" ? "Gold" : "Free"}</b> plan</span></div>{currentUser?.id !== profile.id && <button onClick={toggleFollow} className="mt-6 px-6 py-3 rounded-xl bg-gradient-01 font-semibold inline-flex gap-2 items-center">{following ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}{following ? "Unfollow" : "Follow"}</button>}</div>
        </div>
      </div>
    </main>
  );
}
