import React, { useState } from "react";
import { Bell, User, AlertTriangle, FileText, Trash2Icon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/animate-ui/components/radix/dropdown-menu";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { cn } from "@/lib/utils";

const notifications = [
  {
    id: 1,
    type: "user",
    title: "New user registered",
    description: "A new user has joined the platform.",
    read: false,
    timestamp: "2 min ago",
  },
  {
    id: 2,
    type: "system",
    title: "System update",
    description: "The system will be updated tonight.",
    read: false,
    timestamp: "1 hour ago",
  },
  {
    id: 3,
    type: "report",
    title: "New report submitted",
    description: "A new report is available for review.",
    read: true,
    timestamp: "Yesterday",
  },
  {
    id: 1,
    type: "user",
    title: "New user registered",
    description: "A new user has joined the platform.",
    read: false,
    timestamp: "2 min ago",
  },
  {
    id: 2,
    type: "system",
    title: "System update",
    description: "The system will be updated tonight.",
    read: false,
    timestamp: "1 hour ago",
  },
  {
    id: 3,
    type: "report",
    title: "New report submitted",
    description: "A new report is available for review.",
    read: true,
    timestamp: "Yesterday",
  },
];

const typeIcon: Record<string, React.ReactNode> = {
  user: <User className="w-4 h-4" />,
  system: <AlertTriangle className="w-4 h-4" />,
  report: <FileText className="w-4 h-4" />,
};

function AdminNavbarBell() {
  const [open, setOpen] = useState(false);
  const [notis, setNotis] = useState(notifications);

  const unread = notis.filter((n) => !n.read);
  const read = notis.filter((n) => n.read);

  const markAllAsRead = () => {
    setNotis((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const removeNotification = (id: number) => {
    setNotis((prev) => prev.filter((n) => n.id !== id));
  };

  const [activeTab, setActiveTab] = useState<"unread" | "read">("unread");

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "relative rounded-full p-3 transition-transform duration-300 h-14 w-14 flex items-center justify-center group",
            "hover:bg-accent/70 text-primary  ", // Efecto hover
            open ? "bg-primary" : "bg-bg-btn-secondary"
          )}
          aria-label="Notifications"
        >
          <Bell
            className={cn(
              "h-7 w-7 transition-colors duration-300 stroke-[1.5px]",
              "group-hover:text-primary", // Cambia color al hacer hover
              open ? "text-background" : "text-primary/70"
            )}
          />
          {unread.length > 0 && (
            <Badge
              className={cn(
                "absolute -top-2 -right-2 transition-transform duration-300", // Efecto hover en badge
                open ? "" : "opacity-80 "
              )}
              variant="destructive"
            >
              {unread.length}
            </Badge>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-96 p-0">
        <DropdownMenuLabel className="flex items-center justify-between px-4 py-2">
          <span className="text-base font-semibold text-foreground">
            Notifications
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={markAllAsRead}
            disabled={unread.length === 0}
            className="text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Mark all as read
          </Button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Tabs usando el componente Tabs */}
        <div className="px-4 pt-2">
          <Tabs
            defaultValue="unread"
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "unread" | "read")}
          >
            <TabsList className="flex w-full gap-1 rounded-lg p-2">
              <TabsTrigger
                value="unread"
                className={cn(
                  "flex-1 text-xs font-medium py-3 rounded-md transition-all duration-200"
                )}
              >
                Unread
              </TabsTrigger>
              <TabsTrigger
                value="read"
                className={cn(
                  "flex-1 text-xs font-medium py-3 px-3 rounded-md transition-all duration-200"
                )}
              >
                Read
              </TabsTrigger>
            </TabsList>
            <div className="border-b border-border my-1" />

            <TabsContent value="unread">
              <div className="max-h-72 overflow-y-auto">
                {unread.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No unread notifications
                  </div>
                ) : (
                  <div className="divide-y divide-border/50">
                    {unread.map((notification) => (
                      <div
                        key={notification.id}
                        className="notification-item px-4 py-3 flex items-start gap-3"
                      >
                        {/* Unread Indicator */}
                        <div className="flex items-center h-8">
                          <div className="w-2 h-2 rounded-full bg-secondary" />
                        </div>
                        {/* Icon */}
                        <div
                          className={cn(
                            "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                            notification.type === "user"
                              ? "bg-accent text-accent-foreground"
                              : "bg-[hsl(38_92%_50%/0.15)] text-[hsl(var(--notification-warning))]"
                          )}
                        >
                          {typeIcon[notification.type]}
                        </div>
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground leading-tight">
                            {notification.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                            {notification.description}
                          </p>
                          <p className="text-[10px] text-muted-foreground/70 mt-1">
                            {notification.timestamp}
                          </p>
                        </div>
                        {/* Actions */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            className={cn(
                              "p-1.5 rounded-full transition-all",
                              " text-primary/70  ",
                              "hover:bg-red-500/10 hover:text-red-500 "
                            )}
                            title="Delete"
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
                    No read notifications
                  </div>
                ) : (
                  <div className="divide-y divide-border/50">
                    {read.map((notification) => (
                      <div
                        key={notification.id}
                        className="notification-item px-4 py-3 flex items-start gap-3"
                      >
                        {/* Read Indicator */}
                        <div className="pt-1">
                          <div className="w-2 h-2 rounded-full bg-[hsl(var(--notification-success))]" />
                        </div>
                        {/* Icon */}
                        <div
                          className={cn(
                            "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                            notification.type === "user"
                              ? "bg-accent text-accent-foreground"
                              : "bg-[hsl(38_92%_50%/0.15)] text-[hsl(var(--notification-warning))]"
                          )}
                        >
                          {typeIcon[notification.type]}
                        </div>
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground leading-tight">
                            {notification.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                            {notification.description}
                          </p>
                          <p className="text-[10px] text-muted-foreground/70 mt-1">
                            {notification.timestamp}
                          </p>
                        </div>
                        {/* Actions */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => removeNotification(notification.id)}
                            className={cn(
                              "p-1.5 rounded-full transition-all",
                              " text-primary/70  ",
                              "hover:bg-red-500/10 hover:text-red-500 "
                            )}
                            title="Delete"
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

export default AdminNavbarBell;
