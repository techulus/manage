"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { TurboWire } from "@turbowire/web";
import { Bell, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { realtimeSchema } from "@/data/notification";
import { displayMutationError } from "@/lib/utils/error";
import { useTRPC } from "@/trpc/client";
import { Button } from "../ui/button";
import { Spinner, SpinnerWithSpacing } from "./loaders";
import { NotificationItem } from "./notification-item";
import { Panel } from "./panel";

export function Notifications({
  notificationsWire,
}: {
  notificationsWire: string;
}) {
  const [open, setOpen] = useState(false);
  const trpc = useTRPC();
  const {
    data: notifications,
    isLoading: notificationsLoading,
    refetch: refetchNotifications,
  } = useQuery(trpc.user.getUserNotifications.queryOptions());
  const { data: timezone, isLoading: timezoneLoading } = useQuery(
    trpc.settings.getTimezone.queryOptions(),
  );

  const markNotificationsAsRead = useMutation(
    trpc.user.markNotificationsAsRead.mutationOptions({
      onError: displayMutationError,
      onSuccess: () => {
        refetchNotifications();
      },
    }),
  );

  const unreadCount = notifications?.filter((x) => !x.read).length;

  useEffect(() => {
    if (!notificationsWire) return;

    const wire = new TurboWire(notificationsWire, { schema: realtimeSchema });

    wire.connect();

    wire.on("notification", ({ content }) => {
      try {
        if (!content) return;
        refetchNotifications();
        toast.info(content);
      } catch (error) {
        console.error(error);
      }
    });

    return () => {
      wire?.disconnect();
    };
  }, [notificationsWire, refetchNotifications]);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setOpen(true)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount ? (
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
        ) : null}
        <span className="sr-only">Notifications</span>
      </Button>

      <Panel open={open} setOpen={setOpen}>
        {notificationsLoading || timezoneLoading ? (
          <SpinnerWithSpacing />
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-4 py-3 border-b dark:border-white/10">
              <h3 className="font-semibold text-lg">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => markNotificationsAsRead.mutate()}
                    disabled={markNotificationsAsRead.isPending}
                  >
                    {markNotificationsAsRead.isPending ? (
                      <Spinner className="h-4 w-4" />
                    ) : (
                      "Mark all as read"
                    )}
                  </Button>
                ) : null}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {notifications?.length && timezone ? (
                <div className="flex flex-col divide-y dark:divide-white/10">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      timezone={timezone}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground px-4 py-8 text-center">
                  You have no new notifications.
                </div>
              )}
            </div>
          </div>
        )}
      </Panel>
    </>
  );
}
