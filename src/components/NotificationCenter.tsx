import { useState, useEffect } from "react";
import { Bell, X, AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface Notification {
  id: string;
  type: "info" | "warning" | "error" | "success";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    href: string;
  };
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Simular carregamento de notificações
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: "1",
        type: "warning",
        title: "Estoque Baixo",
        message: "Leite em pó: apenas 15 unidades restantes",
        timestamp: new Date(Date.now() - 5 * 60000),
        read: false,
        action: { label: "Ver Estoque", href: "/admin/benefits" },
      },
      {
        id: "2",
        type: "error",
        title: "Frequência Crítica",
        message: "João Silva com 5 faltas consecutivas",
        timestamp: new Date(Date.now() - 30 * 60000),
        read: false,
        action: { label: "Ver Detalhes", href: "/admin/attendance" },
      },
      {
        id: "3",
        type: "info",
        title: "Novo Cadastro",
        message: "Maria Santos se registrou como responsável",
        timestamp: new Date(Date.now() - 2 * 60 * 60000),
        read: true,
        action: { label: "Aprovar", href: "/admin/users" },
      },
      {
        id: "4",
        type: "success",
        title: "Distribuição Concluída",
        message: "150 cestas distribuídas com sucesso",
        timestamp: new Date(Date.now() - 24 * 60 * 60000),
        read: true,
      },
    ];

    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter((n) => !n.read).length);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Agora";
    if (minutes < 60) return `${minutes}m atrás`;
    if (hours < 24) return `${hours}h atrás`;
    if (days < 7) return `${days}d atrás`;
    return date.toLocaleDateString("pt-BR");
  };

  return (
    <div className="relative">
      {/* Botão de Notificações */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-muted rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5 text-foreground" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-coral text-white text-xs rounded-full flex items-center justify-center font-semibold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Painel de Notificações */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-card border border-border rounded-lg shadow-soft-lg z-50 max-h-96 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Notificações</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-primary hover:underline"
              >
                Marcar como lido
              </button>
            )}
          </div>

          {/* Lista de Notificações */}
          <div className="overflow-y-auto flex-1">
            {notifications.length > 0 ? (
              <div className="divide-y divide-border">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-muted transition-colors ${
                      !notification.read ? "bg-primary/5" : ""
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">{getIcon(notification.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm">
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatTime(notification.timestamp)}
                        </p>
                        {notification.action && (
                          <a
                            href={notification.action.href}
                            className="text-xs text-primary hover:underline mt-2 inline-block"
                          >
                            {notification.action.label} →
                          </a>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground text-sm">
                Nenhuma notificação
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-border text-center">
              <a href="/admin/notifications" className="text-xs text-primary hover:underline">
                Ver todas as notificações
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
