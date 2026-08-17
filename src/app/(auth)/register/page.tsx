"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, FileAudio, Lock, Mail, User, Sparkles } from "lucide-react";
import Button from "../../../components/common/Button";
import Input from "../../../components/ui/Input";
import MeloraLogo from "../../../components/brand/MeloraLogo";
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
      setError("Please fill in all required fields.");
      return;
    }
    if (passwordConfirm && passwordConfirm !== password) {
      setError("Passwords do not match.");
      return;
    }
    if (!accepted) {
      setError("Please accept the Privacy Policy.");
      return;
    }
    if (accountType === "listener" && (!passwordConfirm || !birthDate)) {
      setError("Password confirmation and birth date are required for listener registration.");
      return;
    }
    if (accountType === "artist" && !sampleWorkUrl && !sampleWorkFile) {
      setError("Please provide at least one sample work URL or upload a file for artist registration.");
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
      // Keep the original phase-one mock path usable when backend is offline
      const users = JSON.parse(localStorage.getItem("sptfy_users") || "[]");
      if (users.find((u: UserType) => u.email === email)) {
        setError("This email is already registered.");
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
    <main className="min-h-screen flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Background Ambient Lights */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[550px] h-[550px] bg-melora-pink/20 rounded-full blur-[150px] pointer-events-none -z-10 animate-float-slow" />
      <div className="absolute bottom-10 left-10 w-[450px] h-[450px] bg-melora-purple/15 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="w-full max-w-2xl glass-modal rounded-card-lg p-8 md:p-12 border border-white/10 shadow-glow-purple relative z-10 my-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <MeloraLogo size="lg" showWordmark={false} variant="gradient" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Join the Melora Soundscape
          </h1>
          <p className="text-xs md:text-sm text-melora-textSecondary mt-1">
            Discover emotions through sound or share your melody with the world.
          </p>
        </div>

        {/* Account Type Selector */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-white/6 rounded-btn border border-white/8 mb-6">
          {(["listener", "artist"] as AccountType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setAccountType(type)}
              className={`py-2.5 rounded-btn text-xs font-bold transition-all ${
                accountType === type
                  ? "bg-gradient-primary text-white shadow-glow"
                  : "text-melora-textSecondary hover:text-white"
              }`}
            >
              {type === "listener" ? "Listener" : "Artist Account"}
            </button>
          ))}
        </div>

        <form className="space-y-4" onSubmit={handleRegister}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={accountType === "artist" ? "Artist / Stage Name" : "Full Name"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              leftIcon={<User className="w-4 h-4" />}
            />

            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              leftIcon={<Mail className="w-4 h-4" />}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
            />

            {accountType === "listener" && (
              <Input
                label="Confirm Password"
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="Confirm your password"
                leftIcon={<Lock className="w-4 h-4" />}
              />
            )}
          </div>

          {accountType === "listener" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Birth Date"
                aria-label="Birth Date"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-melora-textSecondary ml-1">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  className="w-full h-11 bg-melora-cardElevated border border-white/8 rounded-input text-xs text-white px-3 focus:outline-none focus:border-melora-purple/60"
                >
                  <option value="UNSPECIFIED">Prefer not to say</option>
                  <option value="FEMALE">Female</option>
                  <option value="MALE">Male</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
          )}

          {accountType === "artist" && (
            <div className="space-y-4 pt-2 border-t border-white/6">
              <Input
                label="Sample Work URL"
                value={sampleWorkUrl}
                onChange={(e) => setSampleWorkUrl(e.target.value)}
                placeholder="https://soundcloud.com/... or portfolio link"
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-melora-textSecondary ml-1">
                  Artist Biography
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share your sonic background and musical style..."
                  className="w-full bg-melora-cardElevated border border-white/8 rounded-input text-xs text-white p-3 focus:outline-none focus:border-melora-purple/60"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-melora-textSecondary ml-1">
                  Demo Audio File
                </label>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setSampleWorkFile(e.target.files?.[0] || null)}
                  className="text-xs text-melora-textSecondary file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-melora-pink file:text-white"
                />
              </div>
            </div>
          )}

          {/* Privacy Policy agreement */}
          <div className="flex items-center gap-2.5 pt-2">
            <input
              id="privacy-check"
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="accent-purple-500 rounded"
            />
            <label htmlFor="privacy-check" className="text-xs text-melora-textSecondary">
              I agree to the{" "}
              <button
                type="button"
                onClick={() => setIsPrivacyOpen(true)}
                className="text-melora-pink hover:underline"
              >
                Privacy Policy & Terms
              </button>
            </label>
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
            isLoading={isSubmitting}
          >
            Create Account
          </Button>
        </form>

        <p className="text-center text-xs text-melora-textSecondary mt-6">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-melora-pink font-bold hover:text-melora-orange transition-colors"
          >
            Log In
          </Link>
        </p>
      </div>

      <PrivacyPolicyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />
    </main>
  );
}
