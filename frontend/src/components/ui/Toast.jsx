import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import useToastStore from '../../store/toastStore';

const Toast = () => {
  const { message, type, isOpen, hideToast } = useToastStore();

  if (!isOpen || !message) return null;

  const styles = {
    success: 'bg-emerald-600/90 border-emerald-400 text-white',
    error: 'bg-red-600/90 border-red-400 text-white',
    info: 'bg-slate-800/95 border-slate-500 text-slate-50',
  }[type] || styles?.info;

  const Icon = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
  }[type] || Info;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center px-4 py-8 pointer-events-none sm:items-start sm:justify-end">
      <div
        className={`pointer-events-auto flex max-w-sm items-start gap-3 rounded-xl border px-4 py-3 shadow-xl shadow-black/40 backdrop-blur-md ${styles} animate-slide-up`}
      >
        <div className="mt-0.5">
          <Icon size={20} className="opacity-90" />
        </div>
        <div className="text-sm font-medium leading-snug">
          {message}
        </div>
        <button
          onClick={hideToast}
          className="ml-2 text-xs font-semibold uppercase tracking-wide text-slate-100/70 hover:text-white"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default Toast;

