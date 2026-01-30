import { useState } from "react";
import { Bell } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function NotificationBell({ userEmail }) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', userEmail],
    queryFn: async () => {
      const notifs = await base44.entities.Notification.filter(
        { user_email: userEmail },
        "-created_date",
        50
      );
      return notifs;
    },
    enabled: !!userEmail,
    refetchInterval: 30000
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notifId) => base44.entities.Notification.update(notifId, { is_read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const notifIcons = {
    new_prediction: "⚽",
    match_starting: "⏰",
    prediction_result: "🎯",
    badge_earned: "🏆"
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="w-5 h-5 text-slate-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 top-12 w-80 max-h-96 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50"
            >
              <div className="p-4 border-b border-slate-700">
                <h3 className="font-bold text-white">Notifications</h3>
              </div>

              <div className="overflow-y-auto max-h-80">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    Aucune notification
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        if (!notif.is_read) markAsReadMutation.mutate(notif.id);
                      }}
                      className={`p-4 border-b border-slate-700/50 cursor-pointer hover:bg-slate-700/30 transition-colors ${
                        !notif.is_read ? "bg-cyan-500/5" : ""
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="text-2xl">{notifIcons[notif.type]}</div>
                        <div className="flex-1">
                          <p className="font-semibold text-white text-sm">{notif.title}</p>
                          <p className="text-xs text-slate-400 mt-1">{notif.message}</p>
                          <p className="text-xs text-slate-500 mt-2">
                            {format(new Date(notif.created_date), "dd MMM à HH:mm", { locale: fr })}
                          </p>
                        </div>
                        {!notif.is_read && (
                          <div className="w-2 h-2 bg-cyan-500 rounded-full mt-1" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}