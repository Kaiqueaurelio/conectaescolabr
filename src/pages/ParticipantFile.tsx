import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, User, Phone, BookOpen, Gift, CalendarCheck, FileText, Pencil, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Participant {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
  status: string;
  created_at: string;
}
interface AttendanceRow { id: string; date: string; status: string; activity_id: string; }
interface BenefitRow { id: string; distribution_date: string; quantity: number; notes: string | null; inventory_item_id: string | null; }
interface SocialRow { id: string; record_type: string; title: string; description: string | null; record_date: string; }

const fmt = (value?: string | null) => value ? new Date(value + (value.length === 10 ? "T12:00:00" : "")).toLocaleDateString("pt-BR") : "—";

export default function ParticipantFile() {
  const { userId = "" } = useParams();
  const navigate = useNavigate();
  const [person, setPerson] = useState<Participant | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRow[]>([]);
  const [benefits, setBenefits] = useState<BenefitRow[]>([]);
  const [notes, setNotes] = useState<SocialRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [attendanceError, setAttendanceError] = useState(false);
  const [benefitsError, setBenefitsError] = useState(false);
  const [notesError, setNotesError] = useState(false);

  useEffect(() => {
    if (!userId) {
      setProfileError("Identificador de usuário ausente.");
      setLoading(false);
      return;
    }
    let active = true;
    const load = async () => {
      setLoading(true);
      const [profileResult, attendanceResult, benefitsResult, notesResult] = await Promise.all([
        supabase.from("users").select("id,full_name,email,role,status,created_at").eq("id", userId).maybeSingle(),
        supabase.from("attendance_records").select("id,date,status,activity_id").eq("user_id", userId).order("date", { ascending: false }),
        supabase.from("benefit_distributions").select("id,distribution_date,quantity,notes,inventory_item_id").eq("user_id", userId).order("distribution_date", { ascending: false }),
        supabase.from("social_records").select("id,record_type,title,description,record_date").eq("user_id", userId).order("record_date", { ascending: false }),
      ]);
      if (!active) return;
      if (profileResult.error || !profileResult.data) {
        console.error("Erro ao carregar participante:", profileResult.error);
        setProfileError(profileResult.error?.message || "Participante não encontrado ou sem permissão para visualização.");
        setPerson(null);
      } else {
        setPerson(profileResult.data as Participant);
        setProfileError(null);
      }
      if (attendanceResult.error) {
        console.error("Erro ao carregar frequência:", attendanceResult.error);
        setAttendance([]);
        setAttendanceError(true);
      } else {
        setAttendance((attendanceResult.data ?? []) as AttendanceRow[]);
        setAttendanceError(false);
      }
      if (benefitsResult.error) {
        console.error("Erro ao carregar benefícios:", benefitsResult.error);
        setBenefits([]);
        setBenefitsError(true);
      } else {
        setBenefits((benefitsResult.data ?? []) as BenefitRow[]);
        setBenefitsError(false);
      }
      if (notesResult.error) {
        console.error("Erro ao carregar prontuário:", notesResult.error);
        setNotes([]);
        setNotesError(true);
      } else {
        setNotes((notesResult.data ?? []) as SocialRow[]);
        setNotesError(false);
      }
      setLoading(false);
    };
    void load().catch((error) => {
      console.error("Falha inesperada ao carregar ficha:", error);
      if (active) {
        setProfileError("Não foi possível carregar a ficha. Verifique a conexão e as permissões.");
        setPerson(null);
        setAttendance([]);
        setBenefits([]);
        setNotes([]);
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, [userId]);

  if (loading) return <div className="p-10 text-center text-muted-foreground">Carregando ficha do participante...</div>;
  if (!person) {
    return (
      <div className="mx-auto max-w-xl p-8">
        <Card className="p-6">
          <div className="mb-3 flex items-center gap-2 text-destructive"><AlertCircle className="h-5 w-5" /><h1 className="font-semibold">Ficha indisponível</h1></div>
          <p className="mb-5 text-sm text-muted-foreground">{profileError || "Não foi possível carregar este participante."}</p>
          <Button variant="outline" onClick={() => navigate("/admin/users")}><ArrowLeft className="mr-2 h-4 w-4" />Voltar para usuários</Button>
        </Card>
      </div>
    );
  }

  const presentCount = attendance.filter((record) => record.status === "PRESENT").length;
  const attendanceRate = attendance.length ? Math.round((presentCount / attendance.length) * 100) : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-8">
        <Button variant="ghost" onClick={() => navigate("/admin/users")} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Voltar para usuários
        </Button>

        <Card className="flex flex-col justify-between gap-4 p-6 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground">
              {(person.full_name || person.email || "?").charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{person.full_name || "Sem nome"}</h1>
              <p className="text-sm text-muted-foreground">{person.email}</p>
              <p className="text-xs text-muted-foreground">Perfil: {person.role} · Status: {person.status} · Cadastro: {fmt(person.created_at)}</p>
            </div>
          </div>
          <Button variant="outline" className="gap-2" onClick={() => navigate(`/admin/users/${userId}`)}>
            <Pencil className="h-4 w-4" /> Editar perfil
          </Button>
        </Card>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <Card className="flex items-center gap-3 p-4"><CalendarCheck className="h-5 w-5 text-primary" /><div><p className="text-2xl font-bold">{attendanceError ? "—" : attendance.length}</p><p className="text-xs text-muted-foreground">Registros de frequência</p></div></Card>
          <Card className="flex items-center gap-3 p-4"><Gift className="h-5 w-5 text-primary" /><div><p className="text-2xl font-bold">{benefitsError ? "—" : benefits.length}</p><p className="text-xs text-muted-foreground">Distribuições registradas</p></div></Card>
          <Card className="flex items-center gap-3 p-4"><FileText className="h-5 w-5 text-primary" /><div><p className="text-2xl font-bold">{notesError ? "—" : notes.length}</p><p className="text-xs text-muted-foreground">Registros de acompanhamento</p></div></Card>
        </div>

        <Tabs defaultValue="pessoal">
          <TabsList className="flex h-auto flex-wrap">
            <TabsTrigger value="pessoal"><User className="mr-1 h-4 w-4" />Pessoal</TabsTrigger>
            <TabsTrigger value="contatos"><Phone className="mr-1 h-4 w-4" />Responsáveis</TabsTrigger>
            <TabsTrigger value="programas"><BookOpen className="mr-1 h-4 w-4" />Programas</TabsTrigger>
            <TabsTrigger value="beneficios"><Gift className="mr-1 h-4 w-4" />Benefícios</TabsTrigger>
            <TabsTrigger value="frequencia"><CalendarCheck className="mr-1 h-4 w-4" />Frequência</TabsTrigger>
            <TabsTrigger value="notas"><FileText className="mr-1 h-4 w-4" />Acompanhamento</TabsTrigger>
          </TabsList>

          <TabsContent value="pessoal">
            <Card className="space-y-2 p-6">
              <h2 className="font-semibold">Dados pessoais</h2>
              <p className="text-sm text-muted-foreground">Os dados pessoais e protegidos são administrados na tela de perfil, onde os campos sensíveis são tratados pelo serviço de criptografia.</p>
              <Button variant="outline" onClick={() => navigate(`/admin/users/${userId}`)}>Abrir perfil</Button>
            </Card>
          </TabsContent>

          <TabsContent value="contatos">
            <Card className="p-6">
              <h2 className="mb-2 font-semibold">Vínculo com responsáveis</h2>
              <p className="text-sm text-muted-foreground">O relacionamento entre responsáveis e participantes ainda não está configurado em uma tabela validada. Nenhum contato fictício é exibido.</p>
            </Card>
          </TabsContent>

          <TabsContent value="programas">
            <Card className="p-6">
              <h2 className="mb-2 font-semibold">Programas e atividades</h2>
              <p className="text-sm text-muted-foreground">A tabela de matrícula de participantes em programas ainda não foi confirmada. As atividades disponíveis podem ser consultadas na seção Atividades; esta ficha não inventa vínculos de matrícula.</p>
            </Card>
          </TabsContent>

          <TabsContent value="beneficios">
            <Card className="p-6">
              <h2 className="mb-4 font-semibold">Benefícios recebidos</h2>
              {benefitsError ? <p className="text-sm text-destructive">Não foi possível consultar as distribuições. Nenhum valor foi presumido.</p> : benefits.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">Nenhuma distribuição registrada para este participante.</p> : (
                <ul className="divide-y divide-border">
                  {benefits.map((item) => <li key={item.id} className="py-3">
                    <p className="font-medium">{item.quantity} unidade(s) · {item.notes || "Distribuição de benefício"}</p>
                    <p className="text-xs text-muted-foreground">{fmt(item.distribution_date)}{item.inventory_item_id ? ` · Item ${item.inventory_item_id}` : ""}</p>
                  </li>)}
                </ul>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="frequencia">
            <Card className="p-6">
              <h2 className="mb-2 font-semibold">Frequência</h2>
              {attendanceError ? <p className="text-sm text-destructive">Não foi possível consultar a frequência. Nenhum percentual foi inventado.</p> : attendance.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">Nenhum registro de frequência encontrado.</p> : (
                <>
                  <p className="mb-4 text-sm text-muted-foreground">Taxa de presença nos registros consultados: {attendanceRate}% ({presentCount} de {attendance.length}).</p>
                  <ul className="divide-y divide-border">
                    {attendance.map((record) => <li key={record.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                      <span>{fmt(record.date)}</span><span>{record.status}</span>
                    </li>)}
                  </ul>
                </>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="notas">
            <Card className="p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-semibold">Acompanhamento social</h2>
                <Button variant="outline" onClick={() => navigate(`/admin/users/${userId}/record`)}>Abrir prontuário</Button>
              </div>
              {notesError ? <p className="text-sm text-destructive">Não foi possível consultar o prontuário.</p> : notes.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">Nenhum registro de acompanhamento encontrado.</p> : (
                <ul className="divide-y divide-border">
                  {notes.map((note) => <li key={note.id} className="py-3">
                    <p className="font-medium">{note.title || note.record_type}</p>
                    <p className="text-sm text-muted-foreground">{note.description || "Sem descrição"}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{fmt(note.record_date)} · {note.record_type}</p>
                  </li>)}
                </ul>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
