import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type {
  Announcement,
  EventItem,
  BlogPost,
  Turma,
  User,
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

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  class_id: string;
  entries: { student_id: string; status: "PRESENT" | "ABSENT" | "EXCUSED" }[];
  saved_at: string;
  saved_by?: string;
}

export interface ReadStateMap {
  announcements: string[]; // ids read
}

const seedReminders: Reminder[] = [];

interface DataContextValue {
  announcements: Announcement[];
  events: EventItem[];
  reminders: Reminder[];
  blogPosts: BlogPost[];
  turmas: Turma[];
  students: User[];
  attendance: AttendanceRecord[];
  studentPoints: Record<string, number>;
  readAnnouncements: string[];

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

  addTurma: (t: Omit<Turma, "id" | "studentIds">) => void;
  updateTurma: (id: string, patch: Partial<Turma>) => void;
  deleteTurma: (id: string) => void;

  addStudent: (s: Omit<User, "id" | "role">) => void;
  updateStudent: (id: string, patch: Partial<User>) => void;
  deleteStudent: (id: string) => void;
  assignStudentToTurma: (studentId: string, turmaId: string) => void;
  removeStudentFromTurma: (studentId: string, turmaId: string) => void;
  
  linkChildToParent: (parentId: string, childEmail: string) => { success: boolean; error?: string };

  isOverdue: (r: Reminder) => boolean;
  daysOverdue: (r: Reminder) => number;

  saveAttendance: (
    record: Omit<AttendanceRecord, "id" | "saved_at">
  ) => void;
  getAttendanceFor: (date: string, class_id: string) => AttendanceRecord | undefined;
  studentFrequency: (studentId: string) => { rate: number; total: number; present: number };
  addStudentPoints: (studentId: string, delta: number) => void;
  markAnnouncementRead: (id: string) => void;
  markAllAnnouncementsRead: () => void;
  unreadAnnouncementsFor: (role?: string) => Announcement[];

  resetAll: () => void;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

const KEY = "conectaescola_local_state_v1";
const LEGACY_KEY = "camila_data_v3_clean";

interface Persisted {
  announcements: Announcement[];
  events: EventItem[];
  reminders: Reminder[];
  blogPosts: BlogPost[];
  turmas: Turma[];
  students: User[];
  attendance: AttendanceRecord[];
  studentPoints: Record<string, number>;
  readAnnouncements: string[];
}

const initial = (): Persisted => ({
  // Nenhum dado de demonstração é inicializado como se fosse dado real.
  announcements: [],
  events: [],
  reminders: seedReminders,
  blogPosts: [],
  turmas: [],
  students: [],
  attendance: [],
  studentPoints: {},
  readAnnouncements: [],
});

const uid = (p: string) => `${p}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>(() => {
    try {
      const raw = localStorage.getItem(KEY) || localStorage.getItem(LEGACY_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Persisted>;
        // Migra apenas lembretes locais. Anúncios, eventos, turmas, alunos e
        // presença do cache antigo eram dados de demonstração ou não sincronizados.
        return {
          ...initial(),
          reminders: Array.isArray(parsed.reminders) ? parsed.reminders : [],
        };
      }
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

    addTurma: (t) =>
      setState((s) => ({ ...s, turmas: [...s.turmas, { ...t, id: uid("c"), studentIds: [] }] })),
    updateTurma: (id, patch) =>
      setState((s) => ({
        ...s,
        turmas: s.turmas.map((x) => (x.id === id ? { ...x, ...patch } : x)),
      })),
    deleteTurma: (id) =>
      setState((s) => ({ ...s, turmas: s.turmas.filter((x) => x.id !== id) })),

    addStudent: (st) =>
      setState((s) => ({
        ...s,
        students: [...s.students, { ...st, id: uid("s"), role: "STUDENT" } as User],
      })),
    updateStudent: (id, patch) =>
      setState((s) => ({
        ...s,
        students: s.students.map((x) => (x.id === id ? { ...x, ...patch } : x)),
      })),
    deleteStudent: (id) =>
      setState((s) => ({
        ...s,
        students: s.students.filter((x) => x.id !== id),
        turmas: s.turmas.map((t) => ({ ...t, studentIds: t.studentIds.filter((sid) => sid !== id) })),
      })),
    assignStudentToTurma: (studentId, turmaId) =>
      setState((s) => ({
        ...s,
        turmas: s.turmas.map((t) =>
          t.id === turmaId
            ? { ...t, studentIds: t.studentIds.includes(studentId) ? t.studentIds : [...t.studentIds, studentId] }
            : t
        ),
      })),
    removeStudentFromTurma: (studentId, turmaId) =>
      setState((s) => ({
        ...s,
        turmas: s.turmas.map((t) =>
          t.id === turmaId ? { ...t, studentIds: t.studentIds.filter((sid) => sid !== studentId) } : t
        ),
      })),

    linkChildToParent: (_parentId, childEmail) => {
      const child = state.students.find((student) => student.email.toLowerCase() === childEmail.trim().toLowerCase());
      if (!child) return { success: false, error: "Aluno não encontrado com este e-mail." };

      // Não informe sucesso enquanto o vínculo não for gravado em uma tabela
      // de relacionamento persistente e validado por RLS no servidor.
      return {
        success: false,
        error: "O vínculo não foi salvo. A tabela de relacionamento entre responsáveis e alunos ainda não está configurada.",
      };
    },

    isOverdue: (r) => !r.done && r.due_date < new Date().toISOString().slice(0, 10),
    daysOverdue: (r) => {
      const today = new Date(); today.setHours(0,0,0,0);
      const due = new Date(r.due_date + "T00:00:00");
      return Math.max(0, Math.floor((today.getTime() - due.getTime()) / 86400000));
    },

    saveAttendance: (rec) =>
      setState((s) => {
        const others = s.attendance.filter(
          (a) => !(a.date === rec.date && a.class_id === rec.class_id)
        );
        return {
          ...s,
          attendance: [
            ...others,
            { ...rec, id: uid("at"), saved_at: new Date().toISOString() },
          ],
        };
      }),
    getAttendanceFor: (date, class_id) =>
      state.attendance.find((a) => a.date === date && a.class_id === class_id),
    studentFrequency: (studentId) => {
      const records = state.attendance.flatMap((a) =>
        a.entries.filter((e) => e.student_id === studentId)
      );
      const total = records.length;
      const present = records.filter((r) => r.status === "PRESENT" || r.status === "EXCUSED").length;
      const rate = total === 0 ? 0 : Math.round((present / total) * 100);
      return { rate, total, present };
    },
    addStudentPoints: (studentId, delta) =>
      setState((s) => ({
        ...s,
        studentPoints: { ...s.studentPoints, [studentId]: (s.studentPoints[studentId] || 0) + delta },
      })),
    markAnnouncementRead: (id) =>
      setState((s) => ({
        ...s,
        readAnnouncements: s.readAnnouncements.includes(id) ? s.readAnnouncements : [...s.readAnnouncements, id],
      })),
    markAllAnnouncementsRead: () =>
      setState((s) => ({
        ...s,
        readAnnouncements: Array.from(new Set([...s.readAnnouncements, ...s.announcements.map((a) => a.id)])),
      })),
    unreadAnnouncementsFor: (role) => {
      const aud = state.announcements.filter((a) => {
        if (a.target === "ALL") return true;
        if (role === "TEACHER" || role === "ADMIN") return a.target === "TEACHERS";
        if (role === "PARENT") return a.target === "PARENTS";
        if (role === "STUDENT") return a.target === "STUDENTS";
        return true;
      });
      return aud.filter((a) => !state.readAnnouncements.includes(a.id));
    },

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
