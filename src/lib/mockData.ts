export type Role = "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";

export interface User {
  id: string;
  role: Role;
  name: string;
  email: string;
  avatar_url?: string;
  childrenIds?: string[];
  classIds?: string[];
}

export const users: User[] = [
  { id: "t1", role: "TEACHER", name: "Profa. Mariana Souza", email: "professor@ong.org", avatar_url: "", classIds: ["c1", "c2"] },
  { id: "s1", role: "STUDENT", name: "Lucas Oliveira", email: "aluno@ong.org", avatar_url: "", classIds: ["c1"] },
  { id: "s2", role: "STUDENT", name: "Beatriz Santos", email: "beatriz@ong.org", avatar_url: "", classIds: ["c1"] },
  { id: "s3", role: "STUDENT", name: "Pedro Almeida", email: "pedro@ong.org", avatar_url: "", classIds: ["c2"] },
  { id: "s4", role: "STUDENT", name: "Júlia Ferreira", email: "julia@ong.org", avatar_url: "", classIds: ["c2"] },
  { id: "s5", role: "STUDENT", name: "Gabriel Costa", email: "gabriel@ong.org", avatar_url: "", classIds: ["c1"] },
  { id: "p1", role: "PARENT", name: "Carla Oliveira", email: "responsavel@ong.org", avatar_url: "", childrenIds: ["s1", "s3"] },
  { id: "a1", role: "ADMIN", name: "Coordenação ONG", email: "admin@ong.org", avatar_url: "" },
  { id: "a2", role: "ADMIN", name: "Administração Camila", email: "admin@associacaocamila.br", avatar_url: "" },
];

export interface Turma {
  id: string;
  name: string;
  teacher_id: string;
  studentIds: string[];
}

export const turmas: Turma[] = [
  { id: "c1", name: "Turma Sementes — 4º Ano", teacher_id: "t1", studentIds: ["s1", "s2", "s5"] },
  { id: "c2", name: "Turma Girassóis — 5º Ano", teacher_id: "t1", studentIds: ["s3", "s4"] },
];

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
  { id: "a1", title: "Festa Junina da ONG", content: "Convidamos todas as famílias para nossa tradicional Festa Junina no próximo sábado, às 15h, no pátio da ONG. Teremos quadrilha, comidas típicas e muita diversão!", author: "Coordenação", target: "ALL", created_at: "2026-04-29T10:00:00", unread: true },
  { id: "a2", title: "Reunião de Pais e Responsáveis", content: "A reunião bimestral acontecerá na próxima quinta-feira, às 19h. Sua presença é fundamental para acompanharmos o desenvolvimento das crianças.", author: "Profa. Mariana", target: "PARENTS", created_at: "2026-04-28T14:30:00", unread: true },
  { id: "a3", title: "Novo material de leitura disponível", content: "A biblioteca recebeu novos livros infantojuvenis. Os alunos podem retirar exemplares durante o intervalo das aulas.", author: "Coordenação", target: "STUDENTS", created_at: "2026-04-25T09:00:00" },
  { id: "a4", title: "Capacitação de Educadores", content: "Lembrete: o curso de formação continuada acontece neste sábado, das 9h às 12h, online.", author: "Coordenação", target: "TEACHERS", created_at: "2026-04-22T11:00:00" },
];

export interface EventItem {
  id: string;
  title: string;
  date: string; // ISO YYYY-MM-DD
  description: string;
  class_id?: string;
}

export const events: EventItem[] = [
  { id: "e1", title: "Aula de Matemática", date: "2026-05-01", description: "Frações e operações básicas.", class_id: "c1" },
  { id: "e2", title: "Oficina de Arte", date: "2026-05-04", description: "Pintura com aquarela no pátio.", class_id: "c1" },
  { id: "e3", title: "Festa Junina", date: "2026-05-09", description: "Evento aberto a todas as famílias." },
  { id: "e4", title: "Reunião de Pais", date: "2026-05-07", description: "Reunião bimestral às 19h." },
  { id: "e5", title: "Aula de Ciências", date: "2026-05-02", description: "Sistema solar e exploração espacial.", class_id: "c2" },
  { id: "e6", title: "Passeio ao Museu", date: "2026-05-15", description: "Visita ao Museu de Ciências." },
];

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
    title: "Como a educação transforma comunidades",
    cover_image: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=800&auto=format&fit=crop",
    excerpt: "Conheça os impactos do nosso programa de alfabetização nos últimos 12 meses.",
    content: "Nos últimos 12 meses, nossa ONG alcançou mais de 300 crianças em situação de vulnerabilidade social. Através de programas de reforço escolar, oficinas culturais e apoio psicossocial, vimos transformações reais nas vidas dessas famílias. A taxa de aprovação escolar dos alunos atendidos subiu de 68% para 91%, e o engajamento das famílias na vida escolar dobrou. Esse é o poder da educação como ferramenta de transformação social.",
    author: "Equipe Pedagógica",
    published_at: "2026-04-20",
  },
  {
    id: "b2",
    title: "Voluntariado: como você pode ajudar",
    cover_image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&auto=format&fit=crop",
    excerpt: "Existem diversas formas de contribuir com nossa missão. Descubra a sua.",
    content: "Ser voluntário em nossa ONG significa fazer parte de uma rede de transformação. Você pode atuar como tutor de reforço escolar, oficineiro cultural, apoiador administrativo ou doador. Cada hora dedicada faz diferença na vida de uma criança.",
    author: "Coordenação",
    published_at: "2026-04-15",
  },
  {
    id: "b3",
    title: "Resultados do projeto de leitura 2025",
    cover_image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&auto=format&fit=crop",
    excerpt: "Nosso projeto Lendo o Mundo distribuiu mais de 2.000 livros este ano.",
    content: "O projeto Lendo o Mundo completou mais um ciclo com resultados expressivos. Foram 2.143 livros distribuídos, 18 escolas parceiras atendidas e 1.200 crianças impactadas diretamente. Agradecemos a todos os doadores e voluntários que tornaram isso possível.",
    author: "Equipe Pedagógica",
    published_at: "2026-04-08",
  },
  {
    id: "b4",
    title: "Oficinas de verão: inscrições abertas",
    cover_image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop",
    excerpt: "Música, teatro, esportes e tecnologia nas férias de julho.",
    content: "Estão abertas as inscrições para as oficinas de verão. Teremos atividades de música, teatro, capoeira, futebol e introdução à programação. As vagas são limitadas e prioritárias para alunos da rede atendida.",
    author: "Coordenação",
    published_at: "2026-04-01",
  },
];

export interface AttendanceEntry {
  student_id: string;
  status: "PRESENT" | "ABSENT" | "EXCUSED";
}

export const games = [
  { id: "g1", title: "Matemática Divertida", description: "Resolva desafios de soma e subtração", icon: "Calculator", color: "from-primary to-primary-glow" },
  { id: "g2", title: "Quiz de Ciências", description: "Teste seus conhecimentos sobre o mundo", icon: "FlaskConical", color: "from-secondary to-accent" },
  { id: "g3", title: "Caça-Palavras", description: "Encontre as palavras escondidas", icon: "BookOpen", color: "from-success to-primary" },
  { id: "g4", title: "Geografia do Brasil", description: "Conheça os estados e capitais", icon: "Map", color: "from-accent to-secondary" },
  { id: "g5", title: "Memória", description: "Treine sua memória com cartas", icon: "Brain", color: "from-primary-glow to-success" },
  { id: "g6", title: "Histórias Animadas", description: "Leia contos interativos", icon: "Sparkles", color: "from-secondary to-warning" },
];

export const quizQuestions = [
  { q: "Qual o maior planeta do Sistema Solar?", options: ["Terra", "Júpiter", "Marte", "Saturno"], answer: 1 },
  { q: "Quantos continentes existem?", options: ["5", "6", "7", "8"], answer: 1 },
  { q: "Qual a capital do Brasil?", options: ["Rio de Janeiro", "São Paulo", "Brasília", "Salvador"], answer: 2 },
];