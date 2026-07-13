// src/pages/admin/MapeoPanel.jsx
// Módulo de Despliegue y Mapeo interactivo (Fase 3).
// Integración con Leaflet + OpenStreetMap y panel lateral de asignación rápida por zona.
// Cumple 100% con los requerimientos visuales y operacionales de Fase3 Wireframes.dc.html.

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useI18nStore } from '@/stores/useI18nStore';
import { useUIStore } from '@/stores/useUIStore';
import { volunteerService } from '@/services/volunteerService';
import { zonasService } from '@/services/zonasService';
import './Admin.css';

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

  const unassignedCount = useMemo(() => {
    return volunteers.filter((v) => !v.zona_asignada).length;
  }, [volunteers]);

  // Lista de voluntarios asignados a la zona seleccionada
  const volunteersInSelectedZone = useMemo(() => {
    if (selectedZone === 'Todas') return [];
    if (selectedZone === 'Sin Asignar') return volunteers.filter((v) => !v.zona_asignada);
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

  // Inicializar Leaflet Map
  useEffect(() => {
    if (viewMode !== 'map' || loadingZones || zones.length === 0 || !window.L || mapInstance.current) return;

    // Centrar en la región central (La Guaira/Caracas)
    const centerLat = 10.4600;
    const centerLng = -67.0500;

    const map = window.L.map(mapRef.current, {
      center: [centerLat, centerLng],
      zoom: 9.5,
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
              width: 30px;
              height: 30px;
              border-radius: 99px 99px 99px 2px;
              transform: rotate(45deg);
              background: ${isLow ? '#c0413b' : '#003366'};
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 2px 6px rgba(0,0,0,.25);
              border: 2px solid #fff;
            ">
              <b style="
                transform: rotate(-45deg);
                color: #fff;
                font: 800 12px 'Inter', sans-serif;
                display: block;
              ">${count}</b>
            </div>
            <span style="
              font: 700 9px 'Inter', sans-serif;
              color: ${isLow ? '#b02a24' : '#003366'};
              background: #fff;
              padding: 1.5px 5.5px;
              border-radius: 4px;
              margin-top: 5px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.15);
              white-space: nowrap;
            ">${zone.nombre.split(' · ')[1] || zone.nombre}</span>
          </div>
        `,
        iconSize: [60, 50],
        iconAnchor: [30, 30],
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
      {/* Top Controls Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4 border-b border-[#eef1f4] pb-4.5">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-extrabold text-navy margin-0">
            {selectedZone === 'Todas' ? t('admin.nav.mapeo.title') : selectedZone}
          </h1>
          {selectedZone !== 'Todas' && (
            <button
              onClick={() => setSelectedZone('Todas')}
              className="admin-btn admin-btn-soft xs font-bold cursor-pointer"
            >
              ← Volver
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="inline-flex bg-[#eef0f3] rounded-lg p-0.5 border border-[#e2ddd0]">
            <button
              onClick={() => setViewMode('map')}
              className={`btn xs font-bold px-3 cursor-pointer ${
                viewMode === 'map' ? 'btn-pri rounded-md' : 'text-[#6B7280]'
              }`}
            >
              {t('admin.mapeo.viewMap')}
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`btn xs font-bold px-3 cursor-pointer ${
                viewMode === 'list' ? 'btn-pri rounded-md' : 'text-[#6B7280]'
              }`}
            >
              {t('admin.mapeo.viewList')}
            </button>
          </div>

          {/* Zones Dropdown */}
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="fld sm cursor-pointer bg-white"
            style={{ width: 'auto', minWidth: 150, height: 32, fontSize: 11.5 }}
          >
            <option value="Todas">Todas las zonas</option>
            <option value="Sin Asignar">Sin Asignar</option>
            {zones.map((z) => (
              <option key={z.id} value={z.nombre}>
                {z.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="admin-skeleton" style={{ height: 440, borderRadius: 16 }} />
      ) : (
        <div className="flex flex-col lg:flex-row gap-5.5">
          {/* MAP / LIST AREA */}
          <div className="flex-grow bg-white border border-[#efe7d8] rounded-2xl shadow-sm overflow-hidden min-h-[460px] flex flex-col relative">
            {viewMode === 'map' ? (
              <>
                <div ref={mapRef} style={{ width: '100%', height: '100%', flexGrow: 1, zIndex: 5 }} />
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
                  <span className="th text-[9.5px] font-bold text-text-primary block mb-0.5">Cobertura</span>
                  <div className="flex items-center gap-2">
                    <i className="w-2.5 h-2.5 rounded-full bg-[#003366]" />
                    <span className="text-[10px] font-semibold text-text-secondary">Suficiente (≥ 20)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="w-2.5 h-2.5 rounded-full bg-[#c0413b]" />
                    <span className="text-[10px] font-semibold text-text-secondary">Baja — priorizar (&lt; 20)</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-5.5 overflow-y-auto">
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

          {/* SIDEBAR OPERATIONAL PANEL */}
          <div className="w-full lg:w-[320px] flex-shrink-0 flex flex-col gap-4">
            
            {/* ── CASE 1: SPECIFIC ZONE SELECTED ── */}
            {selectedZone !== 'Todas' ? (
              <div className="bg-white border border-[#efe7d8] rounded-2xl p-5 shadow-sm flex flex-col gap-4.5">
                {/* Zone Header and Status */}
                <div className="flex items-center justify-between">
                  <h3 className="margin-0 font-extrabold text-sm text-text-primary truncate" style={{ maxWidth: '170px' }}>
                    {selectedZone}
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

                {/* KPI stats */}
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

                {/* Assigned Volunteers in this Zone */}
                <div className="flex flex-col gap-2">
                  <span className="th text-[9.5px] font-bold text-text-tertiary">
                    {lang === 'es' ? `Ya en esta zona (${volunteersInSelectedZone.length})` : `Already in zone (${volunteersInSelectedZone.length})`}
                  </span>
                  <div className="max-h-[140px] overflow-y-auto flex flex-col gap-2 pr-1">
                    {volunteersInSelectedZone.map((vol) => (
                      <div key={vol.id} className="flex items-center justify-between p-2.5 bg-[#fafbfc] border border-[#e7eaef] rounded-xl">
                        <div className="min-w-0 flex-grow pr-1.5">
                          <div className="text-xs font-bold text-text-primary truncate">{vol.nombre}</div>
                          <div className="text-[9.5px] text-text-tertiary mt-0.5 truncate">
                            {vol.areas?.join(', ') || 'General'}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveAssign(vol.id)}
                          className="text-[#c0413b] hover:text-[#b02a24] text-[10.5px] font-bold bg-transparent border-0 outline-none cursor-pointer px-1.5 py-0.5"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {volunteersInSelectedZone.length === 0 && (
                      <span className="text-xs text-text-tertiary text-center py-4">
                        Sin voluntarios asignados.
                      </span>
                    )}
                  </div>
                </div>

                <div className="h-0.5 bg-[#eef1f4]" />

                {/* Assign Available Volunteer Form Section */}
                {selectedZone !== 'Sin Asignar' && (
                  <div className="flex flex-col gap-2.5">
                    <span className="th text-[9.5px] font-bold text-text-tertiary">
                      {lang === 'es' ? 'Asignar voluntario' : 'Assign volunteer'}
                    </span>
                    <input
                      type="text"
                      className="fld sm bg-[#faf9f6]"
                      placeholder={lang === 'es' ? 'Buscar disponible…' : 'Search available…'}
                      style={{ height: 32, fontSize: 11.5 }}
                      value={assignSearchQuery}
                      onChange={(e) => setAssignSearchQuery(e.target.value)}
                    />
                    <div className="max-h-[160px] overflow-y-auto flex flex-col gap-2 pr-1">
                      {availableVolunteers.slice(0, 10).map((vol) => (
                        <div key={vol.id} className="p-2.5 bg-[#faf9f6] border border-[#efe7d8] rounded-xl flex items-center justify-between">
                          <div className="min-w-0 pr-1.5">
                            <div className="text-xs font-bold text-text-primary truncate">{vol.nombre}</div>
                            <div className="text-[9.5px] text-text-tertiary mt-0.5 truncate">
                              {vol.areas?.join(', ') || 'General'}
                            </div>
                          </div>
                          <button
                            onClick={() => handleQuickAssign(vol.id, selectedZone)}
                            className="btn xs btn-ok px-2.5 font-bold cursor-pointer"
                          >
                            + Asignar
                          </button>
                        </div>
                      ))}
                      {availableVolunteers.length === 0 && (
                        <span className="text-xs text-text-tertiary text-center py-4">
                          No hay voluntarios disponibles.
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // ── CASE 2: GENERAL SUMMARY (Todas selected) ──
              <div className="bg-white border border-[#efe7d8] rounded-2xl p-5 shadow-sm flex flex-col gap-4">
                <h3 className="margin-0 font-extrabold text-sm text-navy uppercase tracking-wider">
                  Resumen Global
                </h3>

                <div className="flex flex-col gap-3">
                  <div className="p-3 bg-[#faf9f6] border border-[#efe7d8] rounded-xl">
                    <span className="text-[10px] font-bold text-text-tertiary uppercase">Desplegados</span>
                    <b className="text-2xl font-extrabold text-navy block mt-1">
                      {volunteers.length - unassignedCount}
                    </b>
                  </div>
                  <div className="p-3 bg-[#faf9f6] border border-[#efe7d8] rounded-xl">
                    <span className="text-[10px] font-bold text-text-tertiary uppercase">Sin Asignar</span>
                    <b className="text-2xl font-extrabold text-[#c0413b] block mt-1">
                      {unassignedCount}
                    </b>
                  </div>
                </div>

                <div className="h-0.5 bg-[#eef1f4]" />

                <div className="text-center py-8">
                  <span className="text-xs text-text-tertiary block leading-relaxed px-4">
                    Selecciona una zona del mapa o de la lista de la izquierda para ver su detalle y realizar asignaciones operativas en un toque.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
