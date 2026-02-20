'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'error' | 'success' | 'warning' | 'info';

interface ErrorToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
}

export function ErrorToast({
  message,
  type = 'error',
  duration = 5000,
  onClose,
}: ErrorToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration <= 0) return;

    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const bgColor = {
    error: 'bg-destructive/10 border-destructive/30 text-destructive',
    success: 'bg-green-600/10 border-green-600/30 text-green-600',
    warning: 'bg-amber-600/10 border-amber-600/30 text-amber-600',
    info: 'bg-blue-600/10 border-blue-600/30 text-blue-600',
  }[type];

  const Icon = {
    error: AlertCircle,
    success: CheckCircle,
    warning: AlertTriangle,
    info: AlertCircle,
  }[type];

  return (
    <div className={`fixed bottom-4 right-4 max-w-md ${bgColor} border rounded-lg p-4 flex items-start gap-3 animate-in slide-in-from-bottom-5 duration-300 z-50`}>
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <p className="text-sm flex-1">{message}</p>
      <button
        onClick={() => {
          setIsVisible(false);
          onClose?.();
        }}
        className="flex-shrink-0 opacity-70 hover:opacity-100"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function useToast() {
  const [toasts, setToasts] = useState<
    (ErrorToastProps & { id: string })[]
  >([]);

  const showToast = (
    message: string,
    type: ToastType = 'error',
    duration: number = 5000
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return {
    toasts,
    showToast,
    removeToast,
    showError: (message: string, duration?: number) =>
      showToast(message, 'error', duration),
    showSuccess: (message: string, duration?: number) =>
      showToast(message, 'success', duration),
    showWarning: (message: string, duration?: number) =>
      showToast(message, 'warning', duration),
  };
}
