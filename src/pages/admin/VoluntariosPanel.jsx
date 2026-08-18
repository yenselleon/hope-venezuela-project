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

const EMPTY_ARRAY = [];

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

// ── Availability Parser ──────────────────────────────────────
const WEEK_DAYS = [
  { key: 'lun', labelKey: 'admin.detail.day.lun', match: ['lun', 'lunes'] },
  { key: 'mar', labelKey: 'admin.detail.day.mar', match: ['mar', 'martes'] },
  { key: 'mie', labelKey: 'admin.detail.day.mie', match: ['mie', 'mié', 'miércoles', 'miercoles'] },
  { key: 'jue', labelKey: 'admin.detail.day.jue', match: ['jue', 'jueves'] },
  { key: 'vie', labelKey: 'admin.detail.day.vie', match: ['vie', 'viernes'] },
  { key: 'sab', labelKey: 'admin.detail.day.sab', match: ['sab', 'sáb', 'sábado', 'sabado'] },
  { key: 'dom', labelKey: 'admin.detail.day.dom', match: ['dom', 'domingo'] },
];

function parseAvailabilityMap(turnos) {
  const map = { lun: [], mar: [], mie: [], jue: [], vie: [], sab: [], dom: [] };
  if (!Array.isArray(turnos) || turnos.length === 0) return map;

  turnos.forEach((raw) => {
    if (!raw) return;
    const str = String(raw).toLowerCase().trim();
    const parts = str.split(':');
    if (parts.length === 2) {
      const dCode = parts[0];
      const sCode = parts[1];
      const day = WEEK_DAYS.find((d) => d.match.includes(dCode));
      if (day) {
        let badge = { code: 'M', cls: 'admin-shift-badge-m', labelKey: 'admin.detail.shift.m' };
        if (sCode.startsWith('m')) badge = { code: '☀️ M', cls: 'admin-shift-badge-m', labelKey: 'admin.detail.shift.m' };
        else if (sCode.startsWith('t')) badge = { code: '🌤️ T', cls: 'admin-shift-badge-t', labelKey: 'admin.detail.shift.t' };
        else if (sCode.startsWith('n')) badge = { code: '🌙 N', cls: 'admin-shift-badge-n', labelKey: 'admin.detail.shift.n' };
        else if (sCode.includes('24')) badge = { code: '⚡ 24h', cls: 'admin-shift-badge-24h', labelKey: 'admin.detail.shift.24h' };
        if (!map[day.key].some((b) => b.code === badge.code)) map[day.key].push(badge);
        return;
      }
    }

    WEEK_DAYS.forEach((day) => {
      if (day.match.some((m) => str.includes(m))) {
        let badge = { code: '✓', cls: 'admin-shift-badge-m', labelKey: 'admin.detail.shift.m' };
        if (str.includes('mañana') || str.includes('manana')) badge = { code: '☀️ M', cls: 'admin-shift-badge-m', labelKey: 'admin.detail.shift.m' };
        else if (str.includes('tarde')) badge = { code: '🌤️ T', cls: 'admin-shift-badge-t', labelKey: 'admin.detail.shift.t' };
        else if (str.includes('noche')) badge = { code: '🌙 N', cls: 'admin-shift-badge-n', labelKey: 'admin.detail.shift.n' };
        else if (str.includes('24')) badge = { code: '⚡ 24h', cls: 'admin-shift-badge-24h', labelKey: 'admin.detail.shift.24h' };
        if (!map[day.key].some((b) => b.code === badge.code)) map[day.key].push(badge);
      }
    });
  });

  return map;
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

  // Location string
  const locationParts = [vol.municipio, vol.estado].filter(Boolean).join(', ');
  const residenceText = locationParts || vol.pais || '';

  // Availability map
  const availMap = parseAvailabilityMap(vol.turnos);

  return (
    <div className={`admin-drawer on`}>
      {/* Header */}
      <div className="admin-drawer-header">
        <span className="admin-th">{t('admin.detail.title')}</span>
        <button className="admin-drawer-close" onClick={onClose}>✕</button>
      </div>

      {/* Body */}
      <div className="admin-drawer-body">
        {/* Avatar + name + profession + pills */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div className="admin-avatar" style={{ width: 54, height: 54, fontSize: 19 }}>{ini}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
            <b style={{ font: '800 17px Inter, system-ui, sans-serif', color: '#111827', lineHeight: 1.2 }}>{vol.nombre}</b>
            {vol.profesion && (
              <span style={{ font: '600 12.5px Inter', color: '#4b5563' }}>💼 {vol.profesion}</span>
            )}
            {residenceText && (
              <span style={{ font: '500 11.5px Inter', color: '#6B7280' }}>📍 {residenceText}</span>
            )}
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 3 }}>
              <StatusPill estado={vol.estado_voluntario} t={t} />
              {isMinor && <span className="admin-pill admin-pill-crit">⚠ {t('admin.flag.menor')}</span>}
              {isRescue && <span className="admin-pill admin-pill-info">★ {t('admin.flag.rescate')}</span>}
              {vol.extranjero && <span className="admin-pill admin-pill-neutral">🌐 {vol.pais || 'Exterior'}</span>}
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
            <span className="admin-drawer-data-label">{t('admin.table.cedula')}</span>
            <span className={revealed ? 'admin-td' : 'admin-mask'}>
              {revealed ? `V-${vol.cedula}` : maskCedula(vol.cedula)}
            </span>
          </div>
          <div className="admin-drawer-data-row">
            <span className="admin-drawer-data-label">{t('campo.telefono')}</span>
            <span className={revealed ? 'admin-td' : 'admin-mask'}>
              {revealed ? vol.telefono : maskTelefono(vol.telefono)}
            </span>
          </div>
          <div className="admin-drawer-data-row">
            <span className="admin-drawer-data-label">{t('admin.detail.ageGender')}</span>
            <span className="admin-td">{vol.edad ? `${vol.edad} años` : '—'} · {vol.genero || '—'}</span>
          </div>
        </div>

        {/* Áreas y Capacidades */}
        <div className="admin-drawer-section">
          <span className="admin-th">🧰 {t('admin.detail.areas')}</span>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {vol.areas?.map((a) => (
              <span className="admin-pill admin-pill-info" key={a}>{a}</span>
            ))}
          </div>
          {vol.especialidad_salud && (
            <div className="admin-drawer-data-row">
              <span className="admin-drawer-data-label">{t('admin.detail.especialidad')}:</span>
              <span className="admin-td" style={{ fontStyle: 'italic' }}>{vol.especialidad_salud}</span>
            </div>
          )}
          {vol.grado_academico && (
            <div className="admin-drawer-data-row">
              <span className="admin-drawer-data-label">{t('admin.detail.grado')}:</span>
              <span className="admin-td">{vol.grado_academico}</span>
            </div>
          )}
          {hasCert ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span className="admin-drawer-data-label">{t('admin.detail.certificaciones')}:</span>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {vol.certificaciones.map((c) => (
                  <span className="admin-pill admin-pill-neutral" key={c}>★ {c}</span>
                ))}
              </div>
            </div>
          ) : (
            <span style={{ font: '500 12px Inter', color: '#b3b8c0' }}>{t('admin.detail.noCerts')}</span>
          )}
          {vol.vehiculo && (
            <div className="admin-drawer-data-row">
              <span className="admin-drawer-data-label">🚗 {t('admin.detail.vehiculo')}:</span>
              <span className="admin-td">{vol.vehiculo}</span>
            </div>
          )}
        </div>

        {/* Disponibilidad Semanal Grid */}
        <div className="admin-drawer-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="admin-th">📅 {t('admin.detail.disponibilidad')}</span>
            <span style={{ font: '500 10px Inter', color: '#8a91a0' }}>☀️ M  🌤️ T  🌙 N</span>
          </div>

          <div className="admin-avail-grid">
            {WEEK_DAYS.map((day) => {
              const shifts = availMap[day.key];
              const isAvailable = shifts.length > 0;
              return (
                <div key={day.key} className={`admin-avail-day${isAvailable ? ' on' : ''}`}>
                  <span className="admin-avail-day-name">{t(day.labelKey)}</span>
                  <div className="admin-avail-shifts">
                    {isAvailable ? (
                      shifts.map((s, idx) => (
                        <span key={idx} className={`admin-shift-badge ${s.cls}`}>
                          {s.code}
                        </span>
                      ))
                    ) : (
                      <span style={{ color: '#c5cad3', fontSize: 10 }}>—</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Modalidad, Movilización y Hospedaje */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
            {vol.duracion && (
              <div className="admin-drawer-data-row">
                <span className="admin-drawer-data-label">⏳ {t('admin.detail.duracion')}:</span>
                <span className="admin-td">
                  {vol.duracion} {vol.duracion_dias ? `(${vol.duracion_dias} días)` : ''}
                </span>
              </div>
            )}
            {vol.movilizacion && (
              <div className="admin-drawer-data-row">
                <span className="admin-drawer-data-label">🚶 {t('admin.detail.movilizacion')}:</span>
                <span className="admin-td">{vol.movilizacion}</span>
              </div>
            )}
            {vol.hospedaje && (
              <div className="admin-drawer-data-row">
                <span className="admin-drawer-data-label">🏠 {t('admin.detail.hospedaje')}:</span>
                <span className="admin-td">{vol.hospedaje}</span>
              </div>
            )}
            {vol.apoyo_logistico && vol.apoyo_logistico.length > 0 && (
              <div className="admin-drawer-data-row">
                <span className="admin-drawer-data-label">📦 {t('admin.detail.apoyoLogistico')}:</span>
                <span className="admin-td">{vol.apoyo_logistico.join(', ')}</span>
              </div>
            )}
            {vol.familia && vol.familia.length > 0 && (
              <div className="admin-drawer-data-row">
                <span className="admin-drawer-data-label">👥 {t('admin.detail.familia')}:</span>
                <span className="admin-td">{vol.familia.join(', ')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Zone assigned */}
        <div className="admin-drawer-section">
          <span className="admin-th">📍 {t('admin.detail.zoneAssigned')}</span>
          <div
            className="admin-field cursor-pointer hover:border-navy transition-colors"
            style={{ height: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            onClick={onAssign}
          >
            {zonDisplay ? zonDisplay : <span style={{ color: '#b3b8c0' }}>{t('admin.table.sinAsignar')}</span>}
            <span style={{ color: '#9aa0a6' }}>▾</span>
          </div>
          <span style={{ font: '500 11px Inter', color: '#8a91a0' }}>
            {t('admin.detail.desiredZone')}: {vol.zonas?.join(', ') || '—'}
          </span>
          {vol.notas_admin && (
            <div style={{ marginTop: 4, padding: '8px 10px', background: '#fafbfc', borderRadius: 8, border: '1px solid #eef1f4' }}>
              <span className="admin-th" style={{ fontSize: 9 }}>{t('admin.detail.notasAdmin')}</span>
              <p style={{ margin: '2px 0 0', font: '500 12px Inter', color: '#4b5563' }}>{vol.notas_admin}</p>
            </div>
          )}
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

  // Use real data
  const volunteers = volResult?.data ?? EMPTY_ARRAY;
  const totalCount = volResult?.total ?? 0;
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
