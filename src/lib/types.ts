export type TaskType = "work" | "study" | "personal";

export type ClientStage = "Lead" | "Quoted" | "Negotiation" | "Closing";

export interface Task {
  id: string;
  user_id: string;
  title: string;
  type: TaskType;
  due_date: string | null;
  completed: boolean;
  created_at: string;
}

export interface Client {
  id: string;
  user_id: string;
  company: string;
  contact: string;
  stage: ClientStage;
  last_contact: string | null;
  next_followup: string | null;
  amount: number | null;
  note: string | null;
  created_at: string;
}
