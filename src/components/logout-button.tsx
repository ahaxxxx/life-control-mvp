"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";

export function LogoutButton() {
  const router = useRouter();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    router.replace("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="rounded-lg border border-line px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
      type="button"
    >
      Logout
    </button>
  );
}
