"use client";

import { useCallback, useEffect, useState } from "react";
import { format, isBefore, parseISO, startOfDay } from "date-fns";
import { useAuth } from "@/components/providers/auth-provider";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import type { Task, TaskType } from "@/lib/types";

const taskTypes: TaskType[] = ["work", "study", "personal"];

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<TaskType>("work");
  const [dueDate, setDueDate] = useState("");

  const loadTasks = useCallback(async () => {
    if (!user) {
      return;
    }

    setLoading(true);
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .order("due_date", { ascending: true, nullsFirst: false });

    setTasks((data as Task[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  const handleAddTask = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
      return;
    }

    await supabase.from("tasks").insert({
      user_id: user.id,
      title,
      type,
      due_date: dueDate || null,
    });

    setTitle("");
    setType("work");
    setDueDate("");
    void loadTasks();
  };

  const toggleComplete = async (task: Task) => {
    await supabase
      .from("tasks")
      .update({ completed: !task.completed })
      .eq("id", task.id)
      .eq("user_id", task.user_id);

    void loadTasks();
  };

  const deleteTask = async (taskId: string) => {
    await supabase.from("tasks").delete().eq("id", taskId);
    void loadTasks();
  };

  const today = startOfDay(new Date());

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-line bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-semibold text-ink">Tasks</h1>
        <p className="mt-1 text-sm text-slate-500">Add, complete, and manage tasks by due date.</p>
        <form className="mt-5 grid gap-3 md:grid-cols-4" onSubmit={handleAddTask}>
          <input
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Task title"
            className="rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-ink md:col-span-2"
          />
          <select
            value={type}
            onChange={(event) => setType(event.target.value as TaskType)}
            className="rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-ink"
          >
            {taskTypes.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            className="rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-ink"
          />
          <button
            type="submit"
            className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white md:col-span-4 md:w-fit"
          >
            Add Task
          </button>
        </form>
      </section>

      <section className="rounded-3xl border border-line bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">Your Tasks</h2>
          <span className="text-sm text-slate-500">Sorted by due date</span>
        </div>

        {loading ? <p className="text-sm text-slate-500">Loading...</p> : null}
        {!loading && tasks.length === 0 ? (
          <p className="text-sm text-slate-500">No tasks yet.</p>
        ) : null}

        <div className="space-y-3">
          {tasks.map((task) => {
            const overdue =
              Boolean(task.due_date) &&
              !task.completed &&
              isBefore(parseISO(task.due_date as string), today);

            return (
              <div
                key={task.id}
                className={cn(
                  "flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between",
                  overdue ? "border-red-200 bg-red-50" : "border-line",
                )}
              >
                <div className="space-y-1">
                  <p
                    className={cn(
                      "font-medium text-ink",
                      task.completed && "text-slate-400 line-through",
                    )}
                  >
                    {task.title}
                  </p>
                  <p className="text-sm text-slate-500">
                    <span className="capitalize">{task.type}</span>
                    {" · "}
                    {task.due_date ? format(parseISO(task.due_date), "MMM d, yyyy") : "No due date"}
                    {overdue ? " · Overdue" : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => void toggleComplete(task)}
                    className="rounded-lg border border-line px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    {task.completed ? "Undo" : "Complete"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void deleteTask(task.id)}
                    className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-danger hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
