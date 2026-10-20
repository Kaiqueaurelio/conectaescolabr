import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Trash2, User, Phone, BookOpen, Gift, CalendarCheck, FileText, Pencil } from "lucide-react";
import { toast } from "sonner";

type Row = Record<string, any>;
const db = supabase as any;

function useTable(table: string, participantId: string, order = "created_at") {
  const [rows, setRows] = useState<Row[]>([]);
  const load = async () => {
    const { data, error } = await db.from(table).select("*").eq("participant_id", participantId).order(order, { ascending: false });
    if (error) toast.error(error.message);
    else setRows(data ?? []);
  };
  useEffect(() => { load(); }, [participantId]);
  const add = async (values: Row) => {
    const { error } = await db.from(table).insert({ ...values, participant_id: participantId });
    if (error) return toast.error(error.message);
    toast.success("Registro adicionado");
    load();
  };
  const remove = async (id: string) => {
    if (!confirm("Remover este registro?")) return;
    const { error } = await db.from(table).delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };
  return { rows, add, remove };
}

function QuickForm({ fields, onSubmit }: { fields: { key: string; label: string; type?: string }[]; onSubmit: (v: Row) => void }) {
  const [v, setV] = useState<Row>({});
  return (
    <form
      className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 items-end"
      onSubmit={(e) => {
        e.preventDefault();
        const clean: Row = {};
        for (const f of fields) {
          const val = v[f.key];
          if (val === undefined || val === "") continue;
          clean[f.key] = f.type === "checkbox" ? !!val : f.type === "number" ? Number(val) : val;
        }
        if (!clean[fields[0].key]) return toast.error(`Preencha: ${fields[0].label}`);
        onSubmit(clean);
        setV({});
      }}
    >
      {fields.map((f) =>
        f.type === "checkbox" ? (
          <label key={f.key} className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={!!v[f.key]} onChange={(e) => setV({ ...v, [f.key]: e.target.checked })} />
            {f.label}
          </label>
        ) : (
          <div key={f.key}>
            <span className="text-xs text-muted-foreground">{f.label}</span>
            <Input type={f.type || "text"} value={v[f.key] ?? ""} onChange={(e) => setV({ ...v, [f.key]: e.target.value })} />
          </div>
        ),
      )}
      <Button type="submit">Adicionar</Button>
    </form>
  );
}

function List({ rows, render, onRemove, empty }: { rows: Row[]; render: (r: Row) => React.ReactNode; onRemove: (id: string) => void; empty: string }) {
  if (!rows.length) return <p className="text-sm text-muted-foreground py-6 text-center">{empty}</p>;
  return (
    <ul className="divide-y divide-border">
      {rows.map((r) => (
        <li key={r.id} className="flex items-center justify-between gap-3 py-3">
          <div className="text-sm">{render(r)}</div>
          <Button size="icon" variant="ghost" onClick={() => onRemove(r.id)} aria-label="Remover">
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </li>
      ))}
    </ul>
  );
}

const fmt = (d?: string) => (d ? new Date(d + (d.length === 10 ? "T12:00:00" : "")).toLocaleDateString("pt-BR") : "—");

export default function ParticipantFile() {
  const { userId = "" } = useParams();
  const navigate = useNavigate();
  const [person, setPerson] = useState<Row | null>(null);
  const [extra, setExtra] = useState<Row>({});

  const guardians = useTable("participant_guardians", userId);
  const programs = useTable("program_enrollments", userId);
  const benefits = useTable("benefit_grants", userId, "granted_on");
  const attendance = useTable("attendance_records", userId, "attended_on");
  const notes = useTable("participant_notes", userId);

  useEffect(() => {
    db.from("users").select("*").eq("id", userId).maybeSingle().then(({ data, error }: any) => {
      if (error) toast.error(error.message);
      setPerson(data);
      setExtra({ birth_date: data?.birth_date ?? "", school: data?.school ?? "", nis: data?.nis ?? "" });
    });
  }, [userId]);

  const saveExtra = async () => {
    const { error } = await db.from("users").update({
      birth_date: extra.birth_date || null, school: extra.school || null, nis: extra.nis || null,
    }).eq("id", userId);
    error ? toast.error(error.message) : toast.success("Dados salvos");
  };

  const total = attendance.rows.length;
  const present = attendance.rows.filter((r) => r.present).length;
  const rate = total ? Math.round((present / total) * 100) : null;
  const age = extra.birth_date ? Math.floor((Date.now() - new Date(extra.birth_date).getTime()) / 31557600000) : null;

  if (!person) return <div className="p-10 text-center text-muted-foreground">Carregando ficha...</div>;

  const stats = [
    { label: "Programas ativos", value: programs.rows.filter((p) => p.status === "ATIVO").length, icon: BookOpen, tone: "bg-primary/10 text-primary" },
    { label: "Benefícios recebidos", value: benefits.rows.length, icon: Gift, tone: "bg-secondary/15 text-secondary" },
    { label: "Frequência", value: rate === null ? "—" : `${rate}%`, icon: CalendarCheck, tone: "bg-accent/15 text-accent" },
    { label: "Responsáveis", value: guardians.rows.length, icon: Phone, tone: "bg-destructive/10 text-destructive" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
        <Button variant="ghost" onClick={() => navigate("/admin/users")} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Voltar para usuários
        </Button>

        <Card className="p-6 flex flex-col md:flex-row md:items-center gap-4 justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary text-primary-foreground grid place-items-center text-2xl font-bold">
              {(person.full_name || "?").charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{person.full_name || "Sem nome"}</h1>
              <p className="text-sm text-muted-foreground">{person.email} · {age !== null ? `${age} anos` : "idade não informada"}</p>
            </div>
          </div>
          <Button variant="outline" className="gap-2" onClick={() => navigate(`/admin/users/${userId}`)}>
            <Pencil className="w-4 h-4" /> Editar dados pessoais
          </Button>
        </Card>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <Card key={s.label} className="p-4 flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl grid place-items-center ${s.tone}`}><s.icon className="w-5 h-5" /></div>
              <div><p className="text-2xl font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="pessoal">
          <TabsList className="flex flex-wrap h-auto">
            <TabsTrigger value="pessoal"><User className="w-4 h-4 mr-1" />Pessoal</TabsTrigger>
            <TabsTrigger value="contatos"><Phone className="w-4 h-4 mr-1" />Responsáveis</TabsTrigger>
            <TabsTrigger value="programas"><BookOpen className="w-4 h-4 mr-1" />Programas</TabsTrigger>
            <TabsTrigger value="beneficios"><Gift className="w-4 h-4 mr-1" />Benefícios</TabsTrigger>
            <TabsTrigger value="frequencia"><CalendarCheck className="w-4 h-4 mr-1" />Frequência</TabsTrigger>
            <TabsTrigger value="notas"><FileText className="w-4 h-4 mr-1" />Acompanhamento</TabsTrigger>
          </TabsList>

          <TabsContent value="pessoal">
            <Card className="p-6 space-y-4">
              <div className="grid sm:grid-cols-3 gap-4">
                <div><span className="text-xs text-muted-foreground">Data de nascimento</span>
                  <Input type="date" value={extra.birth_date} onChange={(e) => setExtra({ ...extra, birth_date: e.target.value })} /></div>
                <div><span className="text-xs text-muted-foreground">Escola / série</span>
                  <Input value={extra.school} onChange={(e) => setExtra({ ...extra, school: e.target.value })} /></div>
                <div><span className="text-xs text-muted-foreground">NIS</span>
                  <Input value={extra.nis} onChange={(e) => setExtra({ ...extra, nis: e.target.value })} /></div>
              </div>
              <div className="grid sm:grid-cols-3 gap-4 text-sm">
                <p><span className="text-muted-foreground">Perfil:</span> {person.role}</p>
                <p><span className="text-muted-foreground">Situação:</span> {person.status}</p>
                <p><span className="text-muted-foreground">Público prioritário:</span> {person.priority_public || "—"}</p>
              </div>
              <p className="text-xs text-muted-foreground">CPF, RG, endereço e filiação ficam protegidos e são editados em "Editar dados pessoais".</p>
              <Button onClick={saveExtra}>Salvar</Button>
            </Card>
          </TabsContent>

          <TabsContent value="contatos">
            <Card className="p-6 space-y-4">
              <QuickForm onSubmit={guardians.add} fields={[
                { key: "name", label: "Nome" }, { key: "relationship", label: "Parentesco" },
                { key: "phone", label: "Telefone" }, { key: "is_emergency", label: "Emergência", type: "checkbox" },
                { key: "can_pick_up", label: "Pode buscar", type: "checkbox" },
              ]} />
              <List rows={guardians.rows} onRemove={guardians.remove} empty="Nenhum responsável cadastrado."
                render={(r) => <><b>{r.name}</b> · {r.relationship || "—"} · {r.phone || "sem telefone"}
                  {r.is_emergency && " · 🚨 emergência"}{r.can_pick_up && " · ✅ pode buscar"}</>} />
            </Card>
          </TabsContent>

          <TabsContent value="programas">
            <Card className="p-6 space-y-4">
              <QuickForm onSubmit={programs.add} fields={[
                { key: "program", label: "Programa / oficina" }, { key: "class_group", label: "Turma" },
                { key: "started_on", label: "Início", type: "date" }, { key: "status", label: "Status (ATIVO/ENCERRADO)" },
              ]} />
              <List rows={programs.rows} onRemove={programs.remove} empty="Sem participação em programas."
                render={(r) => <><b>{r.program}</b> · {r.class_group || "sem turma"} · desde {fmt(r.started_on)} · {r.status}</>} />
            </Card>
          </TabsContent>

          <TabsContent value="beneficios">
            <Card className="p-6 space-y-4">
              <QuickForm onSubmit={benefits.add} fields={[
                { key: "benefit", label: "Benefício" }, { key: "quantity", label: "Quantidade", type: "number" },
                { key: "unit", label: "Unidade" }, { key: "granted_on", label: "Data", type: "date" },
                { key: "delivered_by", label: "Entregue por" }, { key: "notes", label: "Observação" },
              ]} />
              <List rows={benefits.rows} onRemove={benefits.remove} empty="Nenhum benefício registrado."
                render={(r) => <><b>{r.benefit}</b> · {r.quantity} {r.unit} · {fmt(r.granted_on)}{r.delivered_by && ` · por ${r.delivered_by}`}{r.notes && ` · ${r.notes}`}</>} />
            </Card>
          </TabsContent>

          <TabsContent value="frequencia">
            <Card className="p-6 space-y-4">
              <p className="text-sm">{total ? `${present} presenças de ${total} registros (${rate}%)` : "Sem registros de frequência."}</p>
              <QuickForm onSubmit={attendance.add} fields={[
                { key: "attended_on", label: "Data", type: "date" }, { key: "program", label: "Programa" },
                { key: "present", label: "Presente", type: "checkbox" },
              ]} />
              <List rows={attendance.rows} onRemove={attendance.remove} empty="Nenhuma chamada registrada."
                render={(r) => <>{fmt(r.attended_on)} · {r.program || "geral"} · {r.present ? "✅ Presente" : "❌ Falta"}</>} />
            </Card>
          </TabsContent>

          <TabsContent value="notas">
            <Card className="p-6 space-y-4">
              <QuickForm onSubmit={notes.add} fields={[{ key: "note", label: "Anotação" }, { key: "author", label: "Autor" }]} />
              <List rows={notes.rows} onRemove={notes.remove} empty="Nenhuma anotação."
                render={(r) => <><span className="text-muted-foreground">{fmt(r.created_at)} {r.author && `· ${r.author}`}</span><br />{r.note}</>} />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
