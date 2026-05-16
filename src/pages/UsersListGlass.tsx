import { useState } from "react";
import {
  GlassLayout,
  GlassContainer,
  GlassGrid,
  GlassSection,
  GlassEmptyState,
} from "@/components/GlassLayout";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import {
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profile: "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";
  status: "active" | "inactive" | "pending";
  joinDate: string;
  avatar?: string;
}

const mockUsers: User[] = [
  {
    id: "1",
    name: "João Silva",
    email: "joao@example.com",
    phone: "(11) 98765-4321",
    profile: "STUDENT",
    status: "active",
    joinDate: "2024-01-15",
  },
  {
    id: "2",
    name: "Maria Santos",
    email: "maria@example.com",
    phone: "(11) 98765-4322",
    profile: "TEACHER",
    status: "active",
    joinDate: "2024-02-10",
  },
  {
    id: "3",
    name: "Pedro Costa",
    email: "pedro@example.com",
    phone: "(11) 98765-4323",
    profile: "PARENT",
    status: "active",
    joinDate: "2024-03-05",
  },
  {
    id: "4",
    name: "Ana Oliveira",
    email: "ana@example.com",
    phone: "(11) 98765-4324",
    profile: "ADMIN",
    status: "active",
    joinDate: "2024-01-01",
  },
];

export function UsersListGlassPage() {
  const { user: currentUser } = useSupabaseAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [profileFilter, setProfileFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

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
    { label: "Segurança", href: "/admin/security", icon: "🔒" },
  ];

  const profileColors = {
    ADMIN: "bg-purple-100 text-purple-700",
    TEACHER: "bg-blue-100 text-blue-700",
    STUDENT: "bg-green-100 text-green-700",
    PARENT: "bg-orange-100 text-orange-700",
  };

  const statusColors = {
    active: "bg-green-100 text-green-700",
    inactive: "bg-gray-100 text-gray-700",
    pending: "bg-yellow-100 text-yellow-700",
  };

  const profileLabels = {
    ADMIN: "Administrador",
    TEACHER: "Professor",
    STUDENT: "Aluno",
    PARENT: "Responsável",
  };

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesProfile =
      profileFilter === "all" || user.profile === profileFilter;
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;

    return matchesSearch && matchesProfile && matchesStatus;
  });

  return (
    <GlassLayout
      sidebarItems={sidebarItems}
      topBarTitle="Usuários"
      topBarUser={
        currentUser
          ? {
              name: currentUser.full_name || "Usuário",
              email: currentUser.email || "",
            }
          : undefined
      }
      showSearch={true}
      onSearch={setSearchQuery}
    >
      <GlassContainer>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Users className="w-8 h-8 text-primary" />
              Gerenciamento de Usuários
            </h1>
            <p className="text-muted-foreground mt-2">
              Total: {filteredUsers.length} usuários
            </p>
          </div>
          <Button className="gap-2 rounded-lg">
            <Plus className="w-4 h-4" />
            Novo Usuário
          </Button>
        </div>

        {/* Filters */}
        <GlassCard className="p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground">
                Buscar
              </label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Nome ou e-mail..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">
                Perfil
              </label>
              <Select value={profileFilter} onValueChange={setProfileFilter}>
                <SelectTrigger className="mt-2 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                  <SelectItem value="TEACHER">Professor</SelectItem>
                  <SelectItem value="STUDENT">Aluno</SelectItem>
                  <SelectItem value="PARENT">Responsável</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">
                Status
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="mt-2 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </GlassCard>

        {/* Users Grid */}
        <GlassSection title="Lista de Usuários">
          {filteredUsers.length === 0 ? (
            <GlassEmptyState
              icon="👤"
              title="Nenhum usuário encontrado"
              description="Tente ajustar seus filtros ou criar um novo usuário"
              action={
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Novo Usuário
                </Button>
              }
            />
          ) : (
            <GlassGrid cols={1} gap="medium">
              {filteredUsers.map((user) => (
                <GlassCard key={user.id} className="p-6 hover:shadow-soft-xl">
                  <div className="flex items-start justify-between gap-4">
                    {/* User Info */}
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-14 h-14 rounded-lg bg-gradient-primary flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                        {user.name.charAt(0).toUpperCase()}
                      </div>

                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground">
                          {user.name}
                        </h3>

                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              {user.phone}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-3">
                          <span
                            className={`text-xs px-3 py-1 rounded-full font-medium ${
                              profileColors[user.profile]
                            }`}
                          >
                            {profileLabels[user.profile]}
                          </span>
                          <span
                            className={`text-xs px-3 py-1 rounded-full font-medium ${
                              statusColors[user.status]
                            }`}
                          >
                            {user.status === "active"
                              ? "Ativo"
                              : user.status === "inactive"
                                ? "Inativo"
                                : "Pendente"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Desde {new Date(user.joinDate).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg"
                        title="Visualizar"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg text-destructive hover:text-destructive"
                        title="Deletar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </GlassGrid>
          )}
        </GlassSection>
      </GlassContainer>
    </GlassLayout>
  );
}
