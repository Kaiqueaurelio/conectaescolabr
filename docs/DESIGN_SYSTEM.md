# Design System - ONG Camila

## Visão Geral

O design system da ONG Camila foi desenvolvido para criar uma experiência moderna, intuitiva, minimalista e acolhedora. A paleta de cores institucional reflete os valores da organização: verde (esperança, crescimento) e laranja (energia, otimismo).

## Paleta de Cores

### Cores Primárias

| Nome | HSL | Uso |
|------|-----|-----|
| Verde Institucional | `158 75% 30%` | Botões primários, links, elementos principais |
| Laranja Institucional | `28 90% 55%` | Destaques, chamadas à ação secundárias |
| Azul | `210 75% 45%` | Informações, elementos terciários |
| Vermelho-Coral | `5 75% 52%` | Alertas, erros, ações destrutivas |

### Cores Secundárias

| Nome | HSL | Uso |
|------|-----|-----|
| Verde Claro (Glow) | `152 60% 45%` | Hover, focus states |
| Fundo | `40 33% 98%` | Fundo da aplicação |
| Card | `0 0% 100%` | Cards, modais, popups |
| Muted | `150 15% 95%` | Backgrounds secundários |
| Foreground | `200 25% 18%` | Texto principal |
| Muted Foreground | `200 12% 42%` | Texto secundário |

## Tipografia

- **Font Family**: Sistema padrão do navegador (sans-serif)
- **Tamanhos**:
  - H1: 32px (2rem), font-weight: 700
  - H2: 24px (1.5rem), font-weight: 700
  - H3: 20px (1.25rem), font-weight: 600
  - Body: 16px (1rem), font-weight: 400
  - Small: 14px (0.875rem), font-weight: 400
  - Tiny: 12px (0.75rem), font-weight: 500

## Espaçamento

Utilizamos um sistema de espaçamento baseado em múltiplos de 4px:

- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px

## Componentes

### Buttons

Botões seguem o padrão de design moderno com bordas suaves:

```tsx
<Button variant="primary">Ação Primária</Button>
<Button variant="secondary">Ação Secundária</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
```

### Cards

Cards utilizam sombras suaves e bordas discretas:

```tsx
<ModernCard>
  <h3>Título do Card</h3>
  <p>Conteúdo do card</p>
</ModernCard>
```

### Badges

Badges para status, tags e indicadores:

```tsx
<ModernBadge variant="primary">Ativo</ModernBadge>
<ModernBadge variant="success">Aprovado</ModernBadge>
<ModernBadge variant="warning">Pendente</ModernBadge>
<ModernBadge variant="destructive">Rejeitado</ModernBadge>
```

### Stat Cards

Cards para exibir estatísticas com ícones e trends:

```tsx
<StatCard
  label="Usuários Ativos"
  value={1234}
  icon={<Users />}
  trend="up"
  trendValue="+12%"
  color="primary"
/>
```

## Gradientes

| Nome | Uso |
|------|-----|
| `gradient-primary` | Fundo de elementos primários |
| `gradient-warm` | Fundo de elementos secundários (laranja) |
| `gradient-hero` | Fundo de hero sections |
| `gradient-card` | Fundo de cards especiais |
| `gradient-brand` | Fundo de branding |

## Sombras

| Nome | Uso |
|------|-----|
| `shadow-soft` | Sombra leve para cards |
| `shadow-elevated` | Sombra média para elementos elevados |
| `shadow-floating` | Sombra forte para elementos flutuantes |
| `shadow-warm` | Sombra com cor laranja |

## Animações

- `fade-in`: Fade in suave (0.6s)
- `fade-in-up`: Fade in com movimento para cima (0.7s)
- `scale-in`: Scale in suave (0.5s)
- `slide-in-right`: Slide in da direita (0.6s)
- `blob`: Animação blob infinita (14s)
- `float`: Animação flutuante (4s)

## Responsividade

Breakpoints:
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

Componentes utilizam classes Tailwind para responsividade:
- `md:` para tablets
- `lg:` para desktops

## Estados de Interação

### Hover
- Botões: `hover:scale-[1.03]` com sombra elevada
- Links: Underline animado
- Cards: `hover-lift` com sombra flutuante

### Focus
- Outline com cor primária
- Transição suave

### Disabled
- Opacity reduzida (0.5)
- Cursor not-allowed

## Acessibilidade

- Contraste mínimo de 4.5:1 para texto
- Suporte a modo escuro
- Animações respeitam `prefers-reduced-motion`
- Ícones acompanhados de texto ou aria-labels
- Navegação por teclado completa

## Exemplo de Uso

```tsx
import { ModernLayout, ModernCard, ModernGrid, StatCard } from "@/components/ModernLayout";
import { ModernTopBar } from "@/components/ModernTopBar";
import { ModernSidebar } from "@/components/ModernSidebar";

export function Dashboard() {
  return (
    <ModernLayout>
      <ModernSidebar items={sidebarItems} logo={<Logo />} />
      <div className="lg:ml-64">
        <ModernTopBar title="Dashboard" user={currentUser} />
        <div className="p-6">
          <ModernGrid cols={3}>
            <StatCard label="Usuários" value={1234} color="primary" />
            <StatCard label="Projetos" value={45} color="secondary" />
            <StatCard label="Eventos" value={12} color="success" />
          </ModernGrid>
        </div>
      </div>
    </ModernLayout>
  );
}
```

## Cores em Modo Escuro

O design system suporta modo escuro com cores otimizadas para legibilidade e conforto visual:

- Fundo escuro: `158 35% 8%`
- Foreground claro: `40 30% 96%`
- Cores primárias mais brilhantes para contraste
