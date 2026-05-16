import {
  GlassLayout,
  GlassContainer,
} from "@/components/GlassLayout";
import { ColorPalette } from "@/components/ColorPalette";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Palette } from "lucide-react";

export function ColorPalettePageGlass() {
  const { user: currentUser } = useSupabaseAuth();

  const sidebarItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: "📊" },
    { label: "Usuários", href: "/admin/users", icon: "👥" },
    { label: "Presença", href: "/admin/attendance", icon: "✓" },
    { label: "Benefícios", href: "/admin/benefits", icon: "🎁" },
    { label: "Comunicações", href: "/admin/communications", icon: "💬" },
    { label: "Calendário", href: "/admin/calendar", icon: "📅" },
    { label: "Documentos", href: "/admin/scanning", icon: "📄" },
    { label: "Relatórios", href: "/admin/reports", icon: "📈" },
    { divider: true },
    { label: "Paleta de Cores", href: "/admin/colors", icon: "🎨" },
    { label: "Segurança", href: "/admin/security", icon: "🔒" },
  ];

  return (
    <GlassLayout
      sidebarItems={sidebarItems}
      topBarTitle="Paleta de Cores"
      topBarUser={
        currentUser
          ? {
              name: currentUser.full_name || "Usuário",
              email: currentUser.email || "",
            }
          : undefined
      }
      showSearch={false}
    >
      <GlassContainer>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-brand rounded-xl">
              <Palette className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Paleta de Cores Institucional
              </h1>
              <p className="text-muted-foreground mt-1">
                Cores da Associação Camila - Em Defesa e Valorização da Vida
              </p>
            </div>
          </div>
        </div>

        {/* Color Palette Component */}
        <ColorPalette />
      </GlassContainer>
    </GlassLayout>
  );
}
