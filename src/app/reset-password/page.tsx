"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Lock } from "lucide-react";

import Button from "../../components/common/Button";
import { authApi } from "../../lib/api";

function ResetPasswordForm() {
  const params = useSearchParams();
  const uid = params.get("uid") || "";
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!uid || !token) {
      setError("لینک بازیابی معتبر نیست.");
      return;
    }
    if (password !== passwordConfirm) {
      setError("رمزهای عبور یکسان نیستند.");
      return;
    }
    setLoading(true);
    try {
      const response = await authApi.confirmPasswordReset({
        uid,
        token,
        password,
        passwordConfirm,
      });
      setMessage(response.message);
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : "بازیابی رمز ناموفق بود.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-melora-surfaceLayer/60 border border-white/5 p-8 rounded-card shadow-soft">
        <h1 className="text-2xl font-bold text-white mb-2">رمز عبور جدید</h1>
        <p className="text-melora-textSecondary mb-8">رمز جدید حساب خود را وارد کنید.</p>
        <form onSubmit={submit} className="space-y-5">
          <label className="block">
            <span className="text-sm text-melora-textSecondary">رمز عبور</span>
            <div className="relative mt-2">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-melora-textMuted" />
              <input
                type="password"
                minLength={8}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full bg-melora-bgPrimary/50 border border-white/10 rounded-btn py-3 pl-12 pr-4 text-white"
              />
            </div>
          </label>
          <label className="block">
            <span className="text-sm text-melora-textSecondary">تکرار رمز عبور</span>
            <input
              type="password"
              minLength={8}
              required
              value={passwordConfirm}
              onChange={(event) => setPasswordConfirm(event.target.value)}
              className="mt-2 w-full bg-melora-bgPrimary/50 border border-white/10 rounded-btn py-3 px-4 text-white"
            />
          </label>
          {error && <p className="text-sm text-red-400">{error}</p>}
          {message && (
            <p className="text-sm text-green-400">
              {message} <Link href="/login" className="underline">ورود</Link>
            </p>
          )}
          <Button type="submit" variant="primary" className="w-full" disabled={loading}>
            {loading ? "در حال ذخیره..." : "تغییر رمز عبور"}
          </Button>
        </form>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
