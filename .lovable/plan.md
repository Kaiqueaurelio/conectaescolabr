## Objetivo

Transformar o app de "protótipo" em um produto consistente para apresentar à Associação Camila: dashboards mais ricos, CRUD completo (com edição), busca/filtros, destaque de lembretes atrasados, gestão real de turmas e alunas, e tela de login limpa (sem credenciais expostas).

---

## 1. Login — remover credenciais demo

`src/pages/Login.tsx`:
- Remover totalmente o card "CONTAS DE DEMONSTRAÇÃO" e o array `demoAccounts`.
- Manter apenas formulário de e-mail/senha + link sutil "Esqueci minha senha" (apenas visual, abre toast informando o caminho de contato).
- Redesign do painel esquerdo: logo grande, headline, depoimento curto, e três pílulas de propostas de valor ("Comunicação", "Acompanhamento", "Engajamento").
- Adicionar rodapé com `© Associação Camila` e link para o blog público.

Documentação interna das credenciais demo migra para um arquivo `CREDENCIAIS_DEMO.md` (não exibido na UI), para o cliente testar.

---

## 2. Novo Dashboard do Admin

Reescrever `src/pages/AdminDashboard.tsx` em duas seções: **Visão Geral** (nova) + **Gestão** (abas atuais melhoradas).

**Visão Geral (acima das tabs):**
- Hero com saudação dinâmica (Bom dia/tarde/noite), data por extenso e badge "Administração".
- Grid 2x2 (mobile) / 4 colunas (desktop) de KPI cards com ícone, número grande, label e variação (ex.: "3 novos esta semana"):
  - Comunicados ativos
  - Eventos próximos (próximos 14 dias)
  - Lembretes atrasados (destaque vermelho se > 0)
  - Alunas ativas
- Card "Próximos eventos" (lista compacta dos 3 mais próximos, com data formatada `qua, 07 mai`).
- Card "Lembretes urgentes" (atrasados + alta prioridade, top 4, com link para a aba).
- Card "Atividade recente" (timeline dos últimos 5 itens criados em qualquer entidade).
- Card "Distribuição por turma" (barras horizontais simples mostrando nº de alunas por turma).

**Gestão (tabs existentes, melhoradas):** ver seções abaixo.

Mesma estrutura de Visão Geral será reaproveitada (versão reduzida) em `TeacherDashboard`, `ParentDashboard` e `StudentDashboard` para dar consistência visual ao app.

---

## 3. Edição completa (CRUD) em todas as entidades

Hoje só existe criar + apagar. Adicionar **editar** para Comunicados, Eventos, Lembretes, Posts do Blog e Alunas/Turmas.

Padrão único: botão lápis no card abre um `Dialog` com o mesmo formulário de criação, pré-preenchido. Ao salvar chama o `update*` já existente no `DataContext` (apenas Reminder e Blog/Event/Announcement já têm update — bom).

Componente novo reutilizável `src/components/admin/EntityCard.tsx` com slots: ícone, título, metadados, ações (editar/apagar) — para padronizar visual nas 5 abas.

---

## 4. Filtros de busca

Adicionar em cada aba de Gestão um cabeçalho com:
- `Input` de busca (filtra por título/descrição, debounce 200ms).
- `Select` de filtro contextual:
  - Comunicados/Lembretes: por destinatário (ALL/TEACHERS/PARENTS/STUDENTS).
  - Eventos: por turma + alternância "Próximos / Passados / Todos".
  - Lembretes: também por status (Pendentes/Concluídos/Atrasados) e prioridade.
  - Blog: por autor.
  - Turmas: por turma para filtrar a lista de alunas.
- Contador "X de Y" e botão "Limpar filtros".

Mesma barra de busca na tela pública `Reminders.tsx` e `Announcements.tsx`.

---

## 5. Lembretes atrasados

Em `DataContext`, adicionar helper `isOverdue(r)` (`!r.done && r.due_date < hoje`).

Em `Reminders.tsx` e na lista do Admin:
- Seção destacada no topo "Atrasados (N)" com fundo `bg-destructive/10`, borda vermelha e ícone `AlertTriangle`.
- Badge "Atrasado há X dias" no card.
- No `BottomNav`, badge numérico vermelho no ícone Lembretes quando houver atrasados para o papel do usuário.
- Notificação `sonner` ao logar se houver lembretes atrasados ("Você tem 2 lembretes atrasados").

---

## 6. Gestão de Turmas e Alunas (publicar)

A aba "Turmas" hoje é só visualização. Substituir por CRUD real:

Estender `DataContext` com:
- `addTurma`, `updateTurma`, `deleteTurma`.
- `addStudent`, `updateStudent`, `deleteStudent` (atuando sobre `users` filtrando por `role==="STUDENT"`, com lista persistida em `localStorage`).
- `assignStudentToTurma(studentId, turmaId)` / `removeStudentFromTurma`.

Nova UI em duas colunas (stack no mobile):
- **Esquerda — Turmas:** lista de turmas com nº de alunas, botão "Nova turma" (nome + professor responsável via Select dos teachers existentes), editar e apagar.
- **Direita — Alunas:** ao selecionar uma turma, mostra alunas matriculadas + botão "Adicionar aluna" (modal com nome, e-mail, responsável opcional). Permite remover e editar dados da aluna.
- Drag-and-drop simples (ou Select) para mover aluna entre turmas.

Tela pública nova `src/pages/Turmas.tsx` (acessível a Professor e Admin) listando turmas em cards com avatar das alunas — dá a sensação de "publicado".

---

## 7. Polimento visual geral

`src/index.css` e componentes:
- Cards com sombra `shadow-elevated` mais sutil + `rounded-2xl` consistente.
- Tipografia: títulos `font-semibold tracking-tight`, hierarquia clara (h1 28px / h2 20px / h3 16px).
- Espaçamento consistente (gap-4 padrão, py-6 entre seções).
- Adicionar `Skeleton` loaders nos dashboards enquanto `useData` hidrata do localStorage.
- Estado vazio com ilustração SVG simples + CTA em todas as listas (reaproveitar `EmptyState`).
- Animações `animate-fade-in` nos cards, transições suaves nos hovers.
- Revisar contraste das badges de prioridade (coral/secondary/tertiary) para WCAG AA.

---

## 8. Estrutura técnica resumida

Arquivos a criar:
- `src/components/admin/EntityCard.tsx`
- `src/components/admin/SearchBar.tsx`
- `src/components/admin/EditDialog.tsx`
- `src/components/dashboard/StatCard.tsx`
- `src/components/dashboard/ActivityTimeline.tsx`
- `src/pages/Turmas.tsx`
- `CREDENCIAIS_DEMO.md`

Arquivos a editar:
- `src/pages/Login.tsx` (remover demo)
- `src/pages/AdminDashboard.tsx` (visão geral + edição + filtros + turmas/alunas)
- `src/pages/Reminders.tsx` (atrasados + filtros)
- `src/pages/Announcements.tsx` (filtros)
- `src/pages/TeacherDashboard.tsx`, `StudentDashboard.tsx`, `ParentDashboard.tsx` (visual consistente)
- `src/contexts/DataContext.tsx` (CRUD turmas/alunas, helper overdue)
- `src/components/BottomNav.tsx` (badge atrasados)
- `src/App.tsx` (rota `/turmas`)
- `src/index.css` (ajustes finos)

---

## Fora do escopo desta etapa

- Backend real / autenticação Supabase (continua mock com localStorage).
- Upload de imagens (mantém URL).
- Notificações push.

Posso seguir? Se quiser, ajusto pontos específicos antes (ex.: priorizar só dashboard + login, deixar turmas para depois).