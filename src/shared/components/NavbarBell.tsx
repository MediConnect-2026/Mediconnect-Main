import React, { useState, useEffect } from "react";
import {
  Bell,
  User,
  AlertTriangle,
  FileText,
  Trash2Icon,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/animate-ui/components/radix/dropdown-menu";
import { Button } from "@/shared/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

// Servicios y Store
import { useAppStore } from "@/stores/useAppStore";
import socketService from "@/services/websocket/socket.service";
import {
  getNotificaciones,
  getUnreadNotificationsCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotificacion,
  type Notificacion,
} from "@/services/api/notifications.service";
import type {
  NotificacionEvent,
  ContadorNotificacionesEvent,
} from "@/types/WebSocketTypes";

const typeIcon: Record<string, React.ReactNode> = {
  user: <User className="w-4 h-4" />,
  system: <AlertTriangle className="w-4 h-4" />,
  report: <FileText className="w-4 h-4" />,
};

function NavbarBell() {
  const [open, setOpen] = useState(false);
  const [notis, setNotis] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"unread" | "read">("unread");
  const { t, i18n } = useTranslation("common");
  const currentLang = i18n.language || "es";

  // Zustand store - notificaciones
  const store = useAppStore() as any;
  const unreadCount = store?.unreadNotificationsCount ?? 0;
  const setUnreadCount = store?.setUnreadNotificationsCount ?? (() => {});
  const incrementUnreadCount =
    store?.incrementUnreadNotificationsCount ?? (() => {});

  // Asegurar que notis es un array antes de filtrar
  const unread = Array.isArray(notis) ? notis.filter((n) => !n.leida) : [];
  const read = Array.isArray(notis) ? notis.filter((n) => n.leida) : [];

  /**
   * Cargar notificaciones desde la API
   */
  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await getNotificaciones(1, 50, currentLang);
      const responseData = response?.data as any;

      if (
        responseData?.notificaciones &&
        Array.isArray(responseData.notificaciones)
      ) {
        const notisTraducidas = responseData.notificaciones.map((n: any) => {
          if (responseData._translation && responseData._translation.fields) {
            if (n._translation) {
              return {
                ...n,
                titulo: n._translation.titulo || n.titulo,
                mensaje: n._translation.mensaje || n.mensaje,
              };
            }
          } else if (n._translation) {
            return {
              ...n,
              titulo: n._translation.titulo || n.titulo,
              mensaje: n._translation.mensaje || n.mensaje,
            };
          }
          return n;
        });

        setNotis(notisTraducidas);

        if (responseData.noLeidas !== undefined) {
          setUnreadCount(responseData.noLeidas);
        }
      } else if (Array.isArray(response)) {
        setNotis(response);
      } else if (responseData && Array.isArray(responseData)) {
        setNotis(responseData);
      } else {
        setNotis([]);
      }
    } catch (error) {
      console.error("Error cargando notificaciones:", error);
      setNotis([]);
      toast.error(
        t("notifications.loadError", "Error al cargar notificaciones"),
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cargar el contador de notificaciones no leídas
   */
  const loadUnreadCount = async () => {
    try {
      const response = await getUnreadNotificationsCount(currentLang);
      const resAny = response as any;

      if (typeof resAny === "number") {
        setUnreadCount(resAny);
      } else if (resAny?.data?.contador !== undefined) {
        setUnreadCount(resAny.data.contador);
      } else if (resAny?.contador !== undefined) {
        setUnreadCount(resAny.contador);
      } else if (resAny?.data?.noLeidas !== undefined) {
        setUnreadCount(resAny.data.noLeidas);
      } else {
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error cargando contador de no leídas:", error);
    }
  };

  /**
   * Marcar una notificación como leída
   */
  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotis((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, leida: true } : n)),
      );

      if (unread.some((n) => n.id === notificationId) && unreadCount > 0) {
        setUnreadCount(unreadCount - 1);
      }

      toast.success(
        t("notifications.markedAsRead", "Notificación marcada como leída"),
      );
    } catch (error) {
      console.error("Error marcando notificación como leída:", error);
      toast.error(
        t("notifications.markAsReadError", "Error marcando como leída"),
      );
    }
  };

  /**
   * Marcar todas como leídas
   */
  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotis((prev) => prev.map((n) => ({ ...n, leida: true })));
      setUnreadCount(0);
      toast.success(
        t(
          "notifications.allMarkedAsRead",
          "Todas las notificaciones marcadas como leídas",
        ),
      );
    } catch (error) {
      console.error("Error marcando todas como leídas:", error);
      toast.error(
        t(
          "notifications.markAllAsReadError",
          "Error marcando todas como leídas",
        ),
      );
    }
  };

  const removeNotification = async (id: number) => {
    try {
      await deleteNotificacion(id);
      setNotis((prev) => prev.filter((n) => n.id !== id));
      toast.success(t("notifications.deleted", "Notificación eliminada"));

      if (unread.some((n) => n.id === id) && unreadCount > 0) {
        setUnreadCount(unreadCount - 1);
      }
    } catch (error) {
      console.error("Error eliminando notificación:", error);
      toast.error(
        t("notifications.deleteError", "Error al eliminar la notificación"),
      );
    }
  };

  const connectionStatus = useAppStore((state) => state.connectionStatus);

  /**
   * Cargar datos iniciales (API REST)
   */
  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
  }, [currentLang]);

  /**
   * Suscribirse a eventos de WebSocket una vez conectado
   */
  useEffect(() => {
    if (connectionStatus !== "connected") return;

    const unsubscribeNewNotification = socketService.onNewNotification(
      (event: NotificacionEvent & { _translation?: any }) => {
        const titulo = event._translation?.titulo || event.titulo;
        const mensaje = event._translation?.mensaje || event.mensaje;

        const newNotification: Notificacion = {
          id: event.id,
          titulo,
          mensaje,
          tipoAlerta: event.tipoAlerta,
          tipoEntidad: event.tipoEntidad,
          entidadId: event.entidadId,
          leida: false,
          creadoEn: event.creadoEn,
        };

        setNotis((prev) => [newNotification, ...prev]);
        incrementUnreadCount(1);

        toast.info(titulo, { description: mensaje });
      },
    );

    const unsubscribeCounterUpdate = socketService.onUnreadNotificationsCount(
      (event: ContadorNotificacionesEvent) => {
        setUnreadCount(event.contador);
      },
    );

    return () => {
      unsubscribeNewNotification();
      unsubscribeCounterUpdate();
    };
  }, [connectionStatus, setUnreadCount, incrementUnreadCount]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "relative rounded-full transition-transform duration-300 flex items-center justify-center group",
            "hover:bg-accent/70 text-primary",
            open ? "bg-primary" : "bg-bg-btn-secondary",
            "h-11 w-11 p-2.5 md:h-14 md:w-14 md:p-3",
          )}
          aria-label={t("notifications.title", "Notificaciones")}
        >
          <Bell
            className={cn(
              "h-7 w-7 transition-colors duration-300 stroke-[1.5px]",
              "group-hover:text-primary",
              open ? "text-background" : "text-primary/70",
            )}
          />
          {/* Badge unificado — mismo estilo que el de mensajes */}
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 flex min-w-5 h-5 px-1 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white shadow-sm ring-2 ring-background">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-96 p-0">
        <DropdownMenuLabel className="flex items-center justify-between px-4 py-2">
          <span className="text-base font-semibold text-foreground">
            {t("notifications.title", "Notificaciones")}
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={markAllAsRead}
            disabled={unread.length === 0}
            className="text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            {t("notifications.markAllRead", "Marcar todas como leídas")}
          </Button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="px-4 pt-2">
          <Tabs
            defaultValue="unread"
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "unread" | "read")}
          >
            <TabsList className="flex w-full gap-1 rounded-lg p-2">
              <TabsTrigger
                value="unread"
                className="flex-1 text-xs font-medium py-3 rounded-md transition-all duration-200"
              >
                {t("notifications.unread", "No leídas")} ({unread.length})
              </TabsTrigger>
              <TabsTrigger
                value="read"
                className="flex-1 text-xs font-medium py-3 px-3 rounded-md transition-all duration-200"
              >
                {t("notifications.read", "Leídas")} ({read.length})
              </TabsTrigger>
            </TabsList>
            <div className="border-b border-border/50 my-1" />

            <TabsContent value="unread">
              <div className="max-h-72 overflow-y-auto">
                {loading ? (
                  <div className="py-8 flex items-center justify-center text-sm text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("common.loading", "Cargando...")}
                  </div>
                ) : unread.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    {t("notifications.noUnread", "Sin notificaciones sin leer")}
                  </div>
                ) : (
                  <div className="divide-y divide-border/50">
                    {unread.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="notification-item px-4 py-3 flex items-start gap-3 hover:bg-accent/50 cursor-pointer transition-colors"
                      >
                        {/* Unread Indicator */}
                        <div className="flex items-center h-8">
                          <div className="w-2 h-2 rounded-full bg-secondary" />
                        </div>
                        {/* Icon */}
                        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-accent text-accent-foreground">
                          {notification.tipoEntidad ? (
                            typeIcon[notification.tipoEntidad] || (
                              <Bell className="w-4 h-4" />
                            )
                          ) : (
                            <Bell className="w-4 h-4" />
                          )}
                        </div>
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground leading-tight">
                            {notification.titulo}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                            {notification.mensaje}
                          </p>
                          <p className="text-[10px] text-muted-foreground/70 mt-1">
                            {new Date(notification.creadoEn).toLocaleString()}
                          </p>
                        </div>
                        {/* Actions */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNotification(notification.id);
                            }}
                            className="p-1.5 rounded-full transition-all text-primary/70 hover:bg-red-500/10 hover:text-red-500"
                            title={t("actions.delete", "Eliminar")}
                          >
                            <Trash2Icon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="read">
              <div className="max-h-72 overflow-y-auto">
                {read.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    {t("notifications.noRead", "Sin notificaciones leídas")}
                  </div>
                ) : (
                  <div className="divide-y divide-border/50">
                    {read.map((notification) => (
                      <div
                        key={notification.id}
                        className="notification-item px-4 py-3 flex items-start gap-3 hover:bg-accent/50 transition-colors"
                      >
                        {/* Read Indicator */}
                        <div className="pt-1">
                          <div className="w-2 h-2 rounded-full bg-[hsl(var(--notification-success))]" />
                        </div>
                        {/* Icon */}
                        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-accent text-accent-foreground">
                          {notification.tipoEntidad ? (
                            typeIcon[notification.tipoEntidad] || (
                              <Bell className="w-4 h-4" />
                            )
                          ) : (
                            <Bell className="w-4 h-4" />
                          )}
                        </div>
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground leading-tight">
                            {notification.titulo}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                            {notification.mensaje}
                          </p>
                          <p className="text-[10px] text-muted-foreground/70 mt-1">
                            {new Date(notification.creadoEn).toLocaleString()}
                          </p>
                        </div>
                        {/* Actions */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => removeNotification(notification.id)}
                            className="p-1.5 rounded-full transition-all text-primary/70 hover:bg-red-500/10 hover:text-red-500"
                            title={t("actions.delete", "Eliminar")}
                          >
                            <Trash2Icon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default NavbarBell;
