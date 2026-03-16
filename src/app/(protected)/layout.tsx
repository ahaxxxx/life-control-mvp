"use client";

import type { ReactNode } from "react";
import { AuthGuard } from "@/components/auth-guard";
import { Navbar } from "@/components/navbar";

export default function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-paper">
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </div>
    </AuthGuard>
  );
}
