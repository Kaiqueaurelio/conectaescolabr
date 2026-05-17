import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ModernLayout, ModernCard, ModernGrid, ModernEmptyState } from "@/components/ModernLayout";
import { ModernTopBar, ModernPageHeader } from "@/components/ModernTopBar";
import { ModernSidebar } from "@/components/ModernSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUsers } from "@/hooks/useSupabaseData";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { UserProfile } from "@/lib/supabase";
import { getRoleLabel, getStatusLabel } from "@/lib/permissions";
import { Users, Plus, Search, Filter, Mail, Phone, MapPin, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModernBadge } from "@/components/ModernLayout";

export function UsersListPage() {
  const navigate = useNavigate();
  const { user: currentUser } = useSupabaseAuth();
  const { users, loading } = useUsers();

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.cpf && user.cpf.includes(searchQuery));

      const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
      const matchesStatus = statusFilter === "ALL" || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  const getStatusIcon = (status: UserProfile["status"]) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="w-5 h-5 text-success" />;
      case "PENDING":
        return <AlertCircle className="w-5 h-5 text-warning" />;
      case "REJECTED":
        return <XCircle className="w-5 h-5 text-destructive" />;
    }
  };

  const sidebarItems = [
    { label: "Dashboard", href: "/admin", icon: "📊" },
    { label: "Usuários", href: "/admin/users", icon: "👥" },
    { label: "Presença", href: "/admin/attendance", icon: "✓" },
    { label: "Benefícios", href: "/admin/benefits", icon: "🎁" },
  ];

  return (
    <ModernLayout>
      <ModernSidebar items={sidebarItems} />
      <div className="lg:ml-64">
        <ModernTopBar
          title="Gerenciamento de Usuários"
          user={currentUser ? { name: currentUser.full_name, email: currentUser.email } : undefined}
        />

        <div className="p-6">
          <ModernPageHeader
            title="Usuários"
            description="Gerencie todos os usuários da plataforma"
            icon={<Users />}
            action={
              <Button onClick={() => navigate("/admin/users/new")}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Usuário
              </Button>
            }
          />

          {/* Filtros */}
          <ModernCard className="p-6 mb-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-semibold">Filtros</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Buscar
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Nome, e-mail ou CPF"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Perfil
                  </label>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Todos</SelectItem>
                      <SelectItem value="ADMIN">Administrador</SelectItem>
                      <SelectItem value="TEACHER">Professor</SelectItem>
                      <SelectItem value="STUDENT">Aluno</SelectItem>
                      <SelectItem value="PARENT">Responsável</SelectItem>
                      <SelectItem value="VOLUNTEER">Voluntário</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Status
                  </label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Todos</SelectItem>
                      <SelectItem value="APPROVED">Aprovado</SelectItem>
                      <SelectItem value="PENDING">Pendente</SelectItem>
                      <SelectItem value="REJECTED">Rejeitado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                Mostrando {filteredUsers.length} de {users.length} usuários
              </div>
            </div>
          </ModernCard>

          {/* Lista de Usuários */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Carregando usuários...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <ModernEmptyState
              icon={<Users />}
              title="Nenhum usuário encontrado"
              description="Tente ajustar seus filtros ou criar um novo usuário"
              action={
                <Button onClick={() => navigate("/admin/users/new")}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Novo Usuário
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => navigate(`/admin/users/${user.id}`)}
                >
                <ModernCard className="p-4 hover-lift cursor-pointer">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <Avatar className="w-12 h-12 flex-shrink-0">
                        {user.avatar_url && <AvatarImage src={user.avatar_url} alt={user.full_name} />}
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {user.full_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{user.full_name}</h3>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground flex-wrap">
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            <span className="truncate">{user.email}</span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <ModernBadge variant="muted" size="sm">
                          {getRoleLabel(user.role)}
                        </ModernBadge>
                        <div className="flex items-center justify-end gap-1 mt-2">
                          {getStatusIcon(user.status)}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/users/${user.id}`);
                        }}
                      >
                        Ver
                      </Button>
                    </div>
                  </div>
                </ModernCard>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ModernLayout>
  );
}
