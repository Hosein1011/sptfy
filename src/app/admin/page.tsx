"use client";

import React, { useState } from "react";
import { Users, DollarSign, Mic2, CheckCircle2, XCircle, BarChart3 } from "lucide-react";
import Button from "../../components/common/Button";

export default function AdminDashboardPage() {
  // --- UI STATE (Person 2 will replace this with real storage logic) ---
  const [prices, setPrices] = useState({ basic: 0, silver: 4.99, gold: 9.99 });

  const mockPendingArtists = [
    { id: 1, name: "Neon Skyline", genre: "Synthwave", date: "Today" },
    { id: 2, name: "Luna Echo", genre: "Dream Pop", date: "Yesterday" },
    { id: 3, name: "The Midnight Sons", genre: "Indie Rock", date: "Oct 12" },
  ];

  // --- STUBS FOR PERSON 2 ---
  const handleApproveArtist = (id: number, approved: boolean) => {
    console.log(`Artist ${id} approval status: ${approved}`);
    // storage.approveArtist(id)...
  };

  const handlePriceChange = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Updated Prices to:", prices);
    // storage.updateSubscriptionPrices(prices)...
  };

  return (
    <main className="min-h-screen p-6 md:p-10 pb-32">
      
      {/* Header */}
      <header className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-melora-purple" />
          Admin Overview
        </h1>
        <p className="text-melora-textSecondary font-medium">
          Manage the platform, pricing, and creators.
        </p>
      </header>

      {/* Top Stats Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Stat Card 1 */}
        <div className="bg-melora-surfaceLayer/50 backdrop-blur-md rounded-card p-6 border border-white/5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-01 shadow-glow flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-melora-textSecondary text-sm font-medium mb-1">Total Listeners</p>
            <h3 className="text-2xl font-bold text-white">12,480</h3>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-melora-surfaceLayer/50 backdrop-blur-md rounded-card p-6 border border-white/5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-02 shadow-glow flex items-center justify-center">
            <Mic2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-melora-textSecondary text-sm font-medium mb-1">Verified Artists</p>
            <h3 className="text-2xl font-bold text-white">342</h3>
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="bg-melora-surfaceLayer/50 backdrop-blur-md rounded-card p-6 border border-white/5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-03 shadow-[0_0_30px_rgba(255,180,92,0.3)] flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-melora-textSecondary text-sm font-medium mb-1">Monthly Revenue</p>
            <h3 className="text-2xl font-bold text-white">$4,890</h3>
          </div>
        </div>
      </section>

      {/* Main Grid: Approvals & Pricing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Artist Approvals */}
        <section className="bg-melora-surfaceLayer/30 border border-white/5 rounded-panel p-6 md:p-8">
          <h2 className="text-xl font-bold text-white mb-6">Pending Artist Approvals</h2>
          
          <div className="space-y-4">
            {mockPendingArtists.map((artist) => (
              <div key={artist.id} className="flex items-center justify-between p-4 rounded-xl bg-melora-bgPrimary/50 border border-white/5 hover:border-white/10 transition-colors duration-base">
                <div className="flex items-center gap-4">
                  {/* Avatar Placeholder */}
                  <div className="w-10 h-10 rounded-full bg-melora-surfaceLayer flex items-center justify-center text-melora-purple font-bold">
                    {artist.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">{artist.name}</h4>
                    <p className="text-xs text-melora-textSecondary">{artist.genre} • Applied {artist.date}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleApproveArtist(artist.id, false)}
                    className="p-2 text-melora-textMuted hover:text-melora-pink transition-colors duration-base"
                    title="Reject"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                  <button 
                    onClick={() => handleApproveArtist(artist.id, true)}
                    className="p-2 text-melora-textSecondary hover:text-melora-purple hover:shadow-[0_0_15px_rgba(123,92,255,0.4)] rounded-full transition-all duration-base"
                    title="Approve"
                  >
                    <CheckCircle2 className="w-6 h-6" />
                  </button>
                </div>
              </div>
            ))}
            
            {mockPendingArtists.length === 0 && (
              <p className="text-center text-melora-textSecondary py-8">No pending artists.</p>
            )}
          </div>
        </section>

        {/* Right Column: Pricing Management */}
        <section className="bg-melora-surfaceLayer/30 border border-white/5 rounded-panel p-6 md:p-8">
          <h2 className="text-xl font-bold text-white mb-6">Subscription Pricing</h2>
          
          <form onSubmit={handlePriceChange} className="space-y-6">
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-melora-textSecondary flex justify-between">
                <span>Basic Tier (Max 6 Playlists)</span>
                <span className="text-white font-bold">Free</span>
              </label>
              <input 
                type="text" 
                disabled 
                value="$0.00"
                className="w-full bg-melora-bgPrimary/30 border border-white/5 rounded-btn py-3 px-4 text-melora-textMuted cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-melora-textSecondary">Silver Tier (Max 100 Playlists)</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-melora-textMuted" />
                <input 
                  type="number" 
                  step="0.01"
                  value={prices.silver}
                  onChange={(e) => setPrices({...prices, silver: parseFloat(e.target.value)})}
                  className="w-full bg-melora-bgPrimary/50 border border-white/10 rounded-btn py-3 pl-10 pr-4 text-white focus:outline-none focus:border-melora-purple focus:ring-1 focus:ring-melora-purple transition-all duration-base"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-melora-textSecondary flex justify-between">
                <span>Gold Tier (Unlimited)</span>
                <span className="text-melora-orange font-bold text-xs bg-melora-orange/10 px-2 py-1 rounded-md">Most Popular</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-melora-textMuted" />
                <input 
                  type="number" 
                  step="0.01"
                  value={prices.gold}
                  onChange={(e) => setPrices({...prices, gold: parseFloat(e.target.value)})}
                  className="w-full bg-melora-bgPrimary/50 border border-white/10 rounded-btn py-3 pl-10 pr-4 text-white focus:outline-none focus:border-melora-orange focus:ring-1 focus:ring-melora-orange transition-all duration-base"
                />
              </div>
            </div>

            <Button variant="primary" type="submit" className="w-full mt-4">
              Save Pricing Changes
            </Button>
          </form>
        </section>

      </div>
    </main>
  );
}