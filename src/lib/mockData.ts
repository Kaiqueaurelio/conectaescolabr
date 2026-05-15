export type Role = "ADMIN" | "TEACHER" | "STUDENT" | "PARENT" | "VOLUNTEER";

export interface User {
  id: string;
  role: Role;
  name: string;
  email: string;
  avatar_url?: string;
  childrenIds?: string[];
  classIds?: string[];
  status: "PENDING" | "APPROVED" | "REJECTED";
}

export const users: User[] = [
  { id: "a1", role: "ADMIN", name: "Coordenação da ONG", email: "admin@ong.org", avatar_url: "", status: "APPROVED" },
  { id: "a2", role: "ADMIN", name: "Administração da Associação Camila", email: "admin@associacaocamila.br", avatar_url: "", status: "APPROVED" },
  { id: "t1", role: "TEACHER", name: "Professor(a)", email: "professor@ong.org", avatar_url: "", classIds: [], status: "APPROVED" },
];

export interface Turma {
  id: string;
  name: string;
  teacher_id: string;
  studentIds: string[];
}

export const turmas: Turma[] = [];

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  target: "ALL" | "TEACHERS" | "PARENTS" | "STUDENTS";
  created_at: string;
  unread?: boolean;
}

export const announcements: Announcement[] = [
  { id: "a1", title: "Bem-vindos ao novo aplicativo!", content: "Este é o novo canal de comunicação da Associação Camila. Fiquem atentos aos comunicados e eventos.", author: "Coordenação", target: "ALL", created_at: new Date().toISOString(), unread: true },
];

export interface EventItem {
  id: string;
  title: string;
  date: string; // ISO YYYY-MM-DD
  description: string;
  class_id?: string;
}

export const events: EventItem[] = [];

export interface BlogPost {
  id: string;
  title: string;
  cover_image: string;
  excerpt: string;
  content: string;
  author: string;
  published_at: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: "b1",
    title: "Associação Camila: Transformando Vidas",
    cover_image: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=800&auto=format&fit=crop",
    excerpt: "Conheça nossa missão e como trabalhamos para fortalecer os vínculos familiares.",
    content: "A Associação Camila atua em Osasco-SP, promovendo direitos sociais, cultura de paz e o fortalecimento de vínculos familiares. Este é o aplicativo oficial que conecta a ONG, suas crianças, famílias, educadores e voluntários em um único lugar.",
    author: "Coordenação",
    published_at: new Date().toISOString().split('T')[0],
  },
];

export interface AttendanceEntry {
  student_id: string;
  status: "PRESENT" | "ABSENT" | "EXCUSED";
}

export const games = [
  { id: "g1", title: "Matemática Divertida", description: "Resolva desafios de soma e subtração.", icon: "Calculator", color: "from-primary to-primary-glow" },
  { id: "g2", title: "Quiz de Ciências", description: "Teste seus conhecimentos sobre o mundo.", icon: "FlaskConical", color: "from-secondary to-accent" },
  { id: "g3", title: "Caça-Palavras", description: "Encontre as palavras escondidas.", icon: "BookOpen", color: "from-success to-primary" },
  { id: "g4", title: "Geografia do Brasil", description: "Conheça os estados e capitais.", icon: "Map", color: "from-accent to-secondary" },
  { id: "g5", title: "Memória", description: "Treine sua memória com cartas.", icon: "Brain", color: "from-primary-glow to-success" },
  { id: "g6", title: "Histórias Animadas", description: "Leia contos interativos.", icon: "Sparkles", color: "from-secondary to-warning" },
];

export const quizQuestions = [
  { q: "Qual é o maior planeta do Sistema Solar?", options: ["Terra", "Júpiter", "Marte", "Saturno"], answer: 1 },
  { q: "Quantos continentes existem?", options: ["5", "6", "7", "8"], answer: 1 },
  { q: "Qual é a capital do Brasil?", options: ["Rio de Janeiro", "São Paulo", "Brasília", "Salvador"], answer: 2 },
];
