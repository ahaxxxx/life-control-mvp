"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      router.replace(user ? "/dashboard" : "/login");
    }
  }, [loading, router, user]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-4 text-sm text-slate-500">
      Loading...
    </main>
  );
}
