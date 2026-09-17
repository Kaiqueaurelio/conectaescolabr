import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ModernLayout, ModernCard, ModernSection, ModernBadge } from "@/components/ModernLayout";
import { ModernTopBar, ModernPageHeader } from "@/components/ModernTopBar";
import { ModernSidebar } from "@/components/ModernSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser, useUpdateUser } from "@/hooks/useSupabaseData";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { getRoleLabel, getStatusLabel } from "@/lib/permissions";
import { UserProfile } from "@/lib/supabase";
import {
  readSecureProfile,
  saveSecureProfile,
  maskSensitive,
  SENSITIVE_FIELDS,
  type SensitiveField,
  type SensitiveValues,
} from "@/lib/secureProfile";
import { User, Mail, Phone, MapPin, Users, AlertCircle, CheckCircle, Lock } from "lucide-react";
import { toast } from "sonner";


export function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useSupabaseAuth();
  const { user, loading, error, refetch } = useUser(userId || null);
  const { updateUser, loading: updating } = useUpdateUser();

  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [secureLoading, setSecureLoading] = useState(false);

  const isOwner = !!user && !!currentUser && user.id === currentUser.id;

  useEffect(() => {
    if (!user) return;
    setFormData(user);
    if (!isOwner) return;
    setSecureLoading(true);
    readSecureProfile(user.id)
      .then(({ data, error: secureError }) => {
        if (secureError) {
          console.error("Erro ao abrir dados protegidos:", secureError);
          return;
        }
        if (data) setFormData((prev) => ({ ...prev, ...data }));
      })
      .finally(() => setSecureLoading(false));
  }, [user, isOwner]);

  const handleInputChange = (field: keyof UserProfile, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const sensitiveValue = (field: SensitiveField) => {
    const value = (formData as Record<string, unknown>)[field] as string | undefined;
    if (isOwner) return value || "";
    return maskSensitive(value);
  };

  const handleSave = async () => {
    if (!user) return;

    const plainData: Partial<UserProfile> = { ...formData };
    const secureData: SensitiveValues = {};
    for (const field of SENSITIVE_FIELDS) {
      if (isOwner) {
        secureData[field] = ((formData as Record<string, unknown>)[field] as string) ?? null;
      }
      delete (plainData as Record<string, unknown>)[field];
    }

    const result = await updateUser(user.id, plainData);
    if (!result.success) {
      toast.error(result.error || "Erro ao atualizar perfil");
      return;
    }

    if (isOwner) {
      const secureResult = await saveSecureProfile(user.id, secureData);
      if (!secureResult.success) {
        toast.error(secureResult.error || "Erro ao salvar dados protegidos");
        return;
      }
    }

    toast.success("Perfil atualizado com sucesso!");
    setIsEditing(false);
    refetch();
  };


  if (loading) {
    return (
      <ModernLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando perfil...</p>
          </div>
        </div>
      </ModernLayout>
    );
  }

  if (error || !user) {
    return (
      <ModernLayout>
        <div className="flex items-center justify-center h-screen">
          <ModernCard className="p-8 max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-destructive" />
              <h2 className="text-lg font-semibold">Erro ao carregar perfil</h2>
            </div>
            <p className="text-muted-foreground mb-6">{error || "Usuário não encontrado"}</p>
            <Button onClick={() => navigate(-1)} className="w-full">
              Voltar
            </Button>
          </ModernCard>
        </div>
      </ModernLayout>
    );
  }

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
          title="Perfil do Usuário"
          user={currentUser ? { name: currentUser.full_name, email: currentUser.email } : undefined}
        />

        <div className="p-6 max-w-4xl">
          <ModernPageHeader
            title={formData.full_name || "Sem nome"}
            description={`${getRoleLabel(formData.role as UserProfile["role"])} • ${getStatusLabel(formData.status as UserProfile["status"])}`}
            icon={<User />}
            action={
              <div className="flex gap-2">
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} variant="default">
                    Editar
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handleSave}
                      disabled={updating}
                      variant="default"
                    >
                      {updating ? "Salvando..." : "Salvar"}
                    </Button>
                    <Button
                      onClick={() => {
                        setIsEditing(false);
                        setFormData(user);
                      }}
                      variant="outline"
                    >
                      Cancelar
                    </Button>
                  </>
                )}
              </div>
            }
          />

          {/* Status Badge */}
          <div className="mb-6">
            {formData.status === "APPROVED" && (
              <ModernBadge variant="success">
                <CheckCircle className="w-4 h-4 mr-2" />
                Aprovado
              </ModernBadge>
            )}
            {formData.status === "PENDING" && (
              <ModernBadge variant="warning">
                <AlertCircle className="w-4 h-4 mr-2" />
                Pendente
              </ModernBadge>
            )}
            {formData.status === "REJECTED" && (
              <ModernBadge variant="destructive">
                <AlertCircle className="w-4 h-4 mr-2" />
                Rejeitado
              </ModernBadge>
            )}
          </div>

          {/* Aviso de criptografia */}
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
            <Lock className="mt-0.5 h-5 w-5 text-primary" />
            <p className="text-sm text-foreground/80">
              {isOwner
                ? secureLoading
                  ? "Abrindo seus dados protegidos..."
                  : "CPF, RG, endereço, telefone, filiação e situação social são guardados criptografados. Só você consegue vê-los."
                : "CPF, RG, endereço, telefone, filiação e situação social estão criptografados e só podem ser lidos pela própria pessoa."}
            </p>
          </div>

          {/* Informações Pessoais */}
          <ModernSection title="Informações Pessoais" subtitle="Dados básicos do usuário">
            <ModernCard className="p-6 space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="full_name">Nome Completo *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name || ""}
                    onChange={(e) => handleInputChange("full_name", e.target.value)}
                    disabled={!isEditing}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="email">E-mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    disabled={!isEditing}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    value={sensitiveValue("cpf")}
                    onChange={(e) => handleInputChange("cpf", e.target.value)}
                    disabled={!isEditing || !isOwner}
                    placeholder="000.000.000-00"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="rg">RG</Label>
                  <Input
                    id="rg"
                    value={sensitiveValue("rg")}
                    onChange={(e) => handleInputChange("rg", e.target.value)}
                    disabled={!isEditing || !isOwner}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={sensitiveValue("phone")}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    disabled={!isEditing || !isOwner}
                    placeholder="(11) 99999-9999"
                    className="mt-2"
                  />
                </div>


                <div>
                  <Label htmlFor="role">Perfil *</Label>
                  <Select
                    value={formData.role || "STUDENT"}
                    onValueChange={(value) =>
                      handleInputChange("role", value as UserProfile["role"])
                    }
                    disabled={!isEditing}
                  >
                    <SelectTrigger id="role" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Administrador</SelectItem>
                      <SelectItem value="TEACHER">Professor</SelectItem>
                      <SelectItem value="STUDENT">Aluno</SelectItem>
                      <SelectItem value="PARENT">Responsável</SelectItem>
                      <SelectItem value="VOLUNTEER">Voluntário</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  value={formData.address || ""}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  disabled={!isEditing}
                  placeholder="Rua, número, complemento"
                  className="mt-2"
                />
              </div>
            </ModernCard>
          </ModernSection>

          {/* Informações Familiares */}
          <ModernSection title="Informações Familiares" subtitle="Dados dos responsáveis">
            <ModernCard className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="mother_name">Nome da Mãe</Label>
                  <Input
                    id="mother_name"
                    value={formData.mother_name || ""}
                    onChange={(e) => handleInputChange("mother_name", e.target.value)}
                    disabled={!isEditing}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="father_name">Nome do Pai</Label>
                  <Input
                    id="father_name"
                    value={formData.father_name || ""}
                    onChange={(e) => handleInputChange("father_name", e.target.value)}
                    disabled={!isEditing}
                    className="mt-2"
                  />
                </div>
              </div>
            </ModernCard>
          </ModernSection>

          {/* Informações Sociais */}
          <ModernSection title="Informações Sociais" subtitle="Dados de vulnerabilidade e benefícios">
            <ModernCard className="p-6 space-y-6">
              <div>
                <Label htmlFor="vulnerability_situation">Situação de Vulnerabilidade</Label>
                <Textarea
                  id="vulnerability_situation"
                  value={formData.vulnerability_situation || ""}
                  onChange={(e) => handleInputChange("vulnerability_situation", e.target.value)}
                  disabled={!isEditing}
                  placeholder="Descreva a situação de vulnerabilidade, se aplicável"
                  className="mt-2"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="priority_public">Público Prioritário</Label>
                <Input
                  id="priority_public"
                  value={formData.priority_public || ""}
                  onChange={(e) => handleInputChange("priority_public", e.target.value)}
                  disabled={!isEditing}
                  placeholder="Ex: Criança, Adolescente, Idoso"
                  className="mt-2"
                />
              </div>
            </ModernCard>
          </ModernSection>
        </div>
      </div>
    </ModernLayout>
  );
}
