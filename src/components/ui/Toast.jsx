// src/components/ui/Toast.jsx
// Toast flotante para notificaciones rápidas de éxito, información o error.
// Lee el estado del store global `useUIStore`.
// Estilo premium con fondo oscuro, borde sutil y sombra difusa.

import React from 'react';
import { useUIStore } from '@/stores/useUIStore';
import { cn } from '@/utils/helpers';

export function Toast() {
  const toast = useUIStore((s) => s.toast);

  if (!toast) return null;

  return (
    <div
      id="toast"
      className={cn(
        "fixed left-1/2 bottom-8 -translate-x-1/2 z-[100] flex items-center gap-2",
        "px-5 py-3 rounded-full font-semibold text-xs text-white bg-[#00284f] shadow-2xl border border-white/10",
        "transition-all duration-300 ease-out animate-[fade_0.2s_ease]"
      )}
      style={{
        boxShadow: '0 10px 25px -5px rgba(0, 51, 102, 0.3), 0 8px 10px -6px rgba(0, 51, 102, 0.3)'
      }}
    >
      {toast.type === 'success' && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7bd88f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
          <path d="M20 6 9 17l-5-5"/>
        </svg>
      )}
      {toast.type === 'error' && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
      )}
      <span id="toast-msg" className="whitespace-nowrap select-none">{toast.message}</span>
    </div>
  );
}
