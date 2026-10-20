import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { useUsers } from "@/hooks/useSupabaseData";
import { supabase, UserProfile } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import {
  Users,
  Search,
  Info,
  Edit,
  Ban,
  CheckCircle,
  Eye,
  Mail,
  Phone,
} from "lucide-react";

export function UsersListGlassPage() {
  const navigate = useNavigate();
  const { user: currentUser, setUserStatus } = useSupabaseAuth();
  const { users, loading, error, refetch } = useUsers();
  const [searchQuery, setSearchQuery] = useState("");
  const [profileFilter, setProfileFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  const handleStatusChange = async (user: UserProfile, status: "APPROVED" | "REJECTED") => {
    if (user.id === currentUser?.id) {
      toast({ title: "Não é possível alterar o status da própria conta." });
      return;
    }
    if (status === "APPROVED" && user.role === "VOLUNTEER") {
      toast({
        title: "Perfil indisponível",
        description: "A área de acesso de voluntários ainda não está implementada; essa conta não pode ser aprovada.",
      });
      return;
    }
    if (status === "REJECTED" && !window.confirm(`Rejeitar o cadastro de ${user.full_name || user.email}? Os dados serão preservados.`)) return;

    const result = await setUserStatus(user.id, status);
    if (!result.success) {
      toast({ title: "Não foi possível alterar o status", description: result.error });
      return;
    }
    toast({ title: status === "APPROVED" ? "Conta aprovada" : "Cadastro rejeitado" });
    await refetch();
  };

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

  const profileColors: Record<UserProfile["role"], string> = {
    ADMIN: "bg-primary/10 text-primary",
    TEACHER: "bg-secondary text-secondary-foreground",
    STUDENT: "bg-accent text-accent-foreground",
    PARENT: "bg-muted text-muted-foreground",
    VOLUNTEER: "bg-card text-card-foreground",
  };

  const statusColors: Record<UserProfile["status"], string> = {
    APPROVED: "bg-primary/10 text-primary",
    PENDING: "bg-muted text-muted-foreground",
    REJECTED: "bg-destructive/10 text-destructive",
  };

  const profileLabels = {
    ADMIN: "Administrador",
    TEACHER: "Professor",
    STUDENT: "Aluno",
    PARENT: "Responsável",
    VOLUNTEER: "Voluntário",
  };

  const statusLabels: Record<UserProfile["status"], string> = {
    APPROVED: "Aprovado",
    PENDING: "Pendente",
    REJECTED: "Rejeitado",
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        user.full_name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        (user.cpf || "").includes(searchQuery);

      const matchesProfile =
        profileFilter === "all" || user.role === profileFilter;
      const matchesStatus = statusFilter === "all" || user.status === statusFilter;

      return matchesSearch && matchesProfile && matchesStatus;
    });
  }, [users, searchQuery, profileFilter, statusFilter]);

  const handleBlockUser = async (user: UserProfile) => {
    if (user.id === currentUser?.id) {
      toast({ title: "Não é possível bloquear sua própria conta." });
      return;
    }
    const confirmed = window.confirm(
      `Bloquear o acesso de ${user.full_name || user.email}? A conta e os dados serão preservados; o status passará para Rejeitado.`
    );
    if (!confirmed) return;

    setDeletingUserId(user.id);
    const { data, error: updateError } = await supabase
      .from("users")
      .update({ status: "REJECTED" })
      .eq("id", user.id)
      .select("id")
      .maybeSingle();
    setDeletingUserId(null);

    if (updateError || !data) {
      toast({
        title: "Não foi possível bloquear o acesso",
        description: updateError?.message || "Verifique as permissões do banco.",
      });
      return;
    }
    toast({ title: "Acesso bloqueado. Os dados foram preservados." });
    await refetch();
  };

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
          <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-2 rounded-lg"
            onClick={() => toast({
              title: "Cadastro de novas contas",
              description: "A criação de contas pela administração ainda não está conectada a um endpoint seguro. Oriente a pessoa a solicitar cadastro na tela de login; depois, aprove ou rejeite a solicitação nesta lista.",
            })}
          >
            <Info className="w-4 h-4" />
            Como cadastrar
          </Button>
          </div>
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
                  <SelectItem value="VOLUNTEER">Voluntário</SelectItem>
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
                  <SelectItem value="APPROVED">Aprovado</SelectItem>
                  <SelectItem value="PENDING">Pendente</SelectItem>
                  <SelectItem value="REJECTED">Rejeitado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </GlassCard>

        {/* Users Grid */}
        <GlassSection title="Lista de Usuários">
          {loading ? (
            <div className="py-12 text-center text-muted-foreground">Carregando usuários...</div>
          ) : error ? (
            <div className="py-12 text-center text-destructive">{error}</div>
          ) : filteredUsers.length === 0 ? (
            <GlassEmptyState
              icon="👤"
              title="Nenhum usuário encontrado"
              description="Quando houver usuários cadastrados, eles aparecerão aqui. Novos acessos devem ser solicitados pelo cadastro público."
              action={
                <Button className="gap-2" onClick={() => toast({
                  title: "Cadastro de novas contas",
                  description: "A criação administrativa ainda não está conectada a um endpoint seguro. Oriente a pessoa a solicitar cadastro na tela de login.",
                })}>
                  <Plus className="w-4 h-4" />
                  Orientações de cadastro
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
                        {(user.full_name || user.email).charAt(0).toUpperCase()}
                      </div>

                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground">
                          {user.full_name || user.email}
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
                              profileColors[user.role]
                            }`}
                          >
                            {profileLabels[user.role]}
                          </span>
                          <span
                            className={`text-xs px-3 py-1 rounded-full font-medium ${
                              statusColors[user.status]
                            }`}
                          >
                            {statusLabels[user.status]}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Desde {new Date(user.created_at).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {user.status === "PENDING" && user.role !== "VOLUNTEER" && user.id !== currentUser?.id && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-lg text-primary"
                          title="Aprovar cadastro"
                          onClick={() => void handleStatusChange(user, "APPROVED")}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg"
                        title="Visualizar"
                        onClick={() => navigate(`/admin/users/${user.id}/ficha`)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg"
                        title="Editar"
                        onClick={() => navigate(`/admin/users/${user.id}`)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg text-destructive hover:text-destructive"
                        title="Bloquear acesso"
                        onClick={() => handleBlockUser(user)}
                        disabled={deletingUserId === user.id}
                      >
                        <Ban className="w-4 h-4" />
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
