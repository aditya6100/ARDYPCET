// ===================================================================
// TOAST NOTIFICATIONS — User feedback system
// ===================================================================

import { AlertCircle, Check, Info, AlertTriangle, X } from 'lucide-react';
import { useState, useCallback, useId } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, duration?: number) => void;
}

const icons: Record<ToastType, React.ReactNode> = {
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
            className="text-current hover:opacity-70 transition-opacity">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = 'info', duration = 3000) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, toast, removeToast };
}
