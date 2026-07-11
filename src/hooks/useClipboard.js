// src/hooks/useClipboard.js
// Hook para copiar texto al portapapeles con fallback seguro para entornos de testing y HTTP.

import { useState } from 'react';
import { useUIStore } from '@/stores/useUIStore';

export function useClipboard(successMessage = '¡Copiado!') {
  const [copied, setCopied] = useState(false);
  const showToast = useUIStore((s) => s.showToast);

  const copy = (text) => {
    const done = () => {
      setCopied(true);
      showToast(`${successMessage}  ${text}`);
      setTimeout(() => setCopied(false), 2000);
    };

    const fallbackCopy = () => {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.top = '0';
        ta.style.left = '0';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(ta);
        if (successful) {
          done();
        } else {
          showToast(`Copia manual: ${text}`, 'info');
        }
      } catch (err) {
        showToast(`Copia manual: ${text}`, 'info');
      }
    };

    // Intentar API moderna de Clipboard
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text)
        .then(() => {
          done();
        })
        .catch((err) => {
          fallbackCopy();
        });
    } else {
      fallbackCopy();
    }
  };

  return { copy, copied };
}
