// If you navigate to localhost:3000/profile, you will see your new Profile dashboard.
"use client";

import React from "react";
import { 
  Settings, Flame, Clock, Award, 
  PlayCircle, Heart, Share2, Edit2, UserPlus
} from "lucide-react";
import Button from "../../../components/common/Button";

export default function ProfilePage() {
  // Visual mock data for UI/UX design testing (Person 1)
  // Person 3 will replace this with authStore.user and storage.ts data
  const mockUser = {
    name: "Alex Mercer",
    handle: "@alex_feels",
    bio: "Late night drives and synthwave dreams.",
    followers: 142,
    following: 89,
    streak: 14,
    hoursListened: 342,
    achievements: 8,
    avatar: "bg-gradient-01"
  };

  const topGenres = [
    { name: "Synthwave", color: "text-melora-purple bg-melora-purple/10 border-melora-purple/20" },
    { name: "Dream Pop", color: "text-melora-pink bg-melora-pink/10 border-melora-pink/20" },
    { name: "Indie Rock", color: "text-melora-orange bg-melora-orange/10 border-melora-orange/20" },
    { name: "Lo-Fi Beats", color: "text-white bg-white/10 border-white/20" }
  ];

  const topArtists = [
    { id: 1, name: "The Weeknd", role: "Artist", cover: "bg-gradient-04" },
    { id: 2, name: "M83", role: "Artist", cover: "bg-gradient-01" },
    { id: 3, name: "Kavinsky", role: "Artist", cover: "bg-gradient-03" },
    { id: 4, name: "Daft Punk", role: "Artist", cover: "bg-gradient-02" },
  ];

  return (
    <main className="flex-1 w-full p-6 md:p-10 pb-32">
      
      {/* Profile Header */}
      <section className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12 bg-melora-surfaceLayer/30 border border-white/5 rounded-panel p-8 relative overflow-hidden">
        {/* Ambient Glow behind avatar */}
        <div className="absolute top-0 left-0 w-full h-full bg-melora-purple/5 blur-[100px] pointer-events-none" />

        {/* Avatar */}
        <div className="relative group">
          <div className={`w-32 h-32 md:w-40 md:h-40 rounded-full ${mockUser.avatar} shadow-glow flex items-center justify-center text-5xl font-bold text-white relative z-10`}>
            {mockUser.name.charAt(0)}
          </div>
          <button className="absolute bottom-0 right-0 w-10 h-10 bg-melora-surfaceLayer border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-melora-purple hover:scale-105 transition-all duration-base z-20 shadow-soft">
            <Edit2 className="w-4 h-4" />
          </button>
        </div>

        {/* User Info */}
        <div className="flex-1 text-center md:text-left relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">{mockUser.name}</h1>
          <p className="text-melora-textSecondary font-medium mb-4">{mockUser.handle}</p>
          <p className="text-melora-textPrimary mb-6 max-w-md mx-auto md:mx-0 leading-relaxed">
            {mockUser.bio}
          </p>
          
          <div className="flex items-center justify-center md:justify-start gap-6 text-sm mb-6">
            <div className="flex flex-col">
              <span className="text-white font-bold text-lg">{mockUser.followers}</span>
              <span className="text-melora-textMuted uppercase tracking-wider text-[10px]">Followers</span>
            </div>
            <div className="w-px h-8 bg-white/10"></div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-lg">{mockUser.following}</span>
              <span className="text-melora-textMuted uppercase tracking-wider text-[10px]">Following</span>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-4">
            <Button variant="primary" className="px-8">
              Edit Profile
            </Button>
            <Button variant="secondary" className="px-4">
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Listening Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-melora-surfaceLayer/50 backdrop-blur-md rounded-card p-6 border border-white/5 flex items-center gap-4 hover:-translate-y-1 transition-transform duration-slow">
          <div className="w-12 h-12 rounded-full bg-melora-orange/10 flex items-center justify-center">
            <Flame className="w-6 h-6 text-melora-orange" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">{mockUser.streak} Days</h3>
            <p className="text-melora-textSecondary text-xs uppercase tracking-wider font-bold">Listening Streak</p>
          </div>
        </div>

        <div className="bg-melora-surfaceLayer/50 backdrop-blur-md rounded-card p-6 border border-white/5 flex items-center gap-4 hover:-translate-y-1 transition-transform duration-slow">
          <div className="w-12 h-12 rounded-full bg-melora-purple/10 flex items-center justify-center">
            <Clock className="w-6 h-6 text-melora-purple" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">{mockUser.hoursListened}h</h3>
            <p className="text-melora-textSecondary text-xs uppercase tracking-wider font-bold">Total Playtime</p>
          </div>
        </div>

        <div className="bg-melora-surfaceLayer/50 backdrop-blur-md rounded-card p-6 border border-white/5 flex items-center gap-4 hover:-translate-y-1 transition-transform duration-slow">
          <div className="w-12 h-12 rounded-full bg-melora-pink/10 flex items-center justify-center">
            <Award className="w-6 h-6 text-melora-pink" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">{mockUser.achievements}</h3>
            <p className="text-melora-textSecondary text-xs uppercase tracking-wider font-bold">Achievements</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Favorite Genres */}
        <section>
          <h2 className="text-xl font-bold text-white mb-6">Vibe Profile</h2>
          <div className="bg-melora-surfaceLayer/30 border border-white/5 rounded-panel p-6">
            <div className="flex flex-wrap gap-3">
              {topGenres.map((genre, i) => (
                <span 
                  key={i} 
                  className={`px-4 py-2 rounded-full border text-sm font-semibold ${genre.color}`}
                >
                  {genre.name}
                </span>
              ))}
            </div>
            <p className="text-sm text-melora-textMuted mt-6 leading-relaxed">
              Based on your recent listening, your mood is predominantly atmospheric and energetic.
            </p>
          </div>
        </section>

        {/* Top Artists */}
        <section>
          <h2 className="text-xl font-bold text-white mb-6">Top Artists</h2>
          <div className="space-y-4">
            {topArtists.map((artist, index) => (
              <div key={artist.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-melora-surfaceLayer/60 transition-colors duration-base group cursor-pointer border border-transparent hover:border-white/5">
                <div className="flex items-center gap-4">
                  <span className="text-melora-textMuted font-bold w-4">{index + 1}</span>
                  <div className={`w-12 h-12 rounded-full ${artist.cover} shadow-soft`} />
                  <div>
                    <h4 className="text-white font-semibold group-hover:text-melora-purple transition-colors duration-base">{artist.name}</h4>
                    <p className="text-xs text-melora-textSecondary">{artist.role}</p>
                  </div>
                </div>
                {/* Follow UI Requirement */}
                <button className="text-xs font-bold px-4 py-1.5 rounded-full border border-white/10 text-white hover:border-melora-purple hover:text-melora-purple transition-all duration-base">
                  Following
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

    </main>
  );
}