import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { useData } from "@/contexts/DataContext";
import { CalendarX, MapPin } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import { ptBR } from "date-fns/locale";

export default function Agenda() {
  const { events } = useData();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const selectedISO = date?.toISOString().slice(0, 10);
  const dayEvents = events.filter((e) => e.date === selectedISO);
  const eventDates = events.map((e) => new Date(e.date));

  return (
    <AppLayout>
      <PageHeader title="Agenda" subtitle="Eventos, aulas e atividades da ONG" />
      <Card className="p-2 mb-4 overflow-hidden">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          locale={ptBR}
          modifiers={{ hasEvent: eventDates }}
          modifiersClassNames={{ hasEvent: "relative after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1 after:w-1 after:rounded-full after:bg-secondary" }}
          className="pointer-events-auto mx-auto"
        />
      </Card>

      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
        {date?.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
      </h2>

      {dayEvents.length === 0 ? (
        <EmptyState icon={CalendarX} title="Nenhum evento neste dia" description="Selecione outra data para ver atividades." />
      ) : (
        <div className="space-y-2">
          {dayEvents.map((e) => (
            <Card key={e.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 mt-2 rounded-full gradient-primary flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold">{e.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">{e.description}</p>
                  {e.class_id && (
                    <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] text-primary font-medium">
                      <MapPin className="h-3 w-3" /> Turma específica
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppLayout>
  );
}