import { useState, useMemo } from "react";
import { ModernLayout, ModernCard, ModernSection, ModernEmptyState } from "@/components/ModernLayout";
import { ModernTopBar, ModernPageHeader } from "@/components/ModernTopBar";
import { ModernSidebar } from "@/components/ModernSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { Calendar, Plus, Clock, MapPin, Users, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location?: string;
  participants?: string[];
  type: "event" | "activity" | "holiday";
}

export function SmartCalendarPage() {
  const { user: currentUser } = useSupabaseAuth();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    time: "09:00",
    location: "",
    type: "activity" as "event" | "activity" | "holiday",
  });

  const monthDays = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const getEventsForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return events.filter((e) => e.date === dateStr);
  };

  const handleAddEvent = () => {
    if (!newEvent.title.trim()) {
      toast.error("Título é obrigatório");
      return;
    }

    const event: CalendarEvent = {
      id: `event-${Date.now()}`,
      title: newEvent.title,
      description: newEvent.description,
      date: newEvent.date,
      time: newEvent.time,
      location: newEvent.location,
      type: newEvent.type,
    };

    setEvents([...events, event]);
    setNewEvent({
      title: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      time: "09:00",
      location: "",
      type: "activity",
    });
    toast.success("Evento adicionado com sucesso!");
  };

  const handleDeleteEvent = (id: string) => {
    if (!window.confirm("Remover este evento?")) return;
    setEvents(events.filter((e) => e.id !== id));
    toast.success("Evento removido");
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "event":
        return "bg-primary/10 text-primary";
      case "activity":
        return "bg-secondary/10 text-secondary";
      case "holiday":
        return "bg-warning/10 text-warning";
      default:
        return "bg-muted/10 text-muted-foreground";
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case "event":
        return "Evento";
      case "activity":
        return "Atividade";
      case "holiday":
        return "Feriado";
      default:
        return "Outro";
    }
  };

  const sidebarItems = [
    { label: "Dashboard", href: "/admin", icon: "📊" },
    { label: "Usuários", href: "/admin/users", icon: "👥" },
    { label: "Presença", href: "/admin/attendance", icon: "✓" },
    { label: "Benefícios", href: "/admin/benefits", icon: "🎁" },
  ];

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

  return (
    <ModernLayout>
      <ModernSidebar items={sidebarItems} />
      <div className="lg:ml-64">
        <ModernTopBar
          title="Calendário Inteligente"
          user={currentUser ? { name: currentUser.full_name, email: currentUser.email } : undefined}
        />

        <div className="p-6">
          <ModernPageHeader
            title="Calendário"
            description="Gerencie eventos e atividades da ONG"
            icon={<Calendar />}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendário */}
            <div className="lg:col-span-2">
              <ModernCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-foreground">
                    {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentDate(
                          new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
                        )
                      }
                    >
                      ←
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentDate(
                          new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
                        )
                      }
                    >
                      →
                    </Button>
                  </div>
                </div>

                {/* Dias da semana */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {weekDays.map((day) => (
                    <div key={day} className="text-center font-semibold text-sm text-muted-foreground">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Dias do mês */}
                <div className="grid grid-cols-7 gap-2">
                  {monthDays.map((day) => {
                    const dayEvents = getEventsForDate(day);
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    const isToday = isSameDay(day, new Date());

                    return (
                      <div
                        key={day.toString()}
                        className={`p-2 rounded-lg border-2 min-h-24 ${
                          isCurrentMonth ? "bg-background" : "bg-muted/30"
                        } ${isToday ? "border-primary" : "border-border"}`}
                      >
                        <p
                          className={`text-sm font-semibold mb-1 ${
                            isCurrentMonth ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {format(day, "d")}
                        </p>
                        <div className="space-y-1">
                          {dayEvents.slice(0, 2).map((event) => (
                            <div
                              key={event.id}
                              className={`text-xs p-1 rounded truncate cursor-pointer ${getEventTypeColor(event.type)}`}
                              title={event.title}
                            >
                              {event.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <p className="text-xs text-muted-foreground">
                              +{dayEvents.length - 2} mais
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ModernCard>
            </div>

            {/* Painel Lateral */}
            <div className="space-y-6">
              {/* Adicionar Evento */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Evento
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Novo Evento</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="event_title">Título *</Label>
                      <Input
                        id="event_title"
                        value={newEvent.title}
                        onChange={(e) =>
                          setNewEvent({ ...newEvent, title: e.target.value })
                        }
                        placeholder="Título do evento"
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="event_date">Data *</Label>
                      <Input
                        id="event_date"
                        type="date"
                        value={newEvent.date}
                        onChange={(e) =>
                          setNewEvent({ ...newEvent, date: e.target.value })
                        }
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="event_time">Hora</Label>
                      <Input
                        id="event_time"
                        type="time"
                        value={newEvent.time}
                        onChange={(e) =>
                          setNewEvent({ ...newEvent, time: e.target.value })
                        }
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="event_location">Local</Label>
                      <Input
                        id="event_location"
                        value={newEvent.location}
                        onChange={(e) =>
                          setNewEvent({ ...newEvent, location: e.target.value })
                        }
                        placeholder="Local do evento"
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="event_description">Descrição</Label>
                      <Textarea
                        id="event_description"
                        value={newEvent.description}
                        onChange={(e) =>
                          setNewEvent({ ...newEvent, description: e.target.value })
                        }
                        placeholder="Descrição do evento"
                        rows={4}
                        className="mt-2"
                      />
                    </div>

                    <div className="flex gap-3 justify-end">
                      <Button variant="outline">Cancelar</Button>
                      <Button onClick={handleAddEvent}>Criar</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Próximos Eventos */}
              <ModernCard className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Próximos Eventos</h3>
                {events.length === 0 ? (
                  <ModernEmptyState
                    icon={<Calendar />}
                    title="Nenhum evento"
                    description="Crie um novo evento"
                  />
                ) : (
                  <div className="space-y-3">
                    {events
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .slice(0, 5)
                      .map((event) => (
                        <div key={event.id} className="p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="font-medium text-sm text-foreground">{event.title}</h4>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteEvent(event.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>

                          <div className="space-y-1 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(event.date), "dd 'de' MMMM", {
                                locale: ptBR,
                              })}
                            </div>
                            {event.time && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {event.time}
                              </div>
                            )}
                            {event.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {event.location}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </ModernCard>
            </div>
          </div>
        </div>
      </div>
    </ModernLayout>
  );
}
