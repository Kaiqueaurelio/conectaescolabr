import { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, Moon, User as UserIcon, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const PREFS_KEY = "camila_prefs";

interface Prefs {
  notifications: boolean;
  emailDigest: boolean;
  darkMode: boolean;
}

const defaultPrefs: Prefs = { notifications: true, emailDigest: false, darkMode: false };

export default function Settings() {
  const { user, updateProfile } = useAuth();
  const [prefs, setPrefs] = useState<Prefs>(defaultPrefs);
  const [name, setName] = useState(user?.name || "");


  useEffect(() => {
    try {
      const raw = localStorage.getItem(PREFS_KEY);
      if (raw) setPrefs({ ...defaultPrefs, ...JSON.parse(raw) });
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    document.documentElement.classList.toggle("dark", prefs.darkMode);
  }, [prefs]);

  const saveProfile = async () => {
    if (name.trim().length < 3) return toast.error("Nome muito curto.");
    const result = await updateProfile({ name: name.trim() });
    if (!result.success) {
      toast.error(result.error || "Não foi possível atualizar o perfil.");
      return;
    }
    toast.success("Nome atualizado no banco de dados.");
  };

  const clearLocal = () => {
    localStorage.removeItem("camila_data_v2");
    localStorage.removeItem("camila_data_v3_clean");
    toast.success("Dados legados do protótipo removidos. Os dados do servidor foram preservados.");
  };

  return (
    <AppLayout>
      <PageHeader title="Configurações" subtitle="Gerencie sua conta e preferências" />

      <Card className="p-5 mb-4">
        <h2 className="text-sm font-semibold flex items-center gap-2 mb-4"><UserIcon className="h-4 w-4 text-primary" /> Perfil</h2>
        <div className="space-y-3">
          <div><Label>Nome</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><Label>E-mail</Label><Input type="email" value={user?.email || ""} disabled /><p className="mt-1 text-xs text-muted-foreground">Para alterar o e-mail, será necessário confirmar o novo endereço. Essa opção ainda não está disponível.</p></div>
          <Button onClick={saveProfile} className="gradient-primary text-primary-foreground"><Save className="h-4 w-4 mr-2" /> Salvar</Button>
        </div>
      </Card>

      <Card className="p-5 mb-4">
        <h2 className="text-sm font-semibold flex items-center gap-2 mb-4"><Bell className="h-4 w-4 text-secondary" /> Notificações</h2>
        <div className="space-y-4">
          <Row label="Notificações no app" desc="Receber alertas de comunicados e lembretes." checked={prefs.notifications} onChange={(v) => setPrefs((p) => ({ ...p, notifications: v }))} />
          <Row label="Resumo por e-mail" desc="Enviar resumo semanal das atividades." checked={prefs.emailDigest} onChange={(v) => setPrefs((p) => ({ ...p, emailDigest: v }))} />
        </div>
      </Card>

      <Card className="p-5 mb-4">
        <h2 className="text-sm font-semibold flex items-center gap-2 mb-4"><Moon className="h-4 w-4 text-tertiary" /> Aparência</h2>
        <Row label="Modo escuro" desc="Ative para usar o tema escuro." checked={prefs.darkMode} onChange={(v) => setPrefs((p) => ({ ...p, darkMode: v }))} />
      </Card>

      <Card className="p-5 border-destructive/30">
        <h2 className="text-sm font-semibold flex items-center gap-2 mb-2 text-destructive"><Trash2 className="h-4 w-4" /> Zona perigosa</h2>
        <p className="text-xs text-muted-foreground mb-3">Remove apenas dados legados do protótipo deste navegador. Os dados salvos no servidor e as preferências atuais não serão apagados.</p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="text-destructive border-destructive/40">Limpar dados locais</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Limpar dados locais?</AlertDialogTitle>
              <AlertDialogDescription>Isso não remove dados do Supabase. Somente a chave legada do protótipo será removida.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={clearLocal}>Limpar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Card>
    </AppLayout>
  );
}

function Row({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}