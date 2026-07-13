// src/pages/admin/MapeoPanel.jsx
// Panel interactivo de despliegue y mapeo utilizando Leaflet y OpenStreetMap.
// Muestra marcadores dinámicos por zona con la cantidad de voluntarios asignados.
// Permite la asignación reactiva a través del panel lateral.

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
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
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [newZoneName, setNewZoneName] = useState('');
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'

  // 1. Fetch Zones
  const { data: zones = [], isLoading: loadingZones } = useQuery({
    queryKey: ['zones'],
    queryFn: zonasService.getAll,
    staleTime: 60_000,
  });

  // 2. Fetch Active/Approved Volunteers
  const { data: volunteersResult, isLoading: loadingVolunteers } = useQuery({
    queryKey: ['volunteers', { estado_voluntario: 'aprobado' }],
    queryFn: () => volunteerService.getAll({ estado_voluntario: 'aprobado', pageSize: 150 }),
    staleTime: 20_000,
  });

  const volunteers = useMemo(() => volunteersResult?.data ?? [], [volunteersResult]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }) => volunteerService.update(id, updates),
    onSuccess: (data) => {
      showToast(t('admin.assign.success'));
      queryClient.invalidateQueries({ queryKey: ['volunteers'] });
      setSelectedVolunteer(null);
    },
    onError: () => {
      showToast(t('admin.assign.error'));
    },
  });

  // Calculate volunteer counts per zone
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

  // Filtered volunteers for sidebar listing
  const filteredVolunteers = useMemo(() => {
    if (selectedZone === 'Todas') return volunteers;
    if (selectedZone === 'Sin Asignar') return volunteers.filter((v) => !v.zona_asignada);
    return volunteers.filter((v) => v.zona_asignada === selectedZone);
  }, [volunteers, selectedZone]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (viewMode !== 'map' || loadingZones || zones.length === 0 || !window.L || mapInstance.current) return;

    // Center on La Guaira (Vargas)
    const centerLat = 10.4500;
    const centerLng = -67.1500;

    const map = window.L.map(mapRef.current, {
      center: [centerLat, centerLng],
      zoom: 9,
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

  // Redraw Markers when counts or zones change
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !window.L || zones.length === 0) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Draw new markers
    zones.forEach((zone) => {
      const count = zoneCounts[zone.nombre] || 0;
      const isLow = count === 0;

      // Premium HTML divIcon matching the admin system aesthetics
      const icon = window.L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div class="flex flex-col items-center" style="font-family: 'Inter', sans-serif;">
            <div class="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#efe7d8] rounded-full shadow-md hover:shadow-lg transition-shadow cursor-pointer select-none">
              <span class="text-xs font-bold text-navy whitespace-nowrap">${zone.nombre.split(' · ')[1] || zone.nombre}</span>
              <span class="flex items-center justify-center min-w-[20px] h-5 rounded-full px-1 text-[10.5px] font-extrabold text-white ${isLow ? 'bg-[#cf4a43]' : 'bg-[#22633f]'}">
                ${count}
              </span>
            </div>
            <div class="w-2.5 h-2.5 bg-white rotate-45 -mt-1.5 border-r border-b border-[#efe7d8] shadow-sm"></div>
          </div>
        `,
        iconSize: [120, 36],
        iconAnchor: [60, 36],
      });

      const marker = window.L.marker([zone.lat, zone.lng], { icon })
        .addTo(map)
        .on('click', () => {
          setSelectedZone(zone.nombre);
        });

      markersRef.current.push(marker);
    });
  }, [zones, zoneCounts]);

  const handleAssign = useCallback((e) => {
    e.preventDefault();
    if (!selectedVolunteer) return;
    updateMutation.mutate({
      id: selectedVolunteer.id,
      updates: { zona_asignada: newZoneName || null },
    });
  }, [selectedVolunteer, newZoneName, updateMutation]);

  const selectForAssignment = (vol) => {
    setSelectedVolunteer(vol);
    setNewZoneName(vol.zona_asignada || '');
  };

  const isLoading = loadingZones || loadingVolunteers;

  return (
    <div className="admin-panel animate-[fade_0.2s_ease]" style={{ minHeight: 'calc(100vh - 84px)' }}>
      {/* Header and Toggle Controls */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <span className="admin-nav-phase uppercase font-bold text-[10.5px] tracking-wider text-wine">
            {t('admin.nav.mapeo.title')}
          </span>
          <p className="admin-apr-desc margin-0 mt-1">
            {t('admin.mapeo.desc')}
          </p>
        </div>

        {/* View mode buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('map')}
            className={`admin-btn ${viewMode === 'map' ? 'admin-btn-pri' : 'admin-btn-soft'} sm cursor-pointer`}
          >
            {t('admin.mapeo.viewMap')}
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`admin-btn ${viewMode === 'list' ? 'admin-btn-pri' : 'admin-btn-soft'} sm cursor-pointer`}
          >
            {t('admin.mapeo.viewList')}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          <div className="admin-skeleton" style={{ height: 420, borderRadius: 16 }} />
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-5.5">
          {/* MAP / TABULAR AREA */}
          <div className="flex-grow bg-white border border-[#efe7d8] rounded-2xl shadow-sm overflow-hidden min-h-[480px] flex flex-col">
            {viewMode === 'map' ? (
              <div ref={mapRef} style={{ width: '100%', height: '100%', flexGrow: 1, zIndex: 5 }} />
            ) : (
              <div className="p-5 overflow-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {zones.map((zone) => {
                    const count = zoneCounts[zone.nombre] || 0;
                    return (
                      <div
                        key={zone.id}
                        onClick={() => setSelectedZone(zone.nombre)}
                        className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                          selectedZone === zone.nombre
                            ? 'bg-[#eef3fb] border-navy shadow-sm'
                            : 'bg-[#fafbfc] border-[#e7eaef] hover:border-gray-300'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-3">
                          <b className="font-extrabold text-sm text-text-primary">{zone.nombre}</b>
                          <span className={`admin-pill font-bold text-xs ${count === 0 ? 'admin-pill-crit' : 'admin-pill-ok'}`}>
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
                        : 'bg-[#fafbfc] border-[#e7eaef] hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <b className="font-extrabold text-sm text-text-primary">{t('admin.mapeo.unassigned')}</b>
                      <span className="admin-pill admin-pill-neutral font-bold text-xs">
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
          <div className="w-full lg:w-[340px] flex-shrink-0 flex flex-col gap-4">
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-2 gap-3.5">
              <div className="bg-white border border-[#efe7d8] rounded-2xl p-4 flex flex-col">
                <span className="text-[10px] font-bold text-[#8fa3b8] uppercase tracking-wider">
                  {t('admin.mapeo.totalDeployed')}
                </span>
                <span className="text-2xl font-extrabold text-text-primary mt-1">
                  {volunteers.length - unassignedCount}
                </span>
              </div>
              <div className="bg-white border border-[#efe7d8] rounded-2xl p-4 flex flex-col">
                <span className="text-[10px] font-bold text-[#8fa3b8] uppercase tracking-wider">
                  {t('admin.mapeo.unassigned')}
                </span>
                <span className="text-2xl font-extrabold text-[#cf4a43] mt-1">
                  {unassignedCount}
                </span>
              </div>
            </div>

            {/* Assignment form drawer */}
            {selectedVolunteer && (
              <div className="bg-[#faf9f6] border-2 border-[#d9c9b0] rounded-2xl p-5 shadow-sm">
                <h4 className="margin-0 font-bold text-xs text-wine uppercase tracking-wider mb-2.5">
                  {t('admin.mapeo.assignZone')}
                </h4>
                <div className="flex items-center gap-2 mb-4">
                  <div className="admin-avatar" style={{ width: 28, height: 28, fontSize: 10 }}>
                    {selectedVolunteer.nombre.slice(0, 2).toUpperCase()}
                  </div>
                  <b className="text-xs font-bold text-text-primary truncate">
                    {selectedVolunteer.nombre}
                  </b>
                </div>
                <form onSubmit={handleAssign} className="flex flex-col gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-text-secondary uppercase mb-1 block">
                      {t('admin.assign.zona')}
                    </label>
                    <select
                      className="fld sm bg-white"
                      value={newZoneName}
                      onChange={(e) => setNewZoneName(e.target.value)}
                    >
                      <option value="">{t('admin.table.sinAsignar')}</option>
                      {zones.map((z) => (
                        <option key={z.id} value={z.nombre}>
                          {z.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2 justify-end mt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedVolunteer(null)}
                      className="admin-btn admin-btn-soft sm cursor-pointer"
                    >
                      {t('admin.assign.cancel')}
                    </button>
                    <button
                      type="submit"
                      disabled={updateMutation.isPending}
                      className="admin-btn admin-btn-pri sm cursor-pointer"
                    >
                      {updateMutation.isPending ? t('admin.assign.saving') : t('admin.assign.save')}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* List panel */}
            <div className="bg-white border border-[#efe7d8] rounded-2xl p-4.5 flex-grow flex flex-col max-h-[380px]">
              <div className="flex justify-between items-center mb-3">
                <h3 className="margin-0 font-bold text-xs text-navy uppercase tracking-wider">
                  {t('admin.mapeo.volunteersList')}
                </h3>
                <select
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                  className="text-xs font-semibold text-navy bg-transparent border-0 outline-none cursor-pointer hover:underline"
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

              {/* Volunteers list */}
              <div className="flex-grow overflow-y-auto flex flex-col gap-2.5 pr-1">
                {filteredVolunteers.map((vol) => (
                  <div
                    key={vol.id}
                    className="p-3 bg-[#faf9f6] border border-[#efe7d8] rounded-xl flex items-center justify-between hover:border-navy transition-colors"
                  >
                    <div className="min-w-0 flex-grow pr-2">
                      <b className="block text-xs font-bold text-text-primary truncate">{vol.nombre}</b>
                      <span className="block text-[10.5px] text-text-tertiary mt-0.5 truncate">
                        {vol.areas?.join(', ') || 'General'}
                      </span>
                      {vol.extranjero && (
                        <span className="inline-block bg-[#eef3fb] text-[#2a6fdb] text-[9px] font-bold px-1.5 py-0.5 rounded mt-1">
                          🌐 Extranjero ({vol.pais})
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => selectForAssignment(vol)}
                      className="admin-btn admin-btn-soft xs px-2.5 font-bold cursor-pointer"
                    >
                      Asignar
                    </button>
                  </div>
                ))}
                {filteredVolunteers.length === 0 && (
                  <div className="text-center py-10">
                    <span className="text-xs text-text-tertiary">
                      {t('admin.mapeo.noVolunteers')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
