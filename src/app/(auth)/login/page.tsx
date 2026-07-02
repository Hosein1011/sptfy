"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock } from "lucide-react";
import Button from "../../../components/common/Button";
import { storage } from "../../../lib/storage";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("لطفاً ایمیل و رمز عبور را وارد کنید.");
      return;
    }

    const isValid = storage.login(email, password);

    if (isValid) {
      // پیدا کردن کاربر از LocalStorage برای تنظیم در نشست (Session)
      const users = JSON.parse(localStorage.getItem('sptfy_users') || '[]');
      const user = users.find((u: any) => u.email === email);

      if (user) {
        storage.setCurrentUser(user);

        // هدایت بر اساس نقش کاربر
        if (user.role === 'ADMIN') router.push("/admin");
        else if (user.role === 'ARTIST') router.push("/artist");
        else router.push("/");
      }
    } else {
      setError("ایمیل یا رمز عبور نامعتبر است.");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Cinematic Ambient Light Behind the Form */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-melora-purple/20 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Glassmorphism Card */}
      <div className="w-full max-w-md bg-melora-surfaceLayer/60 backdrop-blur-[20px] border border-white/5 p-8 md:p-10 rounded-card shadow-soft relative z-10">

        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-01 shadow-glow mx-auto mb-4 flex items-center justify-center">
            {/* Placeholder for the Melora 'M' wave icon */}
            <span className="text-white font-bold text-xl">M</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-melora-textSecondary">Log in to feel every melody.</p>
        </div>

        {/* Form */}
        <form className="space-y-5" onSubmit={handleLogin}>

          <div className="space-y-1">
            <label className="text-sm font-medium text-melora-textSecondary ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-melora-textMuted" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-melora-bgPrimary/50 border border-white/10 rounded-btn py-3 pl-12 pr-4 text-white placeholder:text-melora-textMuted focus:outline-none focus:border-melora-purple focus:ring-1 focus:ring-melora-purple transition-all duration-base"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center ml-1">
              <label className="text-sm font-medium text-melora-textSecondary">Password</label>
              <Link href="/forgot-password" className="text-xs text-melora-pink hover:text-melora-orange transition-colors duration-base">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-melora-textMuted" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-melora-bgPrimary/50 border border-white/10 rounded-btn py-3 pl-12 pr-4 text-white placeholder:text-melora-textMuted focus:outline-none focus:border-melora-purple focus:ring-1 focus:ring-melora-purple transition-all duration-base"
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <Button variant="primary" className="w-full mt-6" type="submit">
            Log In
          </Button>
        </form>

        <p className="text-center text-sm text-melora-textSecondary mt-8">
          Don't have an account?{" "}
          <Link href="/register" className="text-melora-pink font-semibold hover:text-melora-orange transition-colors duration-base">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
