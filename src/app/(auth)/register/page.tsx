"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, FileAudio, Lock, Mail, User } from "lucide-react";
import Button from "../../../components/common/Button";
import { storage } from "../../../lib/storage";
import { authApi, tokenStorage } from "../../../lib/api";
import { useAuthStore } from "../../../store/authStore";
import PrivacyPolicyModal from "../../../components/auth/PrivacyPolicyModal";
import { Gender, User as UserType } from "../../../types";

type AccountType = "listener" | "artist";

export default function RegisterPage() {
  const [accountType, setAccountType] = useState<AccountType>("listener");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState<Gender>("UNSPECIFIED");
  const [sampleWorkUrl, setSampleWorkUrl] = useState("");
  const [sampleWorkFile, setSampleWorkFile] = useState<File | null>(null);
  const [bio, setBio] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const completeAuth = (token: string, user: UserType, destination: string) => {
    tokenStorage.set(token);
    setUser(user);
    router.push(destination);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password) {
      setError("لطفاً تمام فیلدهای اصلی را پر کنید.");
      return;
    }
    if (passwordConfirm && passwordConfirm !== password) {
      setError("رمز عبور و تکرار آن یکسان نیستند.");
      return;
    }
    if (!accepted) {
      setError("لطفاً سیاست حفظ حریم خصوصی را بپذیرید.");
      return;
    }
    if (accountType === "listener" && (!passwordConfirm || !birthDate)) {
      setError("تکرار رمز عبور و تاریخ تولد برای ثبت‌نام کاربر عادی الزامی است.");
      return;
    }
    if (accountType === "artist" && !sampleWorkUrl && !sampleWorkFile) {
      setError("برای حساب هنرمند حداقل یک نمونه‌کار وارد یا بارگذاری کنید.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (accountType === "artist") {
        const result = await authApi.registerArtist({
          stageName: name,
          email,
          password,
          sampleWorkUrl,
          sampleWorkFile,
          bio,
        });
        completeAuth(result.token, result.user, "/profile");
        return;
      }

      const result = await authApi.register({
        name,
        email,
        password,
        passwordConfirm: passwordConfirm || undefined,
        birthDate: birthDate || null,
        gender,
        acceptedPrivacy: accepted,
      });
      completeAuth(result.token, result.user, "/");
    } catch {
      // Keep the original phase-one mock path usable when Django is offline.
      const users = JSON.parse(localStorage.getItem("sptfy_users") || "[]");
      if (users.find((u: UserType) => u.email === email)) {
        setError("این ایمیل قبلاً ثبت شده است.");
        setIsSubmitting(false);
        return;
      }

      const newUser: UserType = {
        id: `u${Date.now()}`,
        name,
        email,
        password,
        role: accountType === "artist" ? "ARTIST" : "USER",
        tier: "FREE",
        followingIds: [],
        birth_date: birthDate || null,
        gender,
        bio,
        artistStatus: accountType === "artist" ? "PENDING" : "N/A",
        isVerified: false,
      };
      storage.saveUser(newUser);
      storage.setCurrentUser(newUser);
      useAuthStore.setState({ user: newUser, isAuthenticated: true, isHydrated: true });
      router.push(accountType === "artist" ? "/profile" : "/");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[440px] h-[440px] bg-melora-pink/20 rounded-full blur-[130px] pointer-events-none -z-10" />
      <div className="w-full max-w-2xl bg-melora-surfaceLayer/60 backdrop-blur-[20px] border border-white/5 p-8 md:p-10 rounded-card shadow-soft relative z-10">
        <div className="text-center mb-7">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Join Melora</h1>
          <p className="text-melora-textSecondary">Create a listener or artist account.</p>
        </div>

        <div className="grid grid-cols-2 gap-2 p-1 bg-black/20 rounded-xl mb-6">
          {(["listener", "artist"] as AccountType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setAccountType(type)}
              className={`py-2.5 rounded-lg text-sm font-semibold transition-colors ${accountType === type ? "bg-white/10 text-white" : "text-melora-textMuted hover:text-white"}`}
            >
              {type === "listener" ? "Listener" : "Artist"}
            </button>
          ))}
        </div>

        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleRegister}>
          <label className="space-y-1">
            <span className="text-sm font-medium text-melora-textSecondary ml-1">{accountType === "artist" ? "Stage Name" : "Display Name"}</span>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-melora-textMuted" />
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className="w-full bg-melora-bgPrimary/50 border border-white/10 rounded-btn py-3 pl-12 pr-4 text-white focus:outline-none focus:border-melora-purple" />
            </div>
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium text-melora-textSecondary ml-1">Email</span>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-melora-textMuted" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full bg-melora-bgPrimary/50 border border-white/10 rounded-btn py-3 pl-12 pr-4 text-white focus:outline-none focus:border-melora-purple" />
            </div>
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium text-melora-textSecondary ml-1">Password</span>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-melora-textMuted" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-melora-bgPrimary/50 border border-white/10 rounded-btn py-3 pl-12 pr-4 text-white focus:outline-none focus:border-melora-purple" />
            </div>
          </label>

          <label className="space-y-1">
            <span className="text-sm font-medium text-melora-textSecondary ml-1">Confirm Password</span>
            <input type="password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} placeholder="Confirm your password" className="w-full bg-melora-bgPrimary/50 border border-white/10 rounded-btn py-3 px-4 text-white focus:outline-none focus:border-melora-purple" />
          </label>

          {accountType === "listener" ? (
            <>
              <label className="space-y-1">
                <span className="text-sm font-medium text-melora-textSecondary ml-1">Birth Date</span>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-melora-textMuted" />
                  <input aria-label="Birth Date" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="w-full bg-melora-bgPrimary/50 border border-white/10 rounded-btn py-3 pl-12 pr-4 text-white focus:outline-none focus:border-melora-purple" />
                </div>
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium text-melora-textSecondary ml-1">Gender</span>
                <select aria-label="Gender" value={gender} onChange={(e) => setGender(e.target.value as Gender)} className="w-full bg-melora-bgPrimary/80 border border-white/10 rounded-btn py-3 px-4 text-white focus:outline-none focus:border-melora-purple">
                  <option value="UNSPECIFIED">Prefer not to say</option>
                  <option value="FEMALE">Female</option>
                  <option value="MALE">Male</option>
                  <option value="OTHER">Other</option>
                </select>
              </label>
            </>
          ) : (
            <>
              <label className="space-y-1 md:col-span-2">
                <span className="text-sm font-medium text-melora-textSecondary ml-1">Sample Work URL</span>
                <input value={sampleWorkUrl} onChange={(e) => setSampleWorkUrl(e.target.value)} placeholder="https://..." className="w-full bg-melora-bgPrimary/50 border border-white/10 rounded-btn py-3 px-4 text-white focus:outline-none focus:border-melora-purple" />
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium text-melora-textSecondary ml-1">Or upload sample</span>
                <div className="flex items-center gap-3 bg-melora-bgPrimary/50 border border-white/10 rounded-btn py-3 px-4">
                  <FileAudio className="w-5 h-5 text-melora-pink" />
                  <input type="file" accept="audio/*,.pdf" onChange={(e) => setSampleWorkFile(e.target.files?.[0] || null)} className="text-xs text-melora-textSecondary max-w-full" />
                </div>
              </label>
              <label className="space-y-1">
                <span className="text-sm font-medium text-melora-textSecondary ml-1">Bio</span>
                <input value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Short artist biography" className="w-full bg-melora-bgPrimary/50 border border-white/10 rounded-btn py-3 px-4 text-white focus:outline-none focus:border-melora-purple" />
              </label>
            </>
          )}

          <div className="md:col-span-2 flex items-center gap-3 pt-1">
            <input type="checkbox" id="privacy" className="accent-melora-purple w-4 h-4 cursor-pointer" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
            <label htmlFor="privacy" className="text-sm text-melora-textSecondary cursor-pointer">
              پذیرش{" "}
              <button type="button" onClick={() => setIsPrivacyOpen(true)} className="text-melora-pink underline hover:text-white">سیاست حفظ حریم خصوصی</button>
            </label>
          </div>

          {accountType === "artist" && <p className="md:col-span-2 text-xs text-melora-textMuted">Artist accounts are created in Pending status until support/admin approval.</p>}
          {error && <p className="md:col-span-2 text-red-400 text-sm text-center">{error}</p>}

          <div className="md:col-span-2">
            <Button variant="primary" className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Account"}
            </Button>
          </div>
        </form>

        <p className="text-center text-sm text-melora-textSecondary mt-7">Already have an account? <Link href="/login" className="text-melora-pink font-semibold hover:text-melora-orange">Log in</Link></p>
      </div>

      <PrivacyPolicyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
    </main>
  );
}
