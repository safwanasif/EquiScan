"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <button
      onClick={handleSignOut}
      className="text-xs font-mono uppercase tracking-widest py-2 px-4 border border-line hover:border-ink transition-colors rounded-sm"
    >
      Sign Out
    </button>
  );
}