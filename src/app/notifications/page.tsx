"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bell, BellRing, Check, CheckCircle2, Trash2 } from "lucide-react";
import { notificationsApi } from "../../lib/api";
import { Notification } from "../../types";

function relativeTime(value: string) {
  const ms = Date.now() - new Date(value).getTime();
  const minutes = Math.floor(ms / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const response = await notificationsApi.list();
      setNotifications(response.results);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => notifications.filter((n) => activeTab === "all" || !n.isRead), [activeTab, notifications]);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = async (id: string) => {
    try {
      const updated = await notificationsApi.markRead(id);
      setNotifications((items) => items.map((item) => item.id === id ? updated : item));
    } catch (e) { setError(e instanceof Error ? e.message : "Could not mark notification as read."); }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications((items) => items.map((item) => ({ ...item, isRead: true })));
    } catch (e) { setError(e instanceof Error ? e.message : "Could not mark notifications as read."); }
  };

  const remove = async (id: string) => {
    try {
      await notificationsApi.remove(id);
      setNotifications((items) => items.filter((item) => item.id !== id));
    } catch (e) { setError(e instanceof Error ? e.message : "Could not delete notification."); }
  };

  const clearAll = async () => {
    try {
      await notificationsApi.clearAll();
      setNotifications([]);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not clear notifications."); }
  };

  return (
    <main className="flex-1 w-full p-6 md:p-10 pb-32 max-w-4xl mx-auto">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div><h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3"><Bell className="w-8 h-8 text-melora-pink" />Notifications</h1><p className="text-melora-textSecondary mt-2">Account, release, artist, finance and support updates.</p></div>
        <div className="flex items-center gap-2">
          <div className="bg-melora-surfaceLayer/50 p-1 rounded-lg border border-white/5 flex"><button onClick={() => setActiveTab("all")} className={`px-4 py-2 text-sm rounded-md ${activeTab === "all" ? "bg-white/10 text-white" : "text-melora-textMuted"}`}>All</button><button onClick={() => setActiveTab("unread")} className={`px-4 py-2 text-sm rounded-md ${activeTab === "unread" ? "bg-white/10 text-white" : "text-melora-textMuted"}`}>Unread ({unreadCount})</button></div>
          <button onClick={markAllAsRead} disabled={!unreadCount} className="p-2 text-melora-textSecondary hover:text-melora-purple disabled:opacity-30" title="Mark all as read"><CheckCircle2 className="w-5 h-5" /></button>
          <button onClick={clearAll} disabled={!notifications.length} className="p-2 text-melora-textSecondary hover:text-melora-pink disabled:opacity-30" title="Clear all"><Trash2 className="w-5 h-5" /></button>
        </div>
      </header>

      {error && <p className="mb-5 text-sm text-red-300">{error}</p>}
      <section className="bg-melora-surfaceLayer/30 border border-white/5 rounded-panel overflow-hidden">
        {loading ? <div className="p-12 text-center text-melora-textMuted">Loading notifications...</div> : filtered.length ? (
          <div className="divide-y divide-white/5">
            {filtered.map((notification) => (
              <div key={notification.id} className={`p-5 flex items-start gap-4 group ${!notification.isRead ? "bg-melora-purple/5" : "hover:bg-white/5"}`}>
                <div className={`mt-2 w-2.5 h-2.5 rounded-full shrink-0 ${!notification.isRead ? "bg-melora-purple shadow-glow" : "bg-white/10"}`} />
                <div className="flex-1 min-w-0">
                  {notification.link ? <Link href={notification.link} onClick={() => !notification.isRead && markAsRead(notification.id)} className={`block ${!notification.isRead ? "font-semibold text-white" : "text-melora-textSecondary"}`}>{notification.message}</Link> : <p className={!notification.isRead ? "font-semibold" : "text-melora-textSecondary"}>{notification.message}</p>}
                  <div className="flex items-center gap-3 mt-2"><span className="text-xs text-melora-textMuted">{relativeTime(notification.createdAt)}</span><span className="text-[10px] uppercase tracking-wider bg-white/5 rounded px-2 py-0.5 text-melora-textMuted">{notification.type || "SYSTEM"}</span></div>
                </div>
                <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  {!notification.isRead && <button onClick={() => markAsRead(notification.id)} className="p-2 hover:text-melora-purple" title="Mark as read"><Check className="w-4 h-4" /></button>}
                  <button onClick={() => remove(notification.id)} className="p-2 hover:text-melora-pink" title="Delete notification"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-14 text-center"><BellRing className="w-12 h-12 mx-auto text-melora-textMuted mb-4" /><h3 className="text-xl font-bold">You're all caught up</h3><p className="text-melora-textSecondary mt-2">New notifications will appear here automatically.</p><Link href="/albums" className="inline-block mt-6 px-5 py-3 rounded-xl border border-white/10">Discover Music</Link></div>
        )}
      </section>
    </main>
  );
}
