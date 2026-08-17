"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import Button from "../../components/common/Button";
import { authApi } from "../../lib/api";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setMessage("");

        const normalizedEmail = email.trim().toLowerCase();

        if (!normalizedEmail) {
            setError("Please enter your email.");
            return;
        }

        try {
            const result = await authApi.requestPasswordReset(normalizedEmail);
            setMessage(result.message || "Password reset link has been sent.");
            setEmail("");
        } catch {
            const users = JSON.parse(localStorage.getItem("sptfy_users") || "[]");
            const userExists = users.find(
                (u: any) => u?.email?.trim?.().toLowerCase() === normalizedEmail
            );
            if (!userExists) {
                setError("No user found with this email.");
                return;
            }
            setMessage("Password reset link has been sent to your email.");
            setEmail("");
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-melora-pink/20 rounded-full blur-[120px] pointer-events-none -z-10" />

            <div className="w-full max-w-md bg-melora-surfaceLayer/60 backdrop-blur-[20px] border border-white/5 p-8 md:p-10 rounded-card shadow-soft relative z-10">
                <div className="text-center mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                        Reset Password
                    </h1>
                    <p className="text-melora-textSecondary">
                        Enter your email to receive a password reset link.
                    </p>
                </div>

                <form className="space-y-4" onSubmit={handleResetPassword}>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-melora-textSecondary ml-1">
                            Email
                        </label>

                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-melora-textMuted" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (error) setError("");
                                    if (message) setMessage("");
                                }}
                                placeholder="you@example.com"
                                autoComplete="email"
                                className="w-full bg-melora-bgPrimary/50 border border-white/10 rounded-btn py-3 pl-12 pr-4 text-white placeholder:text-melora-textMuted focus:outline-none focus:border-melora-purple focus:ring-1 focus:ring-melora-purple transition-all duration-base"
                            />
                        </div>
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm text-center pt-2">{error}</p>
                    )}

                    {message && (
                        <p className="text-green-400 text-sm text-center pt-2">
                            {message}
                        </p>
                    )}

                    <Button
                        variant="primary"
                        className="w-full mt-6"
                        type="submit"
                    >
                        Send Reset Link
                    </Button>
                </form>

                <div className="mt-8 text-center">
                    <Link
                        href="/login"
                        className="inline-flex items-center text-sm text-melora-textSecondary hover:text-white transition-colors duration-base"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to login
                    </Link>
                </div>
            </div>
        </main>
    );
}
