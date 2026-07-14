// src/pages/admin/MapeoPanel.jsx
// Módulo de Mapeo y Despliegue de Voluntarios (Fase 3).
// Conexión real con Supabase + mapa Leaflet corregido + diseño exacto de Claude Design.

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useI18nStore } from '@/stores/useI18nStore';
import { useUIStore } from '@/stores/useUIStore';
import { volunteerService } from '@/services/volunteerService';
import { zonasService } from '@/services/zonasService';
import './Admin.css';

function getInitials(vol) {
  if (!vol) return '??';
  const name = vol.nombre || '';
  const parts = name.split(/[\s.]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default function MapeoPanel() {
  const t = useI18nStore((s) => s.t);
  const lang = useI18nStore((s) => s.lang);
  const showToast = useUIStore((s) => s.showToast);
  const queryClient = useQueryClient();

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);

  const [selectedZone, setSelectedZone] = useState('Todas');
  const [viewMode, setViewMode] = useState('map'); // 'map' | 'list'
  const [assignSearchQuery, setAssignSearchQuery] = useState('');

  // 1. Obtener zonas
  const { data: zones = [], isLoading: loadingZones } = useQuery({
    queryKey: ['zones'],
    queryFn: zonasService.getAll,
    staleTime: 60_000,
  });

  // 2. Obtener voluntarios activos/aprobados
  const { data: volunteersResult, isLoading: loadingVolunteers } = useQuery({
    queryKey: ['volunteers', { estado_voluntario: 'aprobado' }],
    queryFn: () => volunteerService.getAll({ estado_voluntario: 'aprobado', pageSize: 200 }),
    staleTime: 20_000,
  });

  const volunteers = useMemo(() => volunteersResult?.data ?? [], [volunteersResult]);

  // Mutación para actualizar la zona del voluntario
  const assignMutation = useMutation({
    mutationFn: ({ id, updates }) => volunteerService.update(id, updates),
    onSuccess: () => {
      showToast(t('admin.assign.success'));
      queryClient.invalidateQueries({ queryKey: ['volunteers'] });
    },
    onError: () => {
      showToast(t('admin.assign.error'));
    },
  });

  // Conteo de voluntarios por zona
  const zoneCounts = useMemo(() => {
    const counts = {};
    zones.forEach((z) => {
      counts[z.nombre] = 0;
    });
    volunteers.forEach((v) => {
      if (v.zona_asignada && counts[v.zona_asignada] !== undefined) {
        counts[v.zona_asignada]++;
      }
    });
    return counts;
  }, [zones, volunteers]);

  // Total desplegados
  const deployedCount = useMemo(() => {
    return volunteers.filter(v => !!v.zona_asignada).length;
  }, [volunteers]);

  // Voluntarios sin asignar
  const unassignedCount = useMemo(() => {
    return volunteers.filter((v) => !v.zona_asignada).length;
  }, [volunteers]);

  // Voluntarios en la zona seleccionada
  const volunteersInSelectedZone = useMemo(() => {
    if (selectedZone === 'Todas') return [];
    if (selectedZone === 'Sin Asignar') {
      return volunteers.filter((v) => !v.zona_asignada);
    }
    return volunteers.filter((v) => v.zona_asignada === selectedZone);
  }, [volunteers, selectedZone]);

  // Lista de voluntarios disponibles (sin asignar)
  const availableVolunteers = useMemo(() => {
    const unassigned = volunteers.filter((v) => !v.zona_asignada);
    if (!assignSearchQuery.trim()) return unassigned;
    return unassigned.filter((v) =>
      v.nombre?.toLowerCase().includes(assignSearchQuery.toLowerCase()) ||
      v.areas?.some(a => a.toLowerCase().includes(assignSearchQuery.toLowerCase()))
    );
  }, [volunteers, assignSearchQuery]);

  // Seleccionar automáticamente la primera zona al cargar para poblar el sidebar (Estilo Claude Design)
  useEffect(() => {
    if (selectedZone === 'Todas' && zones.length > 0) {
      const target = zones.find(z => z.nombre.includes('Los Teques')) || zones[0];
      if (target) {
        setSelectedZone(target.nombre);
      }
    }
  }, [zones, selectedZone]);

  // Inicializar Leaflet Map
  useEffect(() => {
    if (viewMode !== 'map' || loadingZones || zones.length === 0 || !window.L || mapInstance.current) return;

    // Centrar en la región central (La Guaira/Caracas)
    const centerLat = 10.4600;
    const centerLng = -66.9500;

    const map = window.L.map(mapRef.current, {
      center: [centerLat, centerLng],
      zoom: 9.3,
      zoomControl: true,
    });

    window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map);

    mapInstance.current = map;

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [viewMode, loadingZones, zones]);

  // Redibujar marcadores pin-drop (Fase 3 visual de Claude Design)
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !window.L || zones.length === 0) return;

    // Limpiar marcadores viejos
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Pintar nuevos marcadores drop-pin
    zones.forEach((zone) => {
      const count = zoneCounts[zone.nombre] || 0;
      const isLow = count < 20; // Alerta de cobertura menor a 20 voluntarios

      const icon = window.L.divIcon({
        className: 'custom-map-marker-wrapper',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; gap: 2px;">
            <div style="
              width: 34px;
              height: 34px;
              border-radius: 99px 99px 99px 3px;
              transform: rotate(45deg);
              background: ${isLow ? '#b02a24' : '#003366'};
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 3px 8px rgba(0,0,0,.28);
              border: 2.5px solid #fff;
            ">
              <b style="
                transform: rotate(-45deg);
                color: #fff;
                font: 800 13px 'Inter', sans-serif;
                display: block;
              ">${count}</b>
            </div>
            <span style="
              font: 700 10px 'Inter', sans-serif;
              color: #374151;
              background: #fff;
              padding: 2px 6px;
              border-radius: 5px;
              margin-top: 5px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.15);
              white-space: nowrap;
            ">${zone.nombre.split(' · ')[1] || zone.nombre}</span>
          </div>
        `,
        iconSize: [60, 55],
        iconAnchor: [30, 34],
      });

      const marker = window.L.marker([zone.lat, zone.lng], { icon })
        .addTo(map)
        .on('click', () => {
          setSelectedZone(zone.nombre);
        });

      markersRef.current.push(marker);
    });
  }, [zones, zoneCounts]);

  const handleQuickAssign = (volId, zoneName) => {
    assignMutation.mutate({
      id: volId,
      updates: { zona_asignada: zoneName },
    });
  };

  const handleRemoveAssign = (volId) => {
    assignMutation.mutate({
      id: volId,
      updates: { zona_asignada: null },
    });
  };

  const isLoading = loadingZones || loadingVolunteers;

  return (
    <div className="admin-panel admin-fade" style={{ minHeight: 'calc(100vh - 84px)' }}>
      {/* ── CONTROL ROW (Mapa/Lista, total counters, zone dropdown selector) ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 14, flexWrap: 'wrap' }}>
        {/* Segmented Toggle Group */}
        <div className="admin-seg-group">
          <button
            onClick={() => setViewMode('map')}
            className={`admin-segbtn${viewMode === 'map' ? ' on' : ''}`}
          >
            {lang === 'es' ? 'Mapa' : 'Map'}
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`admin-segbtn${viewMode === 'list' ? ' on' : ''}`}
          >
            {lang === 'es' ? 'Lista' : 'List'}
          </button>
        </div>

        {/* Counts summary label */}
        <span style={{ font: '600 12.5px Inter, system-ui, sans-serif', color: '#6B7280' }}>
          {zones.length} {lang === 'es' ? 'zonas' : 'zones'} · {deployedCount} {lang === 'es' ? 'desplegados' : 'deployed'}
        </span>

        {/* Dropdown filter aligned right */}
        <div style={{ marginLeft: 'auto' }}>
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="fld sm cursor-pointer bg-white"
            style={{ width: 'auto', minWidth: 150, height: 32, fontSize: 11.5 }}
          >
            <option value="Todas">{lang === 'es' ? 'Zona: Todas' : 'Zone: All'}</option>
            <option value="Sin Asignar">{lang === 'es' ? 'Zona: Sin Asignar' : 'Zone: Unassigned'}</option>
            {zones.map((z) => (
              <option key={z.id} value={z.nombre}>
                {z.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="admin-skeleton" style={{ height: 500, borderRadius: 16 }} />
      ) : (
        <div className="flex flex-col lg:flex-row gap-5.5">
          
          {/* ── MAP / LIST VISUALIZER CONTAINER ── */}
          <div
            className="flex-grow bg-white border border-[#efe7d8] rounded-2xl shadow-sm overflow-hidden flex flex-col relative"
            style={{ minHeight: 460, height: 500 }}
          >
            {viewMode === 'map' ? (
              <>
                {/* Leaflet map object */}
                <div ref={mapRef} style={{ width: '100%', height: '100%', zIndex: 5 }} />

                {/* Coverage Legend Box */}
                <div
                  style={{
                    position: 'absolute',
                    left: 14,
                    bottom: 14,
                    background: '#fff',
                    borderRadius: 10,
                    padding: '10px 12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    zIndex: 10,
                    border: '1px solid #efe7d8',
                  }}
                >
                  <span className="admin-th" style={{ fontSize: '9.5px', color: '#111827', display: 'block', marginBottom: '2px' }}>
                    Cobertura
                  </span>
                  <div className="flex items-center gap-2">
                    <i className="w-2.5 h-2.5 rounded-full bg-[#003366]" />
                    <span className="text-[10px] font-semibold text-text-secondary">Suficiente (≥ 20)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="w-2.5 h-2.5 rounded-full bg-[#b02a24]" />
                    <span className="text-[10px] font-semibold text-text-secondary">Baja — priorizar (&lt; 20)</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-5.5 overflow-y-auto flex-grow">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {zones.map((zone) => {
                    const count = zoneCounts[zone.nombre] || 0;
                    const isLow = count < 20;
                    return (
                      <div
                        key={zone.id}
                        onClick={() => setSelectedZone(zone.nombre)}
                        className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                          selectedZone === zone.nombre
                            ? 'bg-[#eef3fb] border-navy shadow-sm'
                            : 'bg-[#fafbfc] border-[#efe7d8] hover:border-[#b8b3a8]'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-3">
                          <b className="font-extrabold text-sm text-text-primary">{zone.nombre}</b>
                          <span className={`admin-pill font-bold text-[10.5px] ${isLow ? 'admin-pill-crit' : 'admin-pill-ok'}`}>
                            {count} {lang === 'es' ? 'voluntarios' : 'volunteers'}
                          </span>
                        </div>
                        <p className="text-xs text-text-tertiary margin-0 leading-relaxed">
                          Coordenadas: {zone.lat.toFixed(4)}, {zone.lng.toFixed(4)}
                        </p>
                      </div>
                    );
                  })}
                  <div
                    onClick={() => setSelectedZone('Sin Asignar')}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                      selectedZone === 'Sin Asignar'
                        ? 'bg-[#fdf2f1] border-[#cf4a43] shadow-sm'
                        : 'bg-[#fafbfc] border-[#efe7d8] hover:border-[#b8b3a8]'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <b className="font-extrabold text-sm text-text-primary">{t('admin.mapeo.unassigned')}</b>
                      <span className="admin-pill admin-pill-neutral font-bold text-[10.5px]">
                        {unassignedCount} {lang === 'es' ? 'voluntarios' : 'volunteers'}
                      </span>
                    </div>
                    <p className="text-xs text-text-tertiary margin-0 leading-relaxed">
                      Voluntarios que aún no tienen una zona operativa asignada.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── SIDEBAR OPERATIONAL PANEL (Detailed layout) ── */}
          <div className="w-full lg:w-[320px] flex-shrink-0 flex flex-col gap-4">
            {selectedZone !== 'Todas' ? (
              <div className="bg-white border border-[#efe7d8] rounded-2xl p-5 shadow-sm flex flex-col gap-4.5" style={{ minHeight: 460 }}>
                {/* Zone Header and Status */}
                <div className="flex items-center justify-between">
                  <h3 className="margin-0 font-extrabold text-sm text-text-primary truncate" style={{ maxWidth: '170px' }}>
                    {selectedZone === 'Sin Asignar' ? t('admin.mapeo.unassigned') : selectedZone}
                  </h3>
                  {selectedZone === 'Sin Asignar' ? (
                    <span className="admin-pill admin-pill-neutral font-bold text-[10px]">Sin asignar</span>
                  ) : (
                    <span className={`admin-pill font-bold text-[10px] ${
                      (zoneCounts[selectedZone] || 0) < 20 ? 'admin-pill-crit' : 'admin-pill-ok'
                    }`}>
                      {(zoneCounts[selectedZone] || 0) < 20 ? 'Baja cobertura' : 'Suficiente'}
                    </span>
                  )}
                </div>

                {/* KPI stats (desplegados y requeridos) */}
                <div className="flex gap-3">
                  <div className="admin-card flex-1 p-3 bg-[#faf9f6] border border-[#efe7d8] rounded-xl">
                    <span className="text-[20px] font-extrabold text-navy block leading-none">
                      {selectedZone === 'Sin Asignar' ? unassignedCount : (zoneCounts[selectedZone] || 0)}
                    </span>
                    <span className="text-[9.5px] font-bold text-text-tertiary uppercase mt-1.5 block">
                      desplegados
                    </span>
                  </div>
                  {selectedZone !== 'Sin Asignar' && (
                    <div className="admin-card flex-1 p-3 bg-[#faf9f6] border border-[#efe7d8] rounded-xl">
                      <span className="text-[20px] font-extrabold text-[#c0413b] block leading-none">
                        +{Math.max(0, 30 - (zoneCounts[selectedZone] || 0))}
                      </span>
                      <span className="text-[9.5px] font-bold text-text-tertiary uppercase mt-1.5 block">
                        requeridos
                      </span>
                    </div>
                  )}
                </div>

                {/* Ya en esta zona List (Visual style matching Claude Design) */}
                <div className="flex flex-col gap-2">
                  <span className="admin-th text-[9.5px] font-bold text-text-tertiary">
                    {lang === 'es' ? `Ya en esta zona (${volunteersInSelectedZone.length})` : `Already in zone (${volunteersInSelectedZone.length})`}
                  </span>
                  <div className="max-h-[140px] overflow-y-auto flex flex-col gap-1 pr-1">
                    {volunteersInSelectedZone.map((vol) => (
                      <div
                        key={vol.id}
                        className="admin-row"
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid #f2f4f7' }}
                      >
                        <div className="admin-avatar" style={{ width: 28, height: 28, fontSize: 10, flexShrink: 0 }}>
                          {getInitials(vol)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0, lineHeight: 1.2 }}>
                          <div className="text-xs font-bold text-text-primary truncate">{vol.nombre}</div>
                          <span style={{ fontSize: 10, color: '#6b7280' }}>
                            {(vol.areas || ['General']).join(', ')} · activo
                          </span>
                        </div>
                        <span className="admin-pill admin-pill-ok" style={{ fontSize: 9.5 }}>Activo</span>
                        <button
                          onClick={() => handleRemoveAssign(vol.id)}
                          style={{ border: 0, background: 'none', color: '#c0413b', cursor: 'pointer', fontSize: 12, padding: '0 4px' }}
                          title="Quitar asignación"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {volunteersInSelectedZone.length === 0 && (
                      <span className="text-xs text-text-tertiary text-center py-6">
                        Sin voluntarios asignados.
                      </span>
                    )}
                  </div>
                </div>

                <div className="h-0.5 bg-[#eef1f4]" />

                {/* Assign Available Volunteer Form Section */}
                {selectedZone !== 'Sin Asignar' && (
                  <div className="flex flex-col gap-2.5">
                    <span className="admin-th text-[9.5px] font-bold text-text-tertiary">
                      {lang === 'es' ? 'Asignar voluntario disponible' : 'Assign available volunteer'}
                    </span>
                    <input
                      type="text"
                      className="fld sm bg-[#faf9f6]"
                      placeholder={lang === 'es' ? 'Buscar disponible…' : 'Search available…'}
                      style={{ height: 32, fontSize: 11.5, border: '1px solid #efe7d8', borderRadius: '8px' }}
                      value={assignSearchQuery}
                      onChange={(e) => setAssignSearchQuery(e.target.value)}
                    />
                    
                    <div className="max-h-[160px] overflow-y-auto flex flex-col gap-1 pr-1">
                      {availableVolunteers.slice(0, 10).map((vol) => (
                        <div
                          key={vol.id}
                          className="admin-row"
                          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #f2f4f7' }}
                        >
                          <div className="admin-avatar" style={{ width: 28, height: 28, fontSize: 10, flexShrink: 0 }}>
                            {getInitials(vol)}
                          </div>
                          <div style={{ flex: 1, minWidth: 0, lineHeight: 1.2 }}>
                            <div className="text-xs font-bold text-text-primary truncate">{vol.nombre}</div>
                            <span style={{ fontSize: 10, color: '#6b7280' }}>
                              {(vol.areas || ['General']).join(', ')} · sin asignar
                            </span>
                          </div>
                          <button
                            onClick={() => handleQuickAssign(vol.id, selectedZone)}
                            className="admin-btn admin-btn-pri sm font-bold cursor-pointer"
                            style={{ padding: '4px 8px', fontSize: 10.5, height: 'auto', flexShrink: 0 }}
                          >
                            + Asignar
                          </button>
                        </div>
                      ))}
                      {availableVolunteers.length === 0 && (
                        <span className="text-xs text-text-tertiary text-center py-6">
                          No hay voluntarios disponibles.
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Case: No zone selected (Resumen Global)
              <div className="bg-white border border-[#efe7d8] rounded-2xl p-5 shadow-sm flex flex-col gap-4.5" style={{ minHeight: 460 }}>
                <h3 className="margin-0 font-extrabold text-sm text-navy uppercase tracking-wider">
                  Resumen Global
                </h3>
                <div className="flex flex-col gap-3">
                  <div className="admin-card p-4 bg-[#faf9f6] border border-[#efe7d8] rounded-2xl flex flex-col">
                    <span className="text-[24px] font-extrabold text-[#003366] leading-none">{deployedCount}</span>
                    <span className="text-[10px] font-bold text-text-tertiary uppercase mt-2">Desplegados</span>
                  </div>
                  <div className="admin-card p-4 bg-[#faf9f6] border border-[#efe7d8] rounded-2xl flex flex-col">
                    <span className="text-[24px] font-extrabold text-[#c0413b] leading-none">{unassignedCount}</span>
                    <span className="text-[10px] font-bold text-text-tertiary uppercase mt-2">Sin asignar</span>
                  </div>
                </div>
                <p className="text-[11.5px] text-text-tertiary leading-relaxed mt-2">
                  Selecciona una zona del mapa o de la lista de la izquierda para ver su detalle y realizar asignaciones operativas en un toque.
                </p>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
