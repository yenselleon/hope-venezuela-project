// src/pages/admin/VoluntariosPanel.jsx
// ──────────────────────────────────────────────────────────
// Volunteer list panel with grid-table, filter chips,
// pagination, and slide-in drawer for detail view.
// Matches Admin.dc.html design pixel-by-pixel.
// ──────────────────────────────────────────────────────────

import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { useI18nStore } from '@/stores/useI18nStore';
import { useUIStore } from '@/stores/useUIStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { volunteerService } from '@/services/volunteerService';
import { ExportModal } from '@/components/admin/ExportModal';
import { AssignModal } from '@/components/admin/AssignModal';
import './Admin.css';

// ── Demo data for fallback ───────────────────────────────────
const DEMO_VOLUNTEERS = [
  { id: 1, nombre: 'María González', cedula: '12345678', telefono: '0412-5550101', edad: 34, genero: 'Femenino', areas: ['Salud'], certificaciones: ['Primeros auxilios'], vehiculo: '', zonas: ['Vargas'], zona_asignada: 'Vargas · La Guaira', estado_voluntario: 'pendiente', turnos: ['Lun–Vie · mañana'], created_at: '2025-07-01T10:00:00Z' },
  { id: 2, nombre: 'José Pérez', cedula: '14521122', telefono: '0414-5550110', edad: 41, genero: 'Masculino', areas: ['Transporte'], certificaciones: [], vehiculo: 'PickUp', zonas: ['Miranda'], zona_asignada: 'Miranda · San Antonio', estado_voluntario: 'activo', turnos: ['Fines de semana'], created_at: '2025-07-01T11:00:00Z' },
  { id: 3, nombre: 'Ana Rodríguez', cedula: '29019033', telefono: '0424-5550133', edad: 16, genero: 'Femenino', areas: ['Familias'], certificaciones: [], vehiculo: '', zonas: ['Aragua'], zona_asignada: '', estado_voluntario: 'pendiente', turnos: ['Tardes'], created_at: '2025-07-01T12:00:00Z' },
  { id: 4, nombre: 'Luis Martínez', cedula: '18774571', telefono: '0412-5550144', edad: 29, genero: 'Masculino', areas: ['Logística'], certificaciones: [], vehiculo: 'Carro', zonas: ['Los Teques'], zona_asignada: 'Miranda · Los Teques', estado_voluntario: 'activo', turnos: ['Lun–Sáb · tarde'], created_at: '2025-07-01T13:00:00Z' },
  { id: 5, nombre: 'Carla Torres', cedula: '20112290', telefono: '0416-5550155', edad: 38, genero: 'Femenino', areas: ['Salud'], certificaciones: ['Primeros auxilios'], vehiculo: '', zonas: ['Vargas'], zona_asignada: 'Vargas · La Guaira', estado_voluntario: 'aprobado', turnos: ['Noche'], created_at: '2025-07-01T14:00:00Z' },
  { id: 6, nombre: 'Pedro Silva', cedula: '10993410', telefono: '0412-5550166', edad: 44, genero: 'Masculino', areas: ['Soporte a rescatistas'], certificaciones: ['Rescate urbano'], vehiculo: 'PickUp', zonas: ['Vargas'], zona_asignada: '', estado_voluntario: 'pendiente', turnos: ['24h · guardias'], created_at: '2025-07-01T15:00:00Z' },
  { id: 7, nombre: 'Marta León', cedula: '22781540', telefono: '0414-5550177', edad: 31, genero: 'Femenino', areas: ['Logística'], certificaciones: [], vehiculo: '', zonas: ['Miranda'], zona_asignada: '', estado_voluntario: 'pendiente', turnos: ['Lun–Vie · mañana'], created_at: '2025-07-01T16:00:00Z' },
  { id: 8, nombre: 'Jorge Díaz', cedula: '16340982', telefono: '0424-5550188', edad: 37, genero: 'Masculino', areas: ['Transporte'], certificaciones: [], vehiculo: 'Camión', zonas: ['Vargas'], zona_asignada: '', estado_voluntario: 'pendiente', turnos: ['Fines de semana'], created_at: '2025-07-01T17:00:00Z' },
];

// ── Helper: initials from name ───────────────────────────────
function getInitials(name) {
  if (!name) return '??';
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

// ── Helper: mask cédula ──────────────────────────────────────
function maskCedula(ced) {
  if (!ced) return '—';
  return `V-••••${ced.slice(-4)}`;
}

function maskTelefono(tel) {
  if (!tel) return '—';
  return `${tel.slice(0, 4)}-•••••••`;
}

// ── Status pill ──────────────────────────────────────────────
function StatusPill({ estado, t }) {
  if (estado === 'activo') return <span className="admin-pill admin-pill-ok">{t('admin.status.activo')}</span>;
  if (estado === 'aprobado') return <span className="admin-pill admin-pill-info">{t('admin.status.aprobado')}</span>;
  if (estado === 'rechazado') return <span className="admin-pill admin-pill-crit">{t('admin.status.rechazado')}</span>;
  return <span className="admin-pill admin-pill-warn">{t('admin.status.pendiente')}</span>;
}

// ── Flag pills ───────────────────────────────────────────────
function VolFlags({ vol }) {
  const isMinor = vol.edad && vol.edad < 18;
  const hasCert = vol.certificaciones && vol.certificaciones.length > 0;

  return (
    <>
      {isMinor && <span className="admin-pill admin-pill-crit" style={{ padding: '1px 6px' }}>menor</span>}
      {!isMinor && hasCert && <span className="admin-pill admin-pill-info" style={{ padding: '1px 6px' }}>★</span>}
    </>
  );
}

// ── Drawer Component ─────────────────────────────────────────
function VolunteerDrawer({ volunteer, onClose, revealed, onToggleReveal, onApprove, onReject, onAssign, t, isPending }) {
  if (!volunteer) return null;
  const vol = volunteer;
  const ini = getInitials(vol.nombre);
  const isMinor = vol.edad && vol.edad < 18;
  const hasCert = vol.certificaciones && vol.certificaciones.length > 0;
  const isRescue = vol.areas?.some((a) => a.toLowerCase().includes('rescat'));
  const zonDisplay = vol.zona_asignada || '';

  return (
    <div className={`admin-drawer on`}>
      {/* Header */}
      <div className="admin-drawer-header">
        <span className="admin-th">{t('admin.detail.title')}</span>
        <button className="admin-drawer-close" onClick={onClose}>✕</button>
      </div>

      {/* Body */}
      <div className="admin-drawer-body">
        {/* Avatar + name + pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="admin-avatar" style={{ width: 52, height: 52, fontSize: 18 }}>{ini}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <b style={{ font: '800 17px Inter, system-ui, sans-serif', color: '#111827' }}>{vol.nombre}</b>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              <StatusPill estado={vol.estado_voluntario} t={t} />
              {isMinor && <span className="admin-pill admin-pill-crit">⚠ {t('admin.flag.menor')}</span>}
              {isRescue && <span className="admin-pill admin-pill-info">★ {t('admin.flag.rescate')}</span>}
            </div>
          </div>
        </div>

        {/* Sensitive data card */}
        <div className="admin-drawer-sensitive">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="admin-th">{t('admin.detail.sensitive')}</span>
            <button className="admin-btn admin-btn-ghost xs" onClick={onToggleReveal}>
              {revealed ? '🙈 Ocultar' : '👁 Revelar'}
            </button>
          </div>
          <div className="admin-drawer-data-row">
            <span className="admin-drawer-data-label">{t('admin.field.cedula')}</span>
            <span className={revealed ? 'admin-td' : 'admin-mask'}>
              {revealed ? `V-${vol.cedula}` : maskCedula(vol.cedula)}
            </span>
          </div>
          <div className="admin-drawer-data-row">
            <span className="admin-drawer-data-label">{t('admin.field.telefono')}</span>
            <span className={revealed ? 'admin-td' : 'admin-mask'}>
              {revealed ? vol.telefono : maskTelefono(vol.telefono)}
            </span>
          </div>
          <div className="admin-drawer-data-row">
            <span className="admin-drawer-data-label">{t('admin.detail.ageGender')}</span>
            <span className="admin-td">{vol.edad} · {vol.genero}</span>
          </div>
        </div>

        {/* Areas & certifications */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <span className="admin-th">{t('admin.detail.areas')}</span>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {vol.areas?.map((a) => (
              <span className="admin-pill admin-pill-info" key={a}>{a}</span>
            ))}
            {hasCert
              ? vol.certificaciones.map((c) => <span className="admin-pill admin-pill-neutral" key={c}>{c}</span>)
              : <span style={{ font: '500 12px Inter', color: '#b3b8c0' }}>{t('admin.detail.noCerts')}</span>
            }
            {vol.vehiculo && <span className="admin-pill admin-pill-neutral">{t('admin.field.vehiculo')}: {vol.vehiculo}</span>}
          </div>
        </div>

        {/* Availability */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <span className="admin-th">{t('admin.detail.disponibilidad')}</span>
          <span className="admin-td">{vol.turnos?.join(', ') || '—'}</span>
        </div>

        {/* Zone assigned */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          <span className="admin-th">{t('admin.detail.zoneAssigned')}</span>
          <div
            className="admin-field cursor-pointer hover:border-navy transition-colors"
            style={{ height: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            onClick={onAssign}
          >
            {zonDisplay ? zonDisplay : <span style={{ color: '#b3b8c0' }}>{t('admin.field.none')}</span>}
            <span style={{ color: '#9aa0a6' }}>▾</span>
          </div>
          <span style={{ font: '500 11px Inter', color: '#8a91a0' }}>
            {t('admin.detail.desiredZone')}: {vol.zonas?.join(', ') || '—'}
          </span>
        </div>
      </div>

      {/* Footer actions */}
      <div className="admin-drawer-footer">
        {vol.estado_voluntario === 'pendiente' ? (
          <>
            <button className="admin-btn admin-btn-ok sm" style={{ flex: 1 }} onClick={onApprove} disabled={isPending}>
              {t('admin.action.approve')}
            </button>
            <button className="admin-btn admin-btn-no sm" style={{ flex: 1 }} onClick={onReject} disabled={isPending}>
              {t('admin.action.reject')}
            </button>
          </>
        ) : (
          <button className="admin-btn admin-btn-ghost sm" style={{ flex: 1 }} onClick={onAssign}>
            {t('admin.action.editStatus')}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Chip Filter Definitions ──────────────────────────────────
const FILTER_CHIPS = [
  { key: 'area-Salud', type: 'area', value: 'Salud', label: 'Salud' },
  { key: 'area-Logística', type: 'area', value: 'Logística', label: 'Logística' },
  { key: 'area-Transporte', type: 'area', value: 'Transporte', label: 'Transporte' },
  { key: 'area-Familias', type: 'area', value: 'Familias', label: 'Familias' },
  { key: 'cert', type: 'cert', value: 'cert', label: '★ Certificados' },
  { key: 'estado-pendiente', type: 'estado', value: 'pendiente', label: 'Estado: pendiente' },
  { key: 'estado-activo', type: 'estado', value: 'activo', label: 'Estado: activo' },
];

// ── Main Panel ───────────────────────────────────────────────
export default function VoluntariosPanel() {
  const t = useI18nStore((s) => s.t);
  const showToast = useUIStore((s) => s.showToast);
  const role = useAuthStore((s) => s.role);
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const location = useLocation();

  // Local state
  const [activeFilters, setActiveFilters] = useState({});
  const [selectedId, setSelectedId] = useState(() => location.state?.openDrawer || null);
  const [revealed, setRevealed] = useState(false);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Toggle filter chip
  const toggleFilter = useCallback((key) => {
    setActiveFilters((prev) => ({ ...prev, [key]: !prev[key] }));
    setPage(1);
  }, []);

  // Build query filters from active chips
  const queryFilters = useMemo(() => {
    const f = { page, pageSize: 15 };
    // Area filter (take first active area)
    const activeAreas = FILTER_CHIPS.filter((c) => c.type === 'area' && activeFilters[c.key]);
    if (activeAreas.length > 0) {
      let areaVal = activeAreas[0].value;
      if (areaVal === 'Logística') areaVal = 'Logística / Acopio';
      if (areaVal === 'Familias') areaVal = 'Recreación / Familias';
      f.area = areaVal;
    }
    // Status filter
    const activeStatus = FILTER_CHIPS.filter((c) => c.type === 'estado' && activeFilters[c.key]);
    if (activeStatus.length > 0) f.estado_voluntario = activeStatus[0].value;
    // Search
    if (searchTerm.trim()) f.search = searchTerm.trim();
    return f;
  }, [activeFilters, page, searchTerm]);

  // Fetch volunteers
  const { data: volResult, isLoading, isError } = useQuery({
    queryKey: ['volunteers', queryFilters],
    queryFn: () => volunteerService.getAll(queryFilters),
    staleTime: 15_000,
    placeholderData: (prev) => prev,
  });

  // Use real data or demo fallback
  const volunteers = volResult?.data ?? DEMO_VOLUNTEERS;
  const totalCount = volResult?.total ?? DEMO_VOLUNTEERS.length;
  const totalPages = volResult?.totalPages ?? 1;

  // Client-side cert filter (Supabase may not support this directly)
  const filteredVolunteers = useMemo(() => {
    const certActive = activeFilters['cert'];
    if (!certActive) return volunteers;
    return volunteers.filter((v) => v.certificaciones && v.certificaciones.length > 0);
  }, [volunteers, activeFilters]);

  // Selected volunteer query
  const { data: dbSelectedVol } = useQuery({
    queryKey: ['volunteer', selectedId],
    queryFn: () => volunteerService.getById(selectedId),
    enabled: !!selectedId && typeof selectedId === 'string' && selectedId.length > 20,
    staleTime: 30_000,
  });

  // Selected volunteer
  const selectedVol = useMemo(() => {
    if (!selectedId) return null;
    if (dbSelectedVol) return dbSelectedVol;
    return filteredVolunteers.find((v) => v.id === selectedId) || null;
  }, [selectedId, dbSelectedVol, filteredVolunteers]);

  // Mutations
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }) => volunteerService.update(id, updates),
    onSuccess: (_, { updates }) => {
      queryClient.invalidateQueries({ queryKey: ['volunteers'] });
      const name = selectedVol?.nombre || '';
      if (updates.estado_voluntario === 'activo') {
        showToast(`✓ ${name} ${t('admin.toast.approved')}`);
      } else {
        showToast(`${name} ${t('admin.toast.rejected')}`);
      }
      closeDrawer();
    },
    onError: () => {
      showToast(t('admin.toast.error'), 'error');
    },
  });

  const openDrawer = useCallback((id) => {
    setSelectedId(id);
    setRevealed(false);
  }, []);

  const closeDrawer = useCallback(() => {
    setSelectedId(null);
    setRevealed(false);
  }, []);

  const handleApprove = useCallback(() => {
    if (!selectedId) return;
    updateMutation.mutate({ id: selectedId, updates: { estado_voluntario: 'activo' } });
  }, [selectedId, updateMutation]);

  const handleReject = useCallback(() => {
    if (!selectedId) return;
    updateMutation.mutate({ id: selectedId, updates: { estado_voluntario: 'rechazado' } });
  }, [selectedId, updateMutation]);

  const handleToggleReveal = useCallback(() => {
    setRevealed((v) => !v);
    showToast(revealed ? t('admin.toast.dataHidden') : t('admin.toast.dataRevealed'));
  }, [revealed, showToast, t]);

  const handleExport = useCallback(() => {
    if (volunteers.length === 0) return;
    setShowExportModal(true);
  }, [volunteers]);

  // Listen for topbar search input changes
  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  }, []);

  // Page buttons
  const pageNumbers = useMemo(() => {
    const pages = [];
    for (let i = 1; i <= Math.min(totalPages, 5); i++) pages.push(i);
    return pages;
  }, [totalPages]);

  return (
    <div className="admin-panel admin-fade">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Header */}
        <div className="admin-vol-header">
          <span className="admin-vol-count">
            <b>{totalCount}</b> {t('admin.vol.registros')}
          </span>
          <div className="admin-vol-actions">
            {role === 'super_admin' && (
              <button className="admin-btn admin-btn-ghost sm" onClick={handleExport}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <path d="M7 10l5 5 5-5M12 15V3" />
                </svg>
                {t('admin.vol.export')}
              </button>
            )}
          </div>
        </div>

        {/* Search (visible on mobile since topbar search hides) */}
        <div className="admin-top-search" style={{ display: 'none' }}>
          <input
            className="admin-field"
            placeholder={t('admin.search')}
            value={searchTerm}
            onChange={handleSearch}
            style={{ height: 38, paddingLeft: 34, fontSize: 13 }}
          />
        </div>

        {/* Filter chips */}
        <div className="admin-vol-filters">
          {FILTER_CHIPS.map((chip) => (
            <button
              key={chip.key}
              className={`admin-chip${activeFilters[chip.key] ? ' on' : ''}`}
              onClick={() => toggleFilter(chip.key)}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Table card */}
        <div className="admin-card" style={{ overflow: 'hidden', padding: 0 }}>
          {/* Table header */}
          <div className="admin-table-head">
            <span className="admin-th">{t('admin.table.nombre')}</span>
            <span className="admin-th admin-col-hide">{t('admin.table.cedula')}</span>
            <span className="admin-th admin-col-hide">{t('admin.table.areas')}</span>
            <span className="admin-th admin-col-hide">{t('admin.table.zona')}</span>
            <span className="admin-th">{t('admin.table.estado')}</span>
            <span />
          </div>

          {/* Loading skeleton */}
          {isLoading && !volResult && (
            <div>
              {[1, 2, 3, 4, 5].map((i) => (
                <div className="admin-skeleton admin-skeleton-row" key={i} />
              ))}
            </div>
          )}

          {/* Error */}
          {isError && (
            <div className="admin-table-empty">{t('admin.table.error')}</div>
          )}

          {/* Rows */}
          {!isLoading && !isError && filteredVolunteers.length > 0 && (
            <div>
              {filteredVolunteers.map((vol) => {
                const ini = getInitials(vol.nombre);
                const zonDisplay = vol.zona_asignada;
                return (
                  <div
                    key={vol.id}
                    className={`admin-table-row${selectedId === vol.id ? ' sel' : ''}`}
                    onClick={() => openDrawer(vol.id)}
                  >
                    {/* Name cell */}
                    <div className="admin-table-name-cell">
                      <div className="admin-avatar" style={{ width: 30, height: 30 }}>{ini}</div>
                      <span className="admin-td admin-td--name">{vol.nombre}</span>
                      <VolFlags vol={vol} />
                    </div>

                    {/* Cédula */}
                    <span className="admin-mask admin-col-hide">{maskCedula(vol.cedula)}</span>

                    {/* Area */}
                    <span className="admin-td admin-col-hide">{vol.areas?.[0] || '—'}</span>

                    {/* Zone */}
                    <span className="admin-td admin-col-hide">
                      {zonDisplay ? zonDisplay.split(' · ')[0] : <span style={{ color: '#b3b8c0' }}>{t('admin.field.none')}</span>}
                    </span>

                    {/* Status */}
                    <StatusPill estado={vol.estado_voluntario} t={t} />

                    {/* Chevron */}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b3b8c0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !isError && filteredVolunteers.length === 0 && (
            <div className="admin-table-empty">{t('admin.vol.empty')}</div>
          )}

          {/* Pagination footer */}
          <div className="admin-table-footer">
            <span className="admin-table-pag-info">
              {t('admin.vol.showing')} {filteredVolunteers.length} {t('admin.vol.of')} {totalCount}
            </span>
            <div className="admin-table-pag-btns">
              <button
                className="admin-btn admin-btn-soft xs"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                ‹
              </button>
              {pageNumbers.map((p) => (
                <button
                  key={p}
                  className={`admin-btn xs ${p === page ? 'admin-btn-active-page' : 'admin-btn-soft'}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
              <button
                className="admin-btn admin-btn-soft xs"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                ›
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Scrim ── */}
      <div
        className={`admin-scrim${selectedId ? ' on' : ''}`}
        onClick={closeDrawer}
      />

      {/* ── Drawer ── */}
      {selectedId && (
        <VolunteerDrawer
          volunteer={selectedVol}
          onClose={closeDrawer}
          revealed={revealed}
          onToggleReveal={handleToggleReveal}
          onApprove={handleApprove}
          onReject={handleReject}
          onAssign={() => setShowAssignModal(true)}
          t={t}
          isPending={updateMutation.isPending}
        />
      )}

      {/* ── Assign Modal ── */}
      {showAssignModal && selectedVol && (
        <AssignModal
          volunteer={selectedVol}
          onClose={() => setShowAssignModal(false)}
        />
      )}

      {/* ── Export Modal ── */}
      {showExportModal && (
        <ExportModal
          volunteers={filteredVolunteers}
          userEmail={user?.email || 'unknown'}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
}
