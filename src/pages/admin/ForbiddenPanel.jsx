// src/pages/admin/ForbiddenPanel.jsx
// Estado 403 — Acceso restringido.
// Mostrado cuando un Coordinador intenta acceder a rutas de Super-Admin.
// Diseño pixel-perfect según wireframe Fase 4 #1e (estado 403).

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18nStore } from '@/stores/useI18nStore';

export function ForbiddenPanel() {
  const navigate = useNavigate();
  const t = useI18nStore((s) => s.t);

  return (
    <div className="admin-forbidden">
      {/* Ícono candado rojo */}
      <div className="admin-forbidden-icon">
        🔒
      </div>

      <h2 className="admin-forbidden-title">
        {t('admin.403.title')}
      </h2>

      <p className="admin-forbidden-msg">
        {t('admin.403.msg')}
      </p>

      <button
        className="admin-btn admin-btn-pri sm"
        onClick={() => navigate('/admin')}
      >
        {t('admin.403.btn')}
      </button>
    </div>
  );
}
