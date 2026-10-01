"use client";

import React, { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState<string>("");
  const [sending, setSending] = useState<boolean>(false);
  const [sent, setSent] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setSending(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signInError) {
      setError(signInError.message);
      setSending(false);
      return;
    }

    setSent(true);
    setSending(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-12 group">
          <span className="block w-2 h-2 rounded-full bg-rose" />
          <span className="font-serif text-xl tracking-tight">EquiScan</span>
        </Link>

        {sent ? (
          <div>
            <p className="section-label mb-6">Check your email</p>
            <h1 className="font-serif text-4xl leading-tight mb-6">
              A magic link is on its way.
            </h1>
            <p className="text-muted leading-relaxed mb-8">
              Click the link in the email we just sent to{" "}
              <span className="text-ink font-medium">{email}</span> to sign in.
              The link is valid for 60 minutes.
            </p>
            <button
              onClick={() => {
                setSent(false);
                setEmail("");
              }}
              className="text-sm text-ink border-b border-rose pb-0.5 hover:text-rose transition-colors"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <div>
            <p className="section-label mb-6">Sign in</p>
            <h1 className="font-serif text-4xl leading-tight mb-4">
              Welcome to EquiScan.
            </h1>
            <p className="text-muted leading-relaxed mb-10">
              Enter your email to receive a magic link. No passwords.
            </p>

            <form onSubmit={handleMagicLink} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block font-mono text-[10px] tracking-widest text-muted uppercase mb-2"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@institution.edu"
                  required
                  className="w-full px-4 py-3 border border-line rounded-sm bg-paper text-ink font-serif text-base focus:outline-none focus:border-ink transition-colors"
                />
              </div>

              {error ? (
                <p className="text-sm text-rose">{error}</p>
              ) : null}

              <button
                type="submit"
                disabled={sending || !email}
                className="w-full bg-ink text-paper px-6 py-3 text-base hover:bg-rose transition-colors rounded-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {sending ? (
                  <span className="slow-pulse">Sending magic link</span>
                ) : (
                  <span>Send magic link</span>
                )}
              </button>
            </form>

            <p className="mt-8 text-xs text-muted leading-relaxed">
                By signing in you agree to use EquiScan responsibly. No data is
                shared with third parties.
              </p>

              {process.env.NODE_ENV !== "production" ? (
                <div className="mt-8 pt-6 border-t border-line">
                  <p className="font-mono text-[10px] tracking-widest text-muted uppercase mb-3">
                    Dev only
                  </p>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!email) return;
                      setSending(true);
                      setError(null);
                      const res = await fetch("/api/dev-login", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email }),
                      });
                      if (res.ok) {
                        window.location.href = "/dashboard";
                      } else {
                        const data = await res.json();
                        setError(data.error || "Dev login failed");
                        setSending(false);
                      }
                    }}
                    disabled={sending || !email}
                    className="w-full bg-paper text-ink border border-line px-6 py-3 text-sm hover:border-ink hover:bg-paperShade transition-colors rounded-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Dev: instant sign in (no email)
                  </button>
                </div>
              ) : null}
          </div>
        )}
      </div>
    </main>
  );
}