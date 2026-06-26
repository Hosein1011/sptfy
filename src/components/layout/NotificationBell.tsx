"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bell, Check, Trash2 } from "lucide-react";
import Link from "next/link";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // --- UI STATE (Person 3 will replace with storage.ts later) ---
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Alex followed you.", time: "2m ago", read: false },
    { id: 2, text: "'Midnight Drive' reached 1,000 saves!", time: "1h ago", read: false },
    { id: 3, text: "System update: Welcome to Melora Phase 1.", time: "1d ago", read: true },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- STUBS FOR PERSON 3 ---
  const handleMarkAsRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    // storage.markNotificationAsRead(id)
  };

  const handleClearAll = () => {
    setNotifications([]);
    // storage.clearNotifications(userId)
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-melora-textSecondary hover:text-white transition-colors duration-base rounded-full hover:bg-white/5"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-3 h-3 bg-melora-pink rounded-full border-2 border-[#0B0F16] shadow-[0_0_10px_rgba(255,77,125,0.8)]"></span>
        )}
      </button>

      {/* Glassmorphism Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-4 w-80 bg-melora-surfaceLayer/90 backdrop-blur-[24px] border border-white/10 rounded-panel shadow-glow overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-base">
          <div className="p-4 border-b border-white/5 flex justify-between items-center bg-melora-bgPrimary/30">
            <h3 className="font-bold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-xs bg-melora-purple/20 text-melora-purple px-2 py-1 rounded-md font-bold">
                {unreadCount} New
              </span>
            )}
          </div>

          <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors duration-base flex gap-3 group cursor-pointer ${!notif.read ? 'bg-melora-purple/5' : ''}`}
                >
                  <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${!notif.read ? 'bg-melora-purple shadow-[0_0_8px_rgba(123,92,255,0.8)]' : 'bg-transparent'}`} />
                  <div className="flex-1">
                    <p className={`text-sm ${!notif.read ? 'text-white font-medium' : 'text-melora-textSecondary'}`}>
                      {notif.text}
                    </p>
                    <p className="text-xs text-melora-textMuted mt-1">{notif.time}</p>
                  </div>
                  {!notif.read && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleMarkAsRead(notif.id); }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-melora-textSecondary hover:text-white transition-all"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-melora-textSecondary text-sm">
                You're all caught up.
              </div>
            )}
          </div>

          <div className="p-3 bg-melora-bgPrimary/50 flex justify-between items-center border-t border-white/5">
            <button 
              onClick={handleClearAll}
              className="text-xs font-semibold text-melora-textMuted hover:text-melora-pink transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" /> Clear
            </button>
            <Link 
              href="/notifications" 
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-melora-purple hover:text-white transition-colors"
            >
              View All
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}