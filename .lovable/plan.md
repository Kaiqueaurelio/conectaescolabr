## Objetivo

Duas frentes em paralelo:

1. **Landing page** — adicionar mais conteúdo institucional retirado do site oficial da Associação Camila (`associacaocamila.org.br`) e dar mais densidade à página.
2. **App** — promover **Cadastro Geral**, **Chamada** e **Agenda** como funcionalidades prioritárias, com fluxo unificado e atalhos em destaque nos dashboards.

---

## 1. Landing page — mais conteúdo da ONG

Editar `src/pages/Index.tsx` (e ajustes pequenos em `src/index.css` se necessário) para incluir:

**Conteúdo institucional oficial** (textos extraídos do site da ONG):
- **Missão**: "Atuar na defesa dos direitos sociais, desenvolvendo processos educativos que incorporem a cultura da não violência entre as crianças, jovens, grupo familiar e a comunidade; e defender os princípios da ética, liberdade, democracia, equidade e cidadania."
- **Visão**: "Tornar-se uma associação com efetiva influência no fortalecimento das ações entre o público jovem, com uma integração entre educação, tecnologia, cidadania e empreendedorismo, com vistas à transformação da realidade."
- **Filosofia** (nova seção): texto completo do site sobre reconhecimento do outro, potencial humano e cultura de paz.

**Novas seções a adicionar:**
- **"Nossa história"** — linha do tempo: 1997 (origem após a perda da Camila) → 2001 (fundação oficial) → hoje (24+ anos atuando em Osasco).
- **"Projetos em andamento / em parceria / realizados"** — três cards com links para a versão do site oficial, espelhando a estrutura `/em-andamento`, `/em-parceria`, `/projetos-realizados-2`.
- **"Como apoiar"** ampliada — destaque para CTA de doação (link `doe-hoje-transforme-vidas-todos-os-dias`), além de voluntariado, doação de alimentos/roupas e cadastro de nota fiscal (já existe, ampliar texto).
- **Contato** — bloco com telefone `(11) 3592-0330`, endereço Osasco/SP, link para site oficial e botão "Doar agora" levando ao site oficial.
- **FAQ curto** (4–5 perguntas): "Quem pode se cadastrar?", "Como funciona a chamada?", "Como matriculo minha filha?", "Posso ser voluntário?".

**Polimento visual:**
- Manter paleta do logo (verde/laranja/azul/coral) já implementada.
- Adicionar uma seção de "depoimento" estilizada com foto/avatar.
- Garantir SEO: title, meta description, JSON-LD `NGO` com nome, endereço, telefone, fundação 2001.

---

## 2. App — Cadastro Geral, Chamada e Agenda como prioridade

### 2.1 Estrutura "Cadastro Geral"

Hoje existem páginas separadas (`UsersList`, `Turmas`, `Attendance`, `Agenda`). Vamos agrupar tudo sob um conceito único de **Cadastro Geral** com sub-seções, conforme pedido:

```text
Cadastro Geral
 ├─ Pessoas (alunas, responsáveis, professores, voluntários)
 ├─ Turmas
 ├─ Chamada
 └─ Agenda
```

Criar nova página `src/pages/CadastroGeral.tsx` como **hub** com 4 cards grandes apontando para cada sub-seção, em destaque na home dos perfis Admin e Professor.

### 2.2 Chamada (Attendance)

Já existe `src/pages/Attendance.tsx` e `AttendanceAdvanced.tsx`. Vamos:
- Consolidar em uma rota canônica `/chamada` apontando para a melhor versão.
- Garantir fluxo: selecionar turma → ver lista de alunas → marcar presença/falta/justificada → salvar.
- Indicador visual de "Chamada de hoje feita?" no dashboard do Professor.
- Histórico simples por turma (últimas 7 chamadas).

### 2.3 Agenda

Já existe `src/pages/Agenda.tsx` (visual de calendário) e `SmartCalendar.tsx`. Vamos:
- Promover `/agenda` como rota canônica, com botão "Novo evento" para Admin/Professor.
- Filtros por turma e por tipo (aula, reunião, evento, feriado).
- Exibir próximos 3 eventos como widget nos dashboards.

### 2.4 Navegação prioritária

- **BottomNav** (mobile): trocar para 4 itens fixos: **Início**, **Cadastro**, **Chamada**, **Agenda** + menu "Mais".
- **RoleSidebar** (desktop): mover Cadastro Geral / Chamada / Agenda para o topo, com ícones destacados em cor da ONG.
- **Dashboards** (Admin e Professor): linha de "Acesso rápido" com 3 botões grandes para essas 3 funções.

---

## 3. Arquivos afetados

**Novos:**
- `src/pages/CadastroGeral.tsx` (hub das sub-seções)
- `src/components/landing/Timeline.tsx` (linha do tempo da ONG)
- `src/components/landing/FAQ.tsx`
- `src/components/landing/ContactBlock.tsx`

**Editar:**
- `src/pages/Index.tsx` — novas seções, conteúdo institucional, SEO, CTA doação.
- `src/App.tsx` — rota `/cadastro` e `/chamada`.
- `src/components/BottomNav.tsx` — nova ordem prioritária.
- `src/components/dashboard/RoleSidebar.tsx` — reordenação.
- `src/pages/AdminDashboardGlass.tsx` e `src/pages/TeacherDashboard.tsx` — bloco "Acesso rápido" no topo + widget "Próximos eventos" e "Chamada hoje".
- `src/pages/Attendance.tsx` / `Agenda.tsx` — pequenos ajustes de header e CTAs.
- `index.html` — meta tags atualizadas.

---

## Fora do escopo

- Não vou mexer em autenticação, RLS ou estrutura de tabelas neste passo (já existem da etapa anterior).
- Não vou refazer o módulo de benefícios/relatórios.
- Sem upload de imagens novas — uso ícones e o `heroImg` atual.

---

## Perguntas rápidas antes de implementar

1. **Hub de Cadastro Geral**: quer que ele substitua o atual `/admin/users` (vira `/cadastro/pessoas`) ou mantenho ambos coexistindo durante a transição?
2. **CTA de doação na landing**: o botão "Doar agora" deve abrir o site da ONG em nova aba (`/doe-hoje-transforme-vidas-todos-os-dias`) ou abrir um modal interno explicando como doar?
3. **Chamada**: prefere a versão `Attendance` simples (lista com checkboxes) ou a `AttendanceAdvanced` (com QR code) como padrão na rota `/chamada`?

Se quiser que eu siga sem responder, assumo: (1) coexistir, (2) abrir site oficial em nova aba, (3) versão simples como padrão e link para "modo avançado/QR".
