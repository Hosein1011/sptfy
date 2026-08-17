"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Sparkles } from "lucide-react";
import Button from "../../../components/common/Button";
import Input from "../../../components/ui/Input";
import MeloraLogo from "../../../components/brand/MeloraLogo";
import { useAuthStore } from "../../../store/authStore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    const isValid = await login(email, password);
    setLoading(false);

    if (isValid) {
      const user = useAuthStore.getState().user;
      if (user?.role === "ADMIN") {
        router.push("/admin");
      } else if (user?.role === "ARTIST") {
        router.push("/artist");
      } else if (user?.role === "SUPPORTER") {
        router.push("/support");
      } else {
        router.push("/");
      }
    } else {
      setError("Invalid email or password.");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 md:p-6 relative overflow-hidden">
      {/* Background Ambient Atmosphere */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-melora-purple/20 rounded-full blur-[140px] pointer-events-none -z-10 animate-float-slow" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-melora-pink/15 rounded-full blur-[160px] pointer-events-none -z-10" />

      {/* Glass Form Card */}
      <div className="w-full max-w-md glass-modal rounded-card-lg p-8 md:p-10 border border-white/10 shadow-glow-purple relative z-10">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <MeloraLogo size="lg" showWordmark={false} variant="gradient" />
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Welcome to Melora
          </h1>
          <p className="text-xs md:text-sm text-melora-textSecondary mt-1">
            Feel Every Melody — log in to your personal soundspace.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleLogin}>
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            leftIcon={<Mail className="w-4 h-4" />}
            required
            autoFocus
          />

          <div className="space-y-1">
            <div className="flex justify-between items-center px-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-melora-textSecondary">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-melora-pink hover:text-melora-orange transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />
          </div>

          {error && (
            <p className="text-xs text-melora-error text-center font-medium bg-melora-error/10 py-2 rounded-btn border border-melora-error/20">
              {error}
            </p>
          )}

          <Button
            variant="primary"
            size="lg"
            className="w-full mt-4 rounded-btn shadow-glow"
            type="submit"
            isLoading={loading}
          >
            Log In
          </Button>
        </form>

        <p className="text-center text-xs text-melora-textSecondary mt-8">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="text-melora-pink font-bold hover:text-melora-orange transition-colors"
          >
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
