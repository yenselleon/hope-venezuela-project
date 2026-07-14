// src/pages/admin/AprobacionPanel.jsx
// ──────────────────────────────────────────────────────────
// Approval queue panel matching Admin.dc.html design.
// Shows pending volunteers with checkbox selection,
// individual approve/reject buttons, and batch approve.
// Empty state with green checkmark when queue is clear.
// ──────────────────────────────────────────────────────────

import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useI18nStore } from '@/stores/useI18nStore';
import { useUIStore } from '@/stores/useUIStore';
import { volunteerService } from '@/services/volunteerService';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import './Admin.css';

// ── Real data ────────────────────────────────────────────────
const EMPTY_ARRAY = [];

// ── Helpers ──────────────────────────────────────────────────
function getInitials(name) {
  if (!name) return '??';
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function getFlags(vol) {
  const flags = [];
  if (vol.edad && vol.edad < 18) flags.push({ type: 'crit', label: '⚠ Menor de edad' });
  if (vol.areas?.some((a) => a.toLowerCase().includes('rescat'))) flags.push({ type: 'info', label: '★ Rescate urbano' });
  if (vol.certificaciones?.length > 0 && vol.edad >= 18) flags.push({ type: 'info', label: '★ Certificado' });
  return flags;
}

function getBorderColor(vol) {
  if (vol.edad && vol.edad < 18) return '#eeb3ae';
  if (vol.areas?.some((a) => a.toLowerCase().includes('rescat'))) return '#9dbbe0';
  return '#e7eaef';
}

// ── Approval Card ────────────────────────────────────────────
function ApprovalCard({ vol, isSelected, onSelect, onApprove, onReject, onView, t, isPending }) {
  const ini = getInitials(vol.nombre);
  const flags = getFlags(vol);
  const border = getBorderColor(vol);

  return (
    <div className="admin-card admin-apr-card" style={{ borderColor: border }}>
      <input
        type="checkbox"
        className="admin-apr-card-checkbox"
        checked={isSelected}
        onChange={() => onSelect(vol.id)}
      />
      <div className="admin-avatar" style={{ width: 40, height: 40, fontSize: 14 }}>
        {ini}
      </div>
      <div className="admin-apr-card-info">
        <div className="admin-apr-card-name-row">
          <b className="admin-apr-card-name">{vol.nombre}</b>
          {flags.map((f, i) => (
            <span key={i} className={`admin-pill admin-pill-${f.type}`}>{f.label}</span>
          ))}
        </div>
        <span className="admin-apr-card-meta">
          {vol.edad} {t('admin.apr.years')} · {vol.areas?.[0]}
          {vol.vehiculo ? ` · ${vol.vehiculo}` : ''}
          {' · '}{vol.turnos?.[0]}
          {' · '}{t('admin.apr.desiredZone')}: {vol.zonas?.[0] || '—'}
        </span>
      </div>
      <div className="admin-apr-card-btns">
        <button className="admin-btn admin-btn-ok sm" onClick={() => onApprove(vol.id)} disabled={isPending}>
          {t('admin.action.approve')}
        </button>
        <button className="admin-btn admin-btn-no sm" onClick={() => onReject(vol.id)} disabled={isPending}>
          {t('admin.action.reject')}
        </button>
        <button className="admin-btn admin-btn-ghost sm" onClick={() => onView(vol.id)}>
          {t('admin.action.view')}
        </button>
      </div>
    </div>
  );
}

// ── Empty State ──────────────────────────────────────────────
function EmptyState({ t }) {
  return (
    <div className="admin-apr-empty">
      <div className="admin-apr-empty-icon">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#2f7d4f" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </div>
      <h3>{t('admin.apr.allClear')}</h3>
      <p>{t('admin.apr.noPending')}</p>
    </div>
  );
}

// ── Main Panel ───────────────────────────────────────────────
export default function AprobacionPanel() {
  const t = useI18nStore((s) => s.t);
  const showToast = useUIStore((s) => s.showToast);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [selected, setSelected] = useState({});
  const [rejectingId, setRejectingId] = useState(null);

  // Fetch pending volunteers
  const { data: pendingResult, isLoading } = useQuery({
    queryKey: ['volunteers', { estado_voluntario: 'pendiente' }],
    queryFn: () => volunteerService.getAll({ estado_voluntario: 'pendiente', pageSize: 50 }),
    staleTime: 15_000,
  });
  const pendingList = pendingResult?.data ?? EMPTY_ARRAY;
  const pendingCount = pendingResult?.total ?? 0;

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: ({ id }) => volunteerService.update(id, { estado_voluntario: 'activo' }),
    onSuccess: (_, { name }) => {
      queryClient.invalidateQueries({ queryKey: ['volunteers'] });
      showToast(`✓ ${name} ${t('admin.toast.approved')}`);
    },
    onError: () => showToast(t('admin.toast.error'), 'error'),
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: ({ id }) => volunteerService.update(id, { estado_voluntario: 'rechazado' }),
    onSuccess: (_, { name }) => {
      queryClient.invalidateQueries({ queryKey: ['volunteers'] });
      showToast(`${name} ${t('admin.toast.rejected')}`);
    },
    onError: () => showToast(t('admin.toast.error'), 'error'),
  });

  // Batch approve
  const batchMutation = useMutation({
    mutationFn: async (ids) => {
      const promises = ids.map((id) =>
        volunteerService.update(id, { estado_voluntario: 'activo' })
      );
      return Promise.all(promises);
    },
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: ['volunteers'] });
      showToast(`✓ ${ids.length} ${t('admin.toast.batchApproved')}`);
      setSelected({});
    },
    onError: () => showToast(t('admin.toast.error'), 'error'),
  });

  const handleSelect = useCallback((id) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const handleSelectAll = useCallback(
    (e) => {
      const checked = e.target.checked;
      const next = {};
      if (checked) pendingList.forEach((v) => { next[v.id] = true; });
      setSelected(next);
    },
    [pendingList]
  );

  const selectedIds = useMemo(() =>
    Object.keys(selected).filter((k) => selected[k]),
    [selected]
  );

  const handleApprove = useCallback((id) => {
    const vol = pendingList.find((v) => v.id === id);
    approveMutation.mutate({ id, name: vol?.nombre || '' });
  }, [pendingList, approveMutation]);

  const handleReject = useCallback((id) => {
    setRejectingId(id);
  }, []);

  const executeReject = useCallback(() => {
    if (!rejectingId) return;
    const vol = pendingList.find((v) => v.id === rejectingId);
    rejectMutation.mutate({ id: rejectingId, name: vol?.nombre || '' });
    setRejectingId(null);
  }, [pendingList, rejectMutation, rejectingId]);

  const handleBatchApprove = useCallback(() => {
    if (selectedIds.length === 0) {
      showToast(t('admin.apr.selectAtLeast'));
      return;
    }
    batchMutation.mutate(selectedIds);
  }, [selectedIds, batchMutation, showToast, t]);

  const handleView = useCallback((id) => {
    navigate('/admin/voluntarios', { state: { openDrawer: id } });
  }, [navigate]);

  const allSelected = pendingList.length > 0 && pendingList.every((v) => selected[v.id]);
  const isMutating = approveMutation.isPending || rejectMutation.isPending || batchMutation.isPending;

  return (
    <div className="admin-panel admin-fade">
      {/* Header */}
      <div className="admin-apr-header">
        <span className="admin-pill admin-pill-crit" style={{ padding: '5px 12px', fontSize: 12 }}>
          {pendingCount} {t('admin.apr.inQueue')}
        </span>
        <span className="admin-apr-desc">{t('admin.apr.reviewDesc')}</span>
        <div className="admin-apr-actions">
          <label className="admin-apr-select-label">
            <input type="checkbox" checked={allSelected} onChange={handleSelectAll} />
            {t('admin.apr.selectAll')}
          </label>
          <button className="admin-btn admin-btn-ok sm" onClick={handleBatchApprove} disabled={isMutating}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            {t('admin.apr.batchApprove')}
          </button>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          {[1, 2, 3].map((i) => (
            <div className="admin-skeleton" key={i} style={{ height: 80, borderRadius: 14 }} />
          ))}
        </div>
      )}

      {/* List */}
      {!isLoading && pendingList.length > 0 && (
        <div className="admin-apr-list">
          {pendingList.map((vol) => (
            <ApprovalCard
              key={vol.id}
              vol={vol}
              isSelected={!!selected[vol.id]}
              onSelect={handleSelect}
              onApprove={handleApprove}
              onReject={handleReject}
              onView={handleView}
              t={t}
              isPending={isMutating}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && pendingList.length === 0 && <EmptyState t={t} />}

      {/* Rejection Confirmation Modal */}
      {rejectingId && (
        <ConfirmDialog
          title={t('admin.apr.confirmReject.title')}
          message={t('admin.apr.confirmReject.desc')}
          confirmText={t('admin.apr.confirmReject.action')}
          confirmVariant="no"
          onClose={() => setRejectingId(null)}
          onConfirm={executeReject}
        />
      )}
    </div>
  );
}
