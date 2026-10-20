import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { AlertCircle, Bell } from "lucide-react";

export default function Reminders() {
  return (
    <AppLayout>
      <PageHeader title="Lembretes" subtitle="Tarefas e prazos importantes" />
      <Card className="flex items-start gap-3 p-5">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <div>
          <h2 className="font-semibold">Lembretes ainda não sincronizados</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            A versão atual guarda lembretes apenas no estado local do protótipo e não possui uma tabela de lembretes confirmada no Supabase.
            Para evitar mostrar tarefas de demonstração como se fossem reais, a lista foi temporariamente desativada até a persistência e as permissões do servidor serem configuradas.
          </p>
          <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Bell className="h-3.5 w-3.5" />
            Nenhum lembrete foi apagado do banco de dados.
          </p>
        </div>
      </Card>
    </AppLayout>
  );
}
