"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User } from "lucide-react";
import Button from "../../../components/common/Button";
import { storage } from "../../../lib/storage";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password) {
      setError("لطفاً تمام فیلدها را پر کنید.");
      return;
    }

    // بررسی تکراری نبودن ایمیل
    const users = JSON.parse(localStorage.getItem('sptfy_users') || '[]');
    if (users.find((u: any) => u.email === email)) {
      setError("این ایمیل قبلاً ثبت شده است.");
      return;
    }

    // ایجاد شیء کاربر جدید با نقش پیش‌فرض USER
    const newUser = {
      id: `u${Date.now()}`,
      name,
      email,
      password,
      role: "USER",
      following: [],
      favorites: []
    };

    // ذخیره کاربر و تخصیص مستقیم به عنوان کاربر فعلی (لاگین خودکار پس از ثبت‌نام)
    storage.saveUser(newUser);
    storage.setCurrentUser(newUser);

    // انتقال به صفحه اصلی
    router.push("/");
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Cinematic Ambient Light Behind the Form */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-melora-pink/20 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Glassmorphism Card */}
      <div className="w-full max-w-md bg-melora-surfaceLayer/60 backdrop-blur-[20px] border border-white/5 p-8 md:p-10 rounded-card shadow-soft relative z-10">

        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Join Melora</h1>
          <p className="text-melora-textSecondary">Create an account to start listening.</p>
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleRegister}>

          <div className="space-y-1">
            <label className="text-sm font-medium text-melora-textSecondary ml-1">Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-melora-textMuted" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-melora-bgPrimary/50 border border-white/10 rounded-btn py-3 pl-12 pr-4 text-white placeholder:text-melora-textMuted focus:outline-none focus:border-melora-purple focus:ring-1 focus:ring-melora-purple transition-all duration-base"
              />
            </div>
          </div>

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
            <label className="text-sm font-medium text-melora-textSecondary ml-1">Password</label>
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

          {error && <p className="text-red-500 text-sm text-center pt-2">{error}</p>}

          <Button variant="primary" className="w-full mt-6" type="submit">
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-melora-textSecondary mt-8">
          Already have an account?{" "}
          <Link href="/login" className="text-melora-pink font-semibold hover:text-melora-orange transition-colors duration-base">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
