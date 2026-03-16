"use client";

import { useCallback, useEffect, useState } from "react";
import { format, isBefore, parseISO, startOfDay } from "date-fns";
import { useAuth } from "@/components/providers/auth-provider";
import { QuickAddModal } from "@/components/quick-add-modal";
import { supabase } from "@/lib/supabase";
import type { Client, Task } from "@/lib/types";

export default function DashboardPage() {
  const { user } = useAuth();
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([]);
  const [followups, setFollowups] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  const loadDashboard = useCallback(async () => {
    if (!user) {
      return;
    }

    setLoading(true);
    const today = format(new Date(), "yyyy-MM-dd");

    const [
      { data: todayData },
      { data: overdueData },
      { data: followupData },
    ] = await Promise.all([
      supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .eq("due_date", today)
        .order("due_date", { ascending: true }),
      supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .eq("completed", false)
        .lt("due_date", today)
        .order("due_date", { ascending: true }),
      supabase
        .from("clients")
        .select("*")
        .eq("user_id", user.id)
        .eq("next_followup", today)
        .order("next_followup", { ascending: true }),
    ]);

    setTodayTasks((todayData as Task[]) ?? []);
    setOverdueTasks((overdueData as Task[]) ?? []);
    setFollowups((followupData as Client[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const isOverdue = (dueDate: string | null) =>
    Boolean(dueDate && isBefore(parseISO(dueDate), startOfDay(new Date())));

  return (
    <>
      <section className="mb-6 flex flex-col gap-4 rounded-3xl border border-line bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Dashboard</h1>
          <p className="text-sm text-slate-500">Daily snapshot of tasks and client follow-ups.</p>
        </div>
        <button
          onClick={() => setQuickAddOpen(true)}
          type="button"
          className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white"
        >
          Quick Add
        </button>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-3xl border border-line bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-ink">Today&apos;s Tasks</h2>
          {loading ? <p className="text-sm text-slate-500">Loading...</p> : null}
          {!loading && todayTasks.length === 0 ? (
            <p className="text-sm text-slate-500">No tasks due today.</p>
          ) : null}
          <div className="space-y-3">
            {todayTasks.map((task) => (
              <div key={task.id} className="rounded-2xl border border-line p-3">
                <p className="font-medium text-ink">{task.title}</p>
                <p className="mt-1 text-sm capitalize text-slate-500">{task.type}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-line bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-ink">Overdue Tasks</h2>
          {loading ? <p className="text-sm text-slate-500">Loading...</p> : null}
          {!loading && overdueTasks.length === 0 ? (
            <p className="text-sm text-slate-500">Nothing overdue.</p>
          ) : null}
          <div className="space-y-3">
            {overdueTasks.map((task) => (
              <div
                key={task.id}
                className={`rounded-2xl border p-3 ${
                  isOverdue(task.due_date) ? "border-red-200 bg-red-50" : "border-line"
                }`}
              >
                <p className="font-medium text-ink">{task.title}</p>
                <p className="mt-1 text-sm text-slate-500">
                  Due {task.due_date ? format(parseISO(task.due_date), "MMM d, yyyy") : "N/A"}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-line bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-ink">Follow-up Today</h2>
          {loading ? <p className="text-sm text-slate-500">Loading...</p> : null}
          {!loading && followups.length === 0 ? (
            <p className="text-sm text-slate-500">No client follow-ups today.</p>
          ) : null}
          <div className="space-y-3">
            {followups.map((client) => (
              <div key={client.id} className="rounded-2xl border border-red-200 bg-red-50 p-3">
                <p className="font-medium text-ink">{client.company}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {client.contact} · {client.stage}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <QuickAddModal
        open={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        onCreated={() => {
          void loadDashboard();
        }}
      />
    </>
  );
}
