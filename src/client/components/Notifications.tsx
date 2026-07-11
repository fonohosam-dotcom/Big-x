import { useNotificationStore } from '../stores/notificationStore.ts';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CheckCircle2, AlertCircle, Info, XCircle, X } from "lucide-react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Notifications() {
  const { notifications, removeNotification } = useNotificationStore();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={cn(
            "flex items-start gap-3 p-4 rounded-xl shadow-lg border w-80 translate-y-0 opacity-100 transition-all duration-300",
            {
              "bg-emerald-50 border-emerald-200 text-emerald-800": n.type === "success",
              "bg-red-50 border-red-200 text-red-800": n.type === "error",
              "bg-blue-50 border-blue-200 text-blue-800": n.type === "info",
              "bg-amber-50 border-amber-200 text-amber-800": n.type === "warning",
            }
          )}
        >
          <div className="shrink-0 mt-0.5">
            {n.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
            {n.type === "error" && <XCircle className="w-5 h-5 text-red-500" />}
            {n.type === "info" && <Info className="w-5 h-5 text-blue-500" />}
            {n.type === "warning" && <AlertCircle className="w-5 h-5 text-amber-500" />}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{n.message}</p>
          </div>
          <button
            onClick={() => removeNotification(n.id)}
            className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
