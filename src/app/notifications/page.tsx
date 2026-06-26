"use client";

import React, { useState } from "react";
import { Bell, CheckCircle2, Trash2, BellRing } from "lucide-react";
import Button from "../../components/common/Button";

export default function NotificationsPage() {
  // --- UI STATE (Person 3 will wire to store) ---
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [notifications, setNotifications] = useState([
    { id: 1, type: "social", text: "Alex Mercer started following you.", time: "2 mins ago", read: false },
    { id: 2, type: "system", text: "Your Gold Tier subscription has been successfully renewed.", time: "3 hours ago", read: false },
    { id: 3, type: "music", text: "New release from The Weeknd matches your Vibe Profile.", time: "Yesterday", read: true },
    { id: 4, type: "social", text: "Sarah added 'Midnight City' to their public playlist.", time: "2 days ago", read: true },
  ]);

  const filteredNotifs = notifications.filter(n => activeTab === "all" || !n.read);
  const hasUnread = notifications.some(n => !n.read);

  // --- STUBS ---
  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <main className="flex-1 w-full p-6 md:p-10 pb-32 max-w-4xl mx-auto">
      
      {/* Header */}
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Bell className="w-8 h-8 text-melora-pink" />
            Notifications
          </h1>
          <p className="text-melora-textSecondary font-medium">
            Stay in tune with your network and account.
          </p>
        </div>

        {/* Filters & Actions */}
        <div className="flex items-center gap-4">
          <div className="bg-melora-surfaceLayer/50 p-1 rounded-lg border border-white/5 flex">
            <button 
              onClick={() => setActiveTab("all")}
              className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all duration-base ${activeTab === "all" ? "bg-white/10 text-white" : "text-melora-textMuted hover:text-white"}`}
            >
              All
            </button>
            <button 
              onClick={() => setActiveTab("unread")}
              className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all duration-base ${activeTab === "unread" ? "bg-white/10 text-white" : "text-melora-textMuted hover:text-white"}`}
            >
              Unread
            </button>
          </div>
          
          <button 
            onClick={markAllAsRead}
            disabled={!hasUnread}
            className="p-2 text-melora-textSecondary hover:text-melora-purple disabled:opacity-50 transition-colors"
            title="Mark all as read"
          >
            <CheckCircle2 className="w-5 h-5" />
          </button>
          <button 
            onClick={clearAll}
            disabled={notifications.length === 0}
            className="p-2 text-melora-textSecondary hover:text-melora-pink disabled:opacity-50 transition-colors"
            title="Clear all"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Notifications List or Empty State */}
      <section className="bg-melora-surfaceLayer/30 border border-white/5 rounded-panel overflow-hidden relative">
        
        {filteredNotifs.length > 0 ? (
          <div className="divide-y divide-white/5">
            {filteredNotifs.map((notif) => (
              <div 
                key={notif.id} 
                className={`p-6 flex items-start gap-4 transition-colors duration-base group ${!notif.read ? 'bg-melora-purple/5' : 'hover:bg-white/5'}`}
              >
                {/* Visual Indicator */}
                <div className={`mt-1 w-3 h-3 rounded-full flex-shrink-0 ${!notif.read ? 'bg-melora-purple shadow-[0_0_12px_rgba(123,92,255,0.8)]' : 'bg-white/10 border border-white/20'}`} />
                
                <div className="flex-1">
                  <p className={`text-base md:text-lg mb-1 ${!notif.read ? 'text-white font-semibold' : 'text-melora-textSecondary'}`}>
                    {notif.text}
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-melora-textMuted">{notif.time}</span>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-melora-textMuted bg-white/5 px-2 py-0.5 rounded">
                      {notif.type}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Explicit Empty State View Requirement */
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-01 opacity-20 blur-2xl absolute" />
            <div className="w-16 h-16 rounded-full bg-melora-surfaceLayer border border-white/10 flex items-center justify-center mb-6 relative z-10 shadow-soft">
              <BellRing className="w-8 h-8 text-melora-textMuted" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 relative z-10">Nothing to see here</h3>
            <p className="text-melora-textSecondary max-w-md relative z-10">
              You are completely caught up. When someone follows you, updates a playlist, or drops new music, it will appear here.
            </p>
            <Button variant="secondary" className="mt-8 relative z-10">
              Discover New Music
            </Button>
          </div>
        )}
      </section>

    </main>
  );
}