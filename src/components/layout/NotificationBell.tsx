"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, Check, Trash2 } from "lucide-react";
import { notificationsApi } from "../../lib/api";
import { useAuthStore } from "../../store/authStore";
import { Notification } from "../../types";

type NotificationBellProps = { unreadCount?: number };

export default function NotificationBell({ unreadCount: unreadCountProp }: NotificationBellProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    if (!isAuthenticated) return;
    try { const response = await notificationsApi.list(); setNotifications(response.results.slice(0, 8)); } catch { /* bell remains empty when API is offline */ }
  };

  useEffect(() => { load(); }, [isAuthenticated]);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => { if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false); };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const internalUnread = notifications.filter((n) => !n.isRead).length;
  const unreadCount = unreadCountProp ?? internalUnread;
  const markRead = async (id: string) => { try { const updated = await notificationsApi.markRead(id); setNotifications((items) => items.map((n) => n.id === id ? updated : n)); } catch { /* no-op */ } };
  const clear = async () => { try { await notificationsApi.clearAll(); setNotifications([]); } catch { /* no-op */ } };

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => { setIsOpen(!isOpen); if (!isOpen) load(); }} className="relative p-2 text-melora-textSecondary hover:text-white rounded-full hover:bg-white/5">
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && <span className="absolute top-1 right-1 w-3 h-3 bg-melora-pink rounded-full border-2 border-[#0B0F16] shadow-[0_0_10px_rgba(255,77,125,0.8)]" />}
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-4 w-80 bg-melora-surfaceLayer/95 backdrop-blur-[24px] border border-white/10 rounded-panel shadow-glow overflow-hidden z-50">
          <div className="p-4 border-b border-white/5 flex justify-between"><h3 className="font-bold">Notifications</h3>{unreadCount > 0 && <span className="text-xs bg-melora-purple/20 text-melora-purple px-2 py-1 rounded">{unreadCount} New</span>}</div>
          <div className="max-h-[320px] overflow-y-auto">
            {notifications.length ? notifications.map((notification) => <div key={notification.id} className={`p-4 border-b border-white/5 flex gap-3 group ${!notification.isRead ? "bg-melora-purple/5" : ""}`}><div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${!notification.isRead ? "bg-melora-purple" : "bg-transparent"}`} /><div className="flex-1"><Link href={notification.link || "/notifications"} onClick={() => { setIsOpen(false); if (!notification.isRead) markRead(notification.id); }} className={`text-sm ${!notification.isRead ? "font-medium text-white" : "text-melora-textSecondary"}`}>{notification.message}</Link></div>{!notification.isRead && <button onClick={() => markRead(notification.id)} className="opacity-0 group-hover:opacity-100 p-1"><Check className="w-4 h-4" /></button>}</div>) : <div className="p-6 text-center text-sm text-melora-textMuted">You're all caught up.</div>}
          </div>
          <div className="p-3 border-t border-white/5 flex justify-between"><button onClick={clear} className="text-xs text-melora-textMuted hover:text-melora-pink flex gap-1 items-center"><Trash2 className="w-3 h-3" /> Clear</button><Link href="/notifications" onClick={() => setIsOpen(false)} className="text-xs font-bold text-melora-purple">View All</Link></div>
        </div>
      )}
    </div>
  );
}
