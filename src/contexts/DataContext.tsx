import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  announcements as seedAnnouncements,
  events as seedEvents,
  blogPosts as seedBlogPosts,
  turmas as seedTurmas,
  Announcement,
  EventItem,
  BlogPost,
  Turma,
} from "@/lib/mockData";

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  due_date: string; // ISO YYYY-MM-DD
  priority: "LOW" | "MEDIUM" | "HIGH";
  target: "ALL" | "TEACHERS" | "PARENTS" | "STUDENTS";
  done: boolean;
  created_at: string;
}

const seedReminders: Reminder[] = [
  {
    id: "r1",
    title: "Entregar autorização do passeio ao museu",
    description: "Trazer assinada até quinta-feira na secretaria.",
    due_date: "2026-05-13",
    priority: "HIGH",
    target: "PARENTS",
    done: false,
    created_at: "2026-04-30T09:00:00",
  },
  {
    id: "r2",
    title: "Confirmar presença na Festa Junina",
    description: "Avisar quantos familiares devem ir.",
    due_date: "2026-05-07",
    priority: "MEDIUM",
    target: "ALL",
    done: false,
    created_at: "2026-04-29T11:00:00",
  },
  {
    id: "r3",
    title: "Trazer caderno de leitura",
    description: "Iniciamos o novo livro nesta semana.",
    due_date: "2026-05-05",
    priority: "LOW",
    target: "STUDENTS",
    done: false,
    created_at: "2026-04-28T08:00:00",
  },
];

interface DataContextValue {
  announcements: Announcement[];
  events: EventItem[];
  reminders: Reminder[];
  blogPosts: BlogPost[];
  turmas: Turma[];

  addAnnouncement: (a: Omit<Announcement, "id" | "created_at" | "unread">) => void;
  updateAnnouncement: (id: string, patch: Partial<Announcement>) => void;
  deleteAnnouncement: (id: string) => void;

  addEvent: (e: Omit<EventItem, "id">) => void;
  updateEvent: (id: string, patch: Partial<EventItem>) => void;
  deleteEvent: (id: string) => void;

  addReminder: (r: Omit<Reminder, "id" | "created_at" | "done">) => void;
  updateReminder: (id: string, patch: Partial<Reminder>) => void;
  toggleReminder: (id: string) => void;
  deleteReminder: (id: string) => void;

  addBlogPost: (p: Omit<BlogPost, "id" | "published_at">) => void;
  updateBlogPost: (id: string, patch: Partial<BlogPost>) => void;
  deleteBlogPost: (id: string) => void;

  resetAll: () => void;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

const KEY = "camila_data_v1";

interface Persisted {
  announcements: Announcement[];
  events: EventItem[];
  reminders: Reminder[];
  blogPosts: BlogPost[];
  turmas: Turma[];
}

const initial = (): Persisted => ({
  announcements: seedAnnouncements,
  events: seedEvents,
  reminders: seedReminders,
  blogPosts: seedBlogPosts,
  turmas: seedTurmas,
});

const uid = (p: string) => `${p}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw) as Persisted;
    } catch {}
    return initial();
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state));
  }, [state]);

  const value: DataContextValue = {
    ...state,
    addAnnouncement: (a) =>
      setState((s) => ({
        ...s,
        announcements: [
          { ...a, id: uid("a"), created_at: new Date().toISOString(), unread: true },
          ...s.announcements,
        ],
      })),
    updateAnnouncement: (id, patch) =>
      setState((s) => ({
        ...s,
        announcements: s.announcements.map((x) => (x.id === id ? { ...x, ...patch } : x)),
      })),
    deleteAnnouncement: (id) =>
      setState((s) => ({ ...s, announcements: s.announcements.filter((x) => x.id !== id) })),

    addEvent: (e) =>
      setState((s) => ({ ...s, events: [...s.events, { ...e, id: uid("e") }] })),
    updateEvent: (id, patch) =>
      setState((s) => ({
        ...s,
        events: s.events.map((x) => (x.id === id ? { ...x, ...patch } : x)),
      })),
    deleteEvent: (id) =>
      setState((s) => ({ ...s, events: s.events.filter((x) => x.id !== id) })),

    addReminder: (r) =>
      setState((s) => ({
        ...s,
        reminders: [
          { ...r, id: uid("r"), created_at: new Date().toISOString(), done: false },
          ...s.reminders,
        ],
      })),
    updateReminder: (id, patch) =>
      setState((s) => ({
        ...s,
        reminders: s.reminders.map((x) => (x.id === id ? { ...x, ...patch } : x)),
      })),
    toggleReminder: (id) =>
      setState((s) => ({
        ...s,
        reminders: s.reminders.map((x) => (x.id === id ? { ...x, done: !x.done } : x)),
      })),
    deleteReminder: (id) =>
      setState((s) => ({ ...s, reminders: s.reminders.filter((x) => x.id !== id) })),

    addBlogPost: (p) =>
      setState((s) => ({
        ...s,
        blogPosts: [
          { ...p, id: uid("b"), published_at: new Date().toISOString().slice(0, 10) },
          ...s.blogPosts,
        ],
      })),
    updateBlogPost: (id, patch) =>
      setState((s) => ({
        ...s,
        blogPosts: s.blogPosts.map((x) => (x.id === id ? { ...x, ...patch } : x)),
      })),
    deleteBlogPost: (id) =>
      setState((s) => ({ ...s, blogPosts: s.blogPosts.filter((x) => x.id !== id) })),

    resetAll: () => {
      localStorage.removeItem(KEY);
      setState(initial());
    },
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}