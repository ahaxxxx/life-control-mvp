"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { supabase } from "@/lib/supabase";
import type { ClientStage, TaskType } from "@/lib/types";

interface QuickAddModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

type QuickMode = "task" | "client";

const taskTypes: TaskType[] = ["work", "study", "personal"];
const clientStages: ClientStage[] = ["Lead", "Quoted", "Negotiation", "Closing"];

export function QuickAddModal({ open, onClose, onCreated }: QuickAddModalProps) {
  const { user } = useAuth();
  const [mode, setMode] = useState<QuickMode>("task");
  const [loading, setLoading] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskType, setTaskType] = useState<TaskType>("work");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [company, setCompany] = useState("");
  const [contact, setContact] = useState("");
  const [stage, setStage] = useState<ClientStage>("Lead");
  const [followup, setFollowup] = useState("");

  if (!open || !user) {
    return null;
  }

  const reset = () => {
    setTaskTitle("");
    setTaskType("work");
    setTaskDueDate("");
    setCompany("");
    setContact("");
    setStage("Lead");
    setFollowup("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    if (mode === "task") {
      const { error } = await supabase.from("tasks").insert({
        user_id: user.id,
        title: taskTitle,
        type: taskType,
        due_date: taskDueDate || null,
      });

      if (error) {
        setLoading(false);
        return;
      }
    } else {
      const { error } = await supabase.from("clients").insert({
        user_id: user.id,
        company,
        contact,
        stage,
        next_followup: followup || null,
      });

      if (error) {
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    handleClose();
    onCreated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
      <div className="w-full max-w-md rounded-2xl border border-line bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">Quick Add</h2>
          <button
            onClick={handleClose}
            type="button"
            className="rounded-lg px-2 py-1 text-sm text-slate-500 hover:bg-slate-100"
          >
            Close
          </button>
        </div>

        <div className="mb-4 flex gap-2">
          <button
            type="button"
            onClick={() => setMode("task")}
            className={`rounded-lg px-3 py-2 text-sm font-medium ${
              mode === "task" ? "bg-ink text-white" : "border border-line text-slate-700"
            }`}
          >
            Task
          </button>
          <button
            type="button"
            onClick={() => setMode("client")}
            className={`rounded-lg px-3 py-2 text-sm font-medium ${
              mode === "client" ? "bg-ink text-white" : "border border-line text-slate-700"
            }`}
          >
            Client
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode === "task" ? (
            <>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Title</span>
                <input
                  required
                  value={taskTitle}
                  onChange={(event) => setTaskTitle(event.target.value)}
                  className="w-full rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-ink"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Type</span>
                <select
                  value={taskType}
                  onChange={(event) => setTaskType(event.target.value as TaskType)}
                  className="w-full rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-ink"
                >
                  {taskTypes.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Due date</span>
                <input
                  type="date"
                  value={taskDueDate}
                  onChange={(event) => setTaskDueDate(event.target.value)}
                  className="w-full rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-ink"
                />
              </label>
            </>
          ) : (
            <>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Company</span>
                <input
                  required
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                  className="w-full rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-ink"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Contact</span>
                <input
                  required
                  value={contact}
                  onChange={(event) => setContact(event.target.value)}
                  className="w-full rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-ink"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Stage</span>
                <select
                  value={stage}
                  onChange={(event) => setStage(event.target.value as ClientStage)}
                  className="w-full rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-ink"
                >
                  {clientStages.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Next follow-up</span>
                <input
                  type="date"
                  value={followup}
                  onChange={(event) => setFollowup(event.target.value)}
                  className="w-full rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-ink"
                />
              </label>
            </>
          )}

          <button
            disabled={loading}
            type="submit"
            className="w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95 disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
}
