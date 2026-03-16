"use client";

import { useCallback, useEffect, useState } from "react";
import { format, isToday, parseISO } from "date-fns";
import { useAuth } from "@/components/providers/auth-provider";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import type { Client, ClientStage } from "@/lib/types";

const clientStages: ClientStage[] = ["Lead", "Quoted", "Negotiation", "Closing"];

interface ClientFormState {
  company: string;
  contact: string;
  stage: ClientStage;
  last_contact: string;
  next_followup: string;
  amount: string;
  note: string;
}

const initialForm: ClientFormState = {
  company: "",
  contact: "",
  stage: "Lead",
  last_contact: "",
  next_followup: "",
  amount: "",
  note: "",
};

export default function ClientsPage() {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ClientFormState>(initialForm);

  const loadClients = useCallback(async () => {
    if (!user) {
      return;
    }

    setLoading(true);
    const { data } = await supabase
      .from("clients")
      .select("*")
      .eq("user_id", user.id)
      .order("next_followup", { ascending: true, nullsFirst: false });

    setClients((data as Client[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void loadClients();
  }, [loadClients]);

  const updateField = <K extends keyof ClientFormState>(key: K, value: ClientFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
      return;
    }

    const payload = {
      user_id: user.id,
      company: form.company,
      contact: form.contact,
      stage: form.stage,
      last_contact: form.last_contact || null,
      next_followup: form.next_followup || null,
      amount: form.amount ? Number(form.amount) : null,
      note: form.note || null,
    };

    if (editingId) {
      await supabase.from("clients").update(payload).eq("id", editingId).eq("user_id", user.id);
    } else {
      await supabase.from("clients").insert(payload);
    }

    resetForm();
    void loadClients();
  };

  const startEdit = (client: Client) => {
    setEditingId(client.id);
    setForm({
      company: client.company,
      contact: client.contact,
      stage: client.stage,
      last_contact: client.last_contact ?? "",
      next_followup: client.next_followup ?? "",
      amount: client.amount?.toString() ?? "",
      note: client.note ?? "",
    });
  };

  const deleteClient = async (clientId: string) => {
    await supabase.from("clients").delete().eq("id", clientId);
    if (editingId === clientId) {
      resetForm();
    }
    void loadClients();
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-line bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-semibold text-ink">Clients</h1>
        <p className="mt-1 text-sm text-slate-500">Track pipeline stage, value, and follow-up dates.</p>

        <form className="mt-5 grid gap-3 md:grid-cols-2" onSubmit={handleSubmit}>
          <input
            required
            value={form.company}
            onChange={(event) => updateField("company", event.target.value)}
            placeholder="Company"
            className="rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-ink"
          />
          <input
            required
            value={form.contact}
            onChange={(event) => updateField("contact", event.target.value)}
            placeholder="Contact"
            className="rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-ink"
          />
          <select
            value={form.stage}
            onChange={(event) => updateField("stage", event.target.value as ClientStage)}
            className="rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-ink"
          >
            {clientStages.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.amount}
            onChange={(event) => updateField("amount", event.target.value)}
            placeholder="Amount"
            className="rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-ink"
          />
          <input
            type="date"
            value={form.last_contact}
            onChange={(event) => updateField("last_contact", event.target.value)}
            className="rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-ink"
          />
          <input
            type="date"
            value={form.next_followup}
            onChange={(event) => updateField("next_followup", event.target.value)}
            className="rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-ink"
          />
          <textarea
            value={form.note}
            onChange={(event) => updateField("note", event.target.value)}
            placeholder="Notes"
            rows={4}
            className="rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-ink md:col-span-2"
          />
          <div className="flex gap-2 md:col-span-2">
            <button
              type="submit"
              className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white"
            >
              {editingId ? "Update Client" : "Add Client"}
            </button>
            {editingId ? (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-line px-4 py-2.5 text-sm font-semibold text-slate-700"
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="rounded-3xl border border-line bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">Pipeline</h2>
          <span className="text-sm text-slate-500">Sorted by next follow-up</span>
        </div>

        {loading ? <p className="text-sm text-slate-500">Loading...</p> : null}
        {!loading && clients.length === 0 ? (
          <p className="text-sm text-slate-500">No clients yet.</p>
        ) : null}

        <div className="space-y-3">
          {clients.map((client) => {
            const needsFollowupToday = Boolean(
              client.next_followup && isToday(parseISO(client.next_followup)),
            );

            return (
              <div
                key={client.id}
                className={cn(
                  "rounded-2xl border p-4",
                  needsFollowupToday ? "border-red-200 bg-red-50" : "border-line",
                )}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <p className="font-medium text-ink">{client.company}</p>
                    <p className="text-sm text-slate-500">
                      {client.contact} · {client.stage}
                    </p>
                    <p className="text-sm text-slate-500">
                      Follow-up:{" "}
                      {client.next_followup
                        ? format(parseISO(client.next_followup), "MMM d, yyyy")
                        : "Not set"}
                      {needsFollowupToday ? " · Today" : ""}
                    </p>
                    <p className="text-sm text-slate-500">
                      Amount: {client.amount !== null ? `$${client.amount}` : "N/A"}
                    </p>
                    {client.note ? <p className="text-sm text-slate-600">{client.note}</p> : null}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(client)}
                      className="rounded-lg border border-line px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void deleteClient(client.id)}
                      className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-danger hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
