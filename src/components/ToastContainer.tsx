import { AlertCircle, AlertTriangle, Check, Info, X } from 'lucide-react';
import type { ReactNode } from 'react';
import type { Toast, ToastType } from '../hooks/useToast';

const icons: Record<ToastType, ReactNode> = {
  success: <Check className="w-4 h-4 text-green-400" />,
  error: <AlertCircle className="w-4 h-4 text-red-400" />,
  warning: <AlertTriangle className="w-4 h-4 text-yellow-400" />,
  info: <Info className="w-4 h-4 text-blue-400" />,
};

const bgColors: Record<ToastType, string> = {
  success: 'bg-green-950/80 border-green-500/30 text-green-100',
  error: 'bg-red-950/80 border-red-500/30 text-red-100',
  warning: 'bg-yellow-950/80 border-yellow-500/30 text-yellow-100',
  info: 'bg-blue-950/80 border-blue-500/30 text-blue-100',
};

export function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-md animation-fade-in ${bgColors[toast.type]}`}
          role="alert">
          {icons[toast.type]}
          <p className="text-sm font-medium flex-1">{toast.message}</p>
          <button
            onClick={() => onRemove(toast.id)}
            className="text-current hover:opacity-70 transition-opacity"
            aria-label="Dismiss notification">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
