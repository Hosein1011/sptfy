"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bell, BellRing, Check, CheckCircle2, Trash2, Sparkles } from "lucide-react";
import { notificationsApi } from "../../lib/api";
import { Notification } from "../../types";
import Button from "../../components/common/Button";
import IconButton from "../../components/ui/IconButton";
import EmptyState from "../../components/ui/EmptyState";
import { useToast } from "../../components/ui/ToastProvider";

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
  const { toast } = useToast();

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

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () => notifications.filter((n) => activeTab === "all" || !n.isRead),
    [activeTab, notifications]
  );
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = async (id: string) => {
    try {
      const updated = await notificationsApi.markRead(id);
      setNotifications((items) =>
        items.map((item) => (item.id === id ? updated : item))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not mark notification as read.");
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications((items) => items.map((item) => ({ ...item, isRead: true })));
      toast("All notifications marked as read", "success");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not mark notifications as read.");
    }
  };

  const remove = async (id: string) => {
    try {
      await notificationsApi.remove(id);
      setNotifications((items) => items.filter((item) => item.id !== id));
      toast("Notification removed", "info");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete notification.");
    }
  };

  return (
    <main className="w-full px-4 md:px-8 lg:px-10 py-6 md:py-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Bell className="w-8 h-8 text-melora-purple" />
            <span>Activity & Notifications</span>
          </h1>
          <p className="text-xs md:text-sm text-melora-textSecondary mt-1">
            New releases from followed artists, system alerts, and playlist updates.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Check className="w-4 h-4" />}
            onClick={markAllAsRead}
            className="rounded-full"
          >
            Mark All Read
          </Button>
        )}
      </header>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/6 pb-4">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
            activeTab === "all"
              ? "bg-gradient-primary text-white shadow-glow"
              : "text-melora-textSecondary hover:text-white bg-white/5"
          }`}
        >
          All Activity ({notifications.length})
        </button>
        <button
          onClick={() => setActiveTab("unread")}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
            activeTab === "unread"
              ? "bg-gradient-primary text-white shadow-glow"
              : "text-melora-textSecondary hover:text-white bg-white/5"
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-card bg-melora-error/15 border border-melora-error/30 text-xs text-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-xs text-melora-textMuted flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-melora-purple animate-pulse" />
          <span>Loading activity...</span>
        </div>
      ) : filtered.length ? (
        <div className="glass-panel rounded-card-lg p-2.5 space-y-1.5 border border-white/6">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`flex items-start justify-between gap-4 p-4 rounded-card transition-colors ${
                item.isRead
                  ? "hover:bg-white/5 bg-transparent"
                  : "bg-melora-purple/10 border border-melora-purple/20 shadow-soft-sm"
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    item.isRead
                      ? "bg-white/8 text-melora-textMuted"
                      : "bg-gradient-primary text-white shadow-glow"
                  }`}
                >
                  <BellRing className="w-4 h-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm text-white">
                    {item.title || item.type || "Notification"}
                  </p>
                  <p className="text-xs text-melora-textSecondary mt-0.5 leading-relaxed">
                    {item.message}
                  </p>
                  <p className="text-[11px] font-mono text-melora-textMuted mt-1.5">
                    {relativeTime(item.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {!item.isRead && (
                  <IconButton
                    variant="ghost"
                    size="sm"
                    onClick={() => markAsRead(item.id)}
                    tooltip="Mark as read"
                  >
                    <CheckCircle2 className="w-4 h-4 text-melora-purple" />
                  </IconButton>
                )}
                <IconButton
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(item.id)}
                  tooltip="Delete"
                  className="hover:text-melora-error"
                >
                  <Trash2 className="w-4 h-4" />
                </IconButton>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="All caught up"
          description="You have no notifications in this view. Enjoy the music!"
        />
      )}
    </main>
  );
}
