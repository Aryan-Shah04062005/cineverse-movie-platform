import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ title, message, type = 'info', duration = 4000 }) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    setToasts((prev) => [...prev, { id, title, message, type, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast Render Area */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          let Icon = Info;
          let borderColor = 'border-blue-500/30';
          let iconColor = 'text-blue-400';
          let shadow = 'shadow-[0_0_20px_rgba(59,130,246,0.2)]';

          if (toast.type === 'success') {
            Icon = CheckCircle2;
            borderColor = 'border-emerald-500/30';
            iconColor = 'text-emerald-400';
            shadow = 'shadow-[0_0_20px_rgba(16,185,129,0.2)]';
          } else if (toast.type === 'error') {
            Icon = AlertCircle;
            borderColor = 'border-rose-500/30';
            iconColor = 'text-rose-400';
            shadow = 'shadow-[0_0_20px_rgba(244,63,94,0.2)]';
          } else if (toast.type === 'warning') {
            Icon = AlertTriangle;
            borderColor = 'border-amber-500/30';
            iconColor = 'text-amber-400';
            shadow = 'shadow-[0_0_20px_rgba(245,158,11,0.2)]';
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl glass-panel border ${borderColor} ${shadow} text-zinc-100 animate-in slide-in-from-bottom-5 transition-all duration-300`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
              <div className="flex-1 min-w-0">
                {toast.title && <h4 className="text-sm font-semibold">{toast.title}</h4>}
                <p className="text-xs text-zinc-300 mt-0.5 leading-relaxed">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-zinc-400 hover:text-white p-1 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
