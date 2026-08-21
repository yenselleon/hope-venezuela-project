// src/components/admin/EditVolunteerModal.jsx
// Modal completo de edición de voluntario para administradores y super_admin.
// Permite modificar todas las opciones de registro (Datos personales, Áreas, Disponibilidad, Asignación).

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useI18nStore } from '@/stores/useI18nStore';
import { useUIStore } from '@/stores/useUIStore';
import { volunteerService } from '@/services/volunteerService';
import {
  ESTADOS_VENEZUELA,
  AREAS_APOYO,
  CERTIFICACIONES,
  TIPOS_VEHICULO,
  GRADOS_ACADEMICOS,
  ZONAS_DESPLIEGUE,
  OPCIONES_HOSPEDAJE,
  OPCIONES_MOVIL,
  APOYO_LOGISTICO,
  DURACION_OPCIONES,
  GENEROS,
  DIAS_SEMANA,
  TURNOS,
} from '@/utils/constants';
import { cn } from '@/utils/helpers';

const TURNOS_ASIGNACION = ['Mañana', 'Tarde', 'Noche'];
const ESTADOS_VOLUNTARIO = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'activo', label: 'Activo' },
  { value: 'asignado', label: 'Asignado' },
  { value: 'rechazado', label: 'Rechazado' },
];

function normalizeEstado(estado) {
  if (estado === 'aprobado') return 'activo';
  if (estado === 'activo' || estado === 'asignado' || estado === 'rechazado') return estado;
  return 'pendiente';
}

export function EditVolunteerModal({ volunteer, onClose, onSuccess }) {
  const t = useI18nStore((s) => s.t);
  const lang = useI18nStore((s) => s.lang);
  const queryClient = useQueryClient();
  const showToast = useUIStore((s) => s.showToast);
  const dialogRef = useRef(null);

  const [activeTab, setActiveTab] = useState('personal');

  // Form State initialized from volunteer object
  const [nombre, setNombre] = useState(volunteer?.nombre || '');
  const [cedula, setCedula] = useState(volunteer?.cedula || '');
  const [telefono, setTelefono] = useState(volunteer?.telefono || '');
  const [email, setEmail] = useState(volunteer?.email || '');
  const [edad, setEdad] = useState(volunteer?.edad ?? '');
  const [genero, setGenero] = useState(volunteer?.genero || 'Masculino');
  const [profesion, setProfesion] = useState(volunteer?.profesion || '');
  const [extranjero, setExtranjero] = useState(!!volunteer?.extranjero);
  const [pais, setPais] = useState(volunteer?.pais || '');
  const [estado, setEstado] = useState(volunteer?.estado || '');
  const [municipio, setMunicipio] = useState(volunteer?.municipio || '');

  // Step 2: Áreas
  const [areas, setAreas] = useState(volunteer?.areas || []);
  const [especialidad, setEspecialidad] = useState(volunteer?.especialidad_salud || '');
  const [gradoAcademico, setGradoAcademico] = useState(volunteer?.grado_academico || '');
  const [vehiculo, setVehiculo] = useState(volunteer?.vehiculo || '');
  const [certificaciones, setCertificaciones] = useState(volunteer?.certificaciones || []);

  // Step 3: Disponibilidad
  const [zonas, setZonas] = useState(volunteer?.zonas || []);
  const [turnos, setTurnos] = useState(volunteer?.turnos || []);
  const [duracion, setDuracion] = useState(volunteer?.duracion || '1 semana');
  const [duracionDias, setDuracionDias] = useState(volunteer?.duracion_dias ?? '');
  const [movilizacion, setMovilizacion] = useState(volunteer?.movilizacion || '');
  const [hospedaje, setHospedaje] = useState(volunteer?.hospedaje || '');
  const [apoyoLogistico, setApoyoLogistico] = useState(volunteer?.apoyo_logistico || []);
  const [familia, setFamilia] = useState(volunteer?.familia || []);

  // Admin Assignment & Status
  const [estadoVoluntario, setEstadoVoluntario] = useState(normalizeEstado(volunteer?.estado_voluntario));
  const [zonaAsignada, setZonaAsignada] = useState(volunteer?.zona_asignada || '');
  const [turnoAsignado, setTurnoAsignado] = useState(volunteer?.turno_asignado || '');
  const [notasAdmin, setNotasAdmin] = useState(volunteer?.notas_admin || '');

  // Keep state synced if volunteer prop updates
  useEffect(() => {
    if (volunteer) {
      setNombre(volunteer.nombre || '');
      setCedula(volunteer.cedula || '');
      setTelefono(volunteer.telefono || '');
      setEmail(volunteer.email || '');
      setEdad(volunteer.edad ?? '');
      setGenero(volunteer.genero || 'Masculino');
      setProfesion(volunteer.profesion || '');
      setExtranjero(!!volunteer.extranjero);
      setPais(volunteer.pais || '');
      setEstado(volunteer.estado || '');
      setMunicipio(volunteer.municipio || '');
      setAreas(volunteer.areas || []);
      setEspecialidad(volunteer.especialidad_salud || '');
      setGradoAcademico(volunteer.grado_academico || '');
      setVehiculo(volunteer.vehiculo || '');
      setCertificaciones(volunteer.certificaciones || []);
      setZonas(volunteer.zonas || []);
      setTurnos(volunteer.turnos || []);
      setDuracion(volunteer.duracion || '1 semana');
      setDuracionDias(volunteer.duracion_dias ?? '');
      setMovilizacion(volunteer.movilizacion || '');
      setHospedaje(volunteer.hospedaje || '');
      setApoyoLogistico(volunteer.apoyo_logistico || []);
      setFamilia(volunteer.familia || []);
      setEstadoVoluntario(normalizeEstado(volunteer.estado_voluntario));
      setZonaAsignada(volunteer.zona_asignada || '');
      setTurnoAsignado(volunteer.turno_asignado || '');
      setNotasAdmin(volunteer.notas_admin || '');
    }
  }, [volunteer]);

  const setDialogRef = useCallback((node) => {
    dialogRef.current = node;
    if (node && !node.open) {
      node.showModal();
    }
  }, []);

  const handleClose = useCallback(() => {
    if (dialogRef.current) {
      dialogRef.current.close();
    }
    onClose?.();
  }, [onClose]);

  const handleToggleArray = (setter, currentList, value) => {
    if (currentList.includes(value)) {
      setter(currentList.filter((item) => item !== value));
    } else {
      setter([...currentList, value]);
    }
  };

  const handleToggleTurno = (cellKey) => {
    handleToggleArray(setTurnos, turnos, cellKey);
  };

  const updateMutation = useMutation({
    mutationFn: async () => {
      let finalEstado = estadoVoluntario;
      const targetZone = zonaAsignada?.trim() || null;
      if (targetZone) {
        if (finalEstado === 'activo' || finalEstado === 'pendiente') {
          finalEstado = 'asignado';
        }
      } else if (finalEstado === 'asignado') {
        finalEstado = 'activo';
      }

      const payload = {
        nombre: nombre.trim(),
        cedula: cedula.trim(),
        telefono: telefono.trim(),
        email: email.trim().toLowerCase() || null,
        edad: edad ? parseInt(edad, 10) : null,
        genero: genero || null,
        profesion: profesion.trim(),
        extranjero: !!extranjero,
        pais: extranjero ? (pais.trim() || null) : null,
        estado: extranjero ? null : (estado || null),
        municipio: extranjero ? null : (municipio.trim() || null),
        areas,
        especialidad_salud: areas.includes('Salud') ? (especialidad.trim() || null) : null,
        grado_academico: areas.includes('Salud') ? (gradoAcademico || null) : null,
        vehiculo: areas.includes('Transporte') ? (vehiculo || null) : null,
        certificaciones,
        zonas,
        turnos,
        duracion: duracion || null,
        duracion_dias: duracion === 'Personalizado' && duracionDias ? parseInt(duracionDias, 10) : null,
        movilizacion: movilizacion || null,
        hospedaje: hospedaje || null,
        apoyo_logistico: apoyoLogistico,
        familia,
        estado_voluntario: finalEstado,
        zona_asignada: targetZone,
        turno_asignado: turnoAsignado || null,
        notas_admin: notasAdmin.trim() || null,
      };

      return volunteerService.update(volunteer.id, payload);
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['volunteers'] });
      queryClient.invalidateQueries({ queryKey: ['volunteer', volunteer.id] });
      queryClient.invalidateQueries({ queryKey: ['active-volunteers-count'] });
      queryClient.invalidateQueries({ queryKey: ['pending-volunteers'] });
      showToast(t('admin.editVolunteer.success'), 'success');
      onSuccess?.(updated);
      handleClose();
    },
    onError: (err) => {
      showToast(err.message || 'Error al guardar cambios', 'error');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate();
  };

  const handleDialogClick = (e) => {
    if (e.target === dialogRef.current) {
      handleClose();
    }
  };

  const isSalud = areas.includes('Salud');
  const isTransporte = areas.includes('Transporte');

  return (
    <dialog
      ref={setDialogRef}
      onClick={handleDialogClick}
      onCancel={handleClose}
      className="fixed inset-0 m-auto p-0 bg-white border border-[#efe7d8] rounded-2xl shadow-2xl focus:outline-none backdrop:bg-black/45 backdrop:backdrop-blur-sm w-[92vw] max-w-[780px] max-h-[90vh] flex flex-col"
    >
      <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#f0ede6] flex items-center justify-between bg-[#fbf9f4]">
          <div>
            <h2 className="text-lg font-bold text-[#111827]">
              {t('admin.editVolunteer.title')}
            </h2>
            <p className="text-xs text-[#6b7280]">
              ID: {volunteer?.id} · {volunteer?.nombre}
            </p>
          </div>
          <button
            type="button"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#6b7280] hover:bg-[#f3f4f6] hover:text-[#111827] transition-colors text-sm"
            onClick={handleClose}
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#f0ede6] bg-white px-5 sm:px-6 gap-2 sm:gap-4 overflow-x-auto text-xs font-semibold">
          <button
            type="button"
            className={`py-3 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'personal'
                ? 'border-[#1b365d] text-[#1b365d] font-bold'
                : 'border-transparent text-[#6b7280] hover:text-[#111827]'
            }`}
            onClick={() => setActiveTab('personal')}
          >
            {t('admin.editVolunteer.tabPersonal')}
          </button>
          <button
            type="button"
            className={`py-3 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'areas'
                ? 'border-[#1b365d] text-[#1b365d] font-bold'
                : 'border-transparent text-[#6b7280] hover:text-[#111827]'
            }`}
            onClick={() => setActiveTab('areas')}
          >
            {t('admin.editVolunteer.tabAreas')}
          </button>
          <button
            type="button"
            className={`py-3 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'availability'
                ? 'border-[#1b365d] text-[#1b365d] font-bold'
                : 'border-transparent text-[#6b7280] hover:text-[#111827]'
            }`}
            onClick={() => setActiveTab('availability')}
          >
            {t('admin.editVolunteer.tabAvailability')}
          </button>
          <button
            type="button"
            className={`py-3 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'assignment'
                ? 'border-[#1b365d] text-[#1b365d] font-bold'
                : 'border-transparent text-[#6b7280] hover:text-[#111827]'
            }`}
            onClick={() => setActiveTab('assignment')}
          >
            {t('admin.editVolunteer.tabAssignment')}
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-sm text-[#111827]">
          {/* ── TAB 1: DATOS PERSONALES ── */}
          {activeTab === 'personal' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#4b5563]">
                    {t('campo.nombre')} *
                  </label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                    className="h-9 px-3 border border-[#d1d5db] rounded-lg text-sm bg-white focus:outline-none focus:border-[#1b365d]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#4b5563]">
                    {t('admin.table.cedula')} *
                  </label>
                  <input
                    type="text"
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value)}
                    required
                    className="h-9 px-3 border border-[#d1d5db] rounded-lg text-sm bg-white focus:outline-none focus:border-[#1b365d]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#4b5563]">
                    {t('campo.telefono')} *
                  </label>
                  <input
                    type="text"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    required
                    className="h-9 px-3 border border-[#d1d5db] rounded-lg text-sm bg-white focus:outline-none focus:border-[#1b365d]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#4b5563]">
                    {t('campo.email')}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('campo.email.placeholder') || 'ejemplo@correo.com'}
                    className="h-9 px-3 border border-[#d1d5db] rounded-lg text-sm bg-white focus:outline-none focus:border-[#1b365d]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#4b5563]">
                    {t('campo.edad')}
                  </label>
                  <input
                    type="number"
                    min="14"
                    max="100"
                    value={edad}
                    onChange={(e) => setEdad(e.target.value)}
                    className="h-9 px-3 border border-[#d1d5db] rounded-lg text-sm bg-white focus:outline-none focus:border-[#1b365d]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#4b5563]">
                    {t('campo.genero')}
                  </label>
                  <select
                    value={genero}
                    onChange={(e) => setGenero(e.target.value)}
                    className="h-9 px-3 border border-[#d1d5db] rounded-lg text-sm bg-white focus:outline-none focus:border-[#1b365d]"
                  >
                    {GENEROS.map((g) => (
                      <option key={g.value} value={g.value}>{g.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#4b5563]">
                  {t('campo.profesion')} *
                </label>
                <input
                  type="text"
                  value={profesion}
                  onChange={(e) => setProfesion(e.target.value)}
                  required
                  className="h-9 px-3 border border-[#d1d5db] rounded-lg text-sm bg-white focus:outline-none focus:border-[#1b365d]"
                />
              </div>

              {/* Extranjero checkbox */}
              <div className="pt-2 border-t border-[#f0ede6]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={extranjero}
                    onChange={(e) => setExtranjero(e.target.checked)}
                    className="rounded border-[#d1d5db] text-[#1b365d] focus:ring-[#1b365d] w-4 h-4"
                  />
                  <span className="text-xs font-semibold text-[#4b5563]">
                    {t('admin.editVolunteer.extranjero')}
                  </span>
                </label>
              </div>

              {extranjero ? (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#4b5563]">
                    {t('admin.editVolunteer.pais')}
                  </label>
                  <input
                    type="text"
                    value={pais}
                    onChange={(e) => setPais(e.target.value)}
                    placeholder="Ej. España, Colombia, EE.UU."
                    className="h-9 px-3 border border-[#d1d5db] rounded-lg text-sm bg-white focus:outline-none focus:border-[#1b365d]"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-[#4b5563]">
                      {t('campo.estado')}
                    </label>
                    <select
                      value={estado}
                      onChange={(e) => setEstado(e.target.value)}
                      className="h-9 px-3 border border-[#d1d5db] rounded-lg text-sm bg-white focus:outline-none focus:border-[#1b365d]"
                    >
                      {ESTADOS_VENEZUELA.map((es) => (
                        <option key={es.value} value={es.value}>{es.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-[#4b5563]">
                      {t('campo.municipio')}
                    </label>
                    <input
                      type="text"
                      value={municipio}
                      onChange={(e) => setMunicipio(e.target.value)}
                      className="h-9 px-3 border border-[#d1d5db] rounded-lg text-sm bg-white focus:outline-none focus:border-[#1b365d]"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── TAB 2: ÁREAS Y CAPACIDADES ── */}
          {activeTab === 'areas' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#4b5563] mb-2">
                  {t('admin.detail.areas')}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {AREAS_APOYO.map((a) => {
                    const selected = areas.includes(a.value);
                    return (
                      <button
                        key={a.value}
                        type="button"
                        onClick={() => handleToggleArray(setAreas, areas, a.value)}
                        className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition-all ${
                          selected
                            ? 'bg-[#1b365d]/5 border-[#1b365d] text-[#1b365d] font-semibold'
                            : 'bg-white border-[#d1d5db] text-[#111827] hover:border-[#c9c2b2]'
                        }`}
                      >
                        <span className="text-xs">{lang === 'en' ? a.labelEN : a.label}</span>
                        <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${
                          selected ? 'bg-[#1b365d] text-white' : 'border border-gray-300'
                        }`}>
                          {selected ? '✓' : ''}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Salud subfields */}
              {isSalud && (
                <div className="p-3.5 bg-[#fbf9f4] rounded-xl border border-[#ece6da] space-y-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-[#4b5563]">
                      {t('admin.detail.especialidad')}
                    </label>
                    <input
                      type="text"
                      value={especialidad}
                      onChange={(e) => setEspecialidad(e.target.value)}
                      placeholder="Ej. Medicina General, Pediatría, Enfermería"
                      className="h-9 px-3 border border-[#d1d5db] rounded-lg text-sm bg-white focus:outline-none focus:border-[#1b365d]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-[#4b5563]">
                      {t('admin.detail.grado')}
                    </label>
                    <select
                      value={gradoAcademico}
                      onChange={(e) => setGradoAcademico(e.target.value)}
                      className="h-9 px-3 border border-[#d1d5db] rounded-lg text-sm bg-white focus:outline-none focus:border-[#1b365d]"
                    >
                      {GRADOS_ACADEMICOS.map((g) => (
                        <option key={g.value} value={g.value}>{g.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Transporte subfield */}
              {isTransporte && (
                <div className="p-3.5 bg-[#fbf9f4] rounded-xl border border-[#ece6da]">
                  <label className="block text-xs font-semibold text-[#4b5563] mb-1">
                    {t('admin.detail.vehiculo')}
                  </label>
                  <select
                    value={vehiculo}
                    onChange={(e) => setVehiculo(e.target.value)}
                    className="w-full h-9 px-3 border border-[#d1d5db] rounded-lg text-sm bg-white focus:outline-none focus:border-[#1b365d]"
                  >
                    <option value="">{t('admin.filter.all')}</option>
                    {TIPOS_VEHICULO.map((v) => (
                      <option key={v.value} value={v.value}>{v.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Certificaciones */}
              <div>
                <label className="block text-xs font-semibold text-[#4b5563] mb-2">
                  {t('admin.detail.certificaciones')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {CERTIFICACIONES.map((c) => {
                    const selected = certificaciones.includes(c.value);
                    return (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => handleToggleArray(setCertificaciones, certificaciones, c.value)}
                        className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                          selected
                            ? 'bg-[#1b365d] text-white border-[#1b365d]'
                            : 'bg-white text-[#4b5563] border-[#d1d5db] hover:border-[#1b365d]'
                        }`}
                      >
                        {selected ? '★ ' : ''}{c.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 3: DISPONIBILIDAD Y LOGÍSTICA ── */}
          {activeTab === 'availability' && (
            <div className="space-y-4">
              {/* Zonas Deseadas */}
              <div>
                <label className="block text-xs font-semibold text-[#4b5563] mb-2">
                  {t('admin.editVolunteer.desiredZones')}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ZONAS_DESPLIEGUE.map((z) => {
                    const selected = zonas.includes(z.value);
                    return (
                      <button
                        key={z.value}
                        type="button"
                        onClick={() => handleToggleArray(setZonas, zonas, z.value)}
                        className={`p-2 rounded-lg border text-left text-xs flex items-center justify-between transition-all ${
                          selected
                            ? 'bg-[#1b365d]/5 border-[#1b365d] text-[#1b365d] font-semibold'
                            : 'bg-white border-[#d1d5db] text-[#111827] hover:border-[#c9c2b2]'
                        }`}
                      >
                        <span>{z.label}</span>
                        <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] ${
                          selected ? 'bg-[#1b365d] text-white' : 'border border-gray-300'
                        }`}>
                          {selected ? '✓' : ''}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Grilla de turnos semanal */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-[#4b5563]">
                    {t('admin.detail.disponibilidad')}
                  </label>
                  <span className="text-[10px] text-[#6b7280]">
                    {turnos.length} turnos marcados
                  </span>
                </div>
                <div className="overflow-x-auto pb-2">
                  <div className="grid grid-cols-[auto_repeat(4,1fr)] gap-1.5 max-w-[440px] min-w-[320px] select-none text-xs">
                    <span></span>
                    {TURNOS.map((turno) => (
                      <span key={turno.key} className="font-bold text-[10px] text-[#6b7280] text-center">
                        {turno.label}
                      </span>
                    ))}
                    {DIAS_SEMANA.map((dia) => (
                      <React.Fragment key={dia}>
                        <span className="font-semibold text-xs text-[#4b5563] self-center pr-2">
                          {dia}
                        </span>
                        {TURNOS.map((turno) => {
                          const cellKey = `${dia}-${turno.key}`;
                          const isSelected = turnos.includes(cellKey);
                          return (
                            <button
                              key={cellKey}
                              type="button"
                              onClick={() => handleToggleTurno(cellKey)}
                              className={cn(
                                'h-7 rounded border cursor-pointer transition-all',
                                isSelected
                                  ? 'bg-[#1b365d] border-[#1b365d] text-white text-[10px] font-bold'
                                  : 'bg-[#f0ede6] border-[#d1d5db] hover:border-[#1b365d]/40'
                              )}
                            >
                              {isSelected ? turno.key.toUpperCase() : ''}
                            </button>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>

              {/* Duración, Movilización, Hospedaje */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#f0ede6]">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#4b5563]">
                    {t('admin.detail.duracion')}
                  </label>
                  <select
                    value={duracion}
                    onChange={(e) => setDuracion(e.target.value)}
                    className="h-9 px-2.5 border border-[#d1d5db] rounded-lg text-xs bg-white focus:outline-none focus:border-[#1b365d]"
                  >
                    {DURACION_OPCIONES.map((d) => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#4b5563]">
                    {t('admin.detail.movilizacion')}
                  </label>
                  <select
                    value={movilizacion}
                    onChange={(e) => setMovilizacion(e.target.value)}
                    className="h-9 px-2.5 border border-[#d1d5db] rounded-lg text-xs bg-white focus:outline-none focus:border-[#1b365d]"
                  >
                    <option value="">{t('admin.filter.all')}</option>
                    {OPCIONES_MOVIL.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#4b5563]">
                    {t('admin.detail.hospedaje')}
                  </label>
                  <select
                    value={hospedaje}
                    onChange={(e) => setHospedaje(e.target.value)}
                    className="h-9 px-2.5 border border-[#d1d5db] rounded-lg text-xs bg-white focus:outline-none focus:border-[#1b365d]"
                  >
                    <option value="">{t('admin.filter.all')}</option>
                    {OPCIONES_HOSPEDAJE.map((h) => (
                      <option key={h.value} value={h.value}>{h.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 4: ESTADO Y ASIGNACIÓN ── */}
          {activeTab === 'assignment' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#4b5563]">
                    {t('admin.table.estado')}
                  </label>
                  <select
                    value={estadoVoluntario}
                    onChange={(e) => setEstadoVoluntario(e.target.value)}
                    className="h-9 px-2.5 border border-[#d1d5db] rounded-lg text-xs bg-white focus:outline-none focus:border-[#1b365d] font-semibold"
                  >
                    {ESTADOS_VOLUNTARIO.map((ev) => (
                      <option key={ev.value} value={ev.value}>{ev.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#4b5563]">
                    {t('admin.detail.zoneAssigned')}
                  </label>
                  <select
                    value={zonaAsignada}
                    onChange={(e) => {
                      const val = e.target.value;
                      setZonaAsignada(val);
                      if (val && (estadoVoluntario === 'activo' || estadoVoluntario === 'pendiente')) {
                        setEstadoVoluntario('asignado');
                      } else if (!val && estadoVoluntario === 'asignado') {
                        setEstadoVoluntario('activo');
                      }
                    }}
                    className="h-9 px-2.5 border border-[#d1d5db] rounded-lg text-xs bg-white focus:outline-none focus:border-[#1b365d]"
                  >
                    <option value="">{t('admin.table.sinAsignar')}</option>
                    {ZONAS_DESPLIEGUE.map((z) => (
                      <option key={z.value} value={z.value}>{z.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#4b5563]">
                    {t('admin.assign.turno')}
                  </label>
                  <select
                    value={turnoAsignado}
                    onChange={(e) => setTurnoAsignado(e.target.value)}
                    className="h-9 px-2.5 border border-[#d1d5db] rounded-lg text-xs bg-white focus:outline-none focus:border-[#1b365d]"
                  >
                    <option value="">{t('admin.filter.all')}</option>
                    {TURNOS_ASIGNACION.map((tu) => (
                      <option key={tu} value={tu}>{tu}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#4b5563]">
                  {t('admin.assign.notas')}
                </label>
                <textarea
                  value={notasAdmin}
                  onChange={(e) => setNotasAdmin(e.target.value)}
                  rows={4}
                  placeholder="Observaciones de coordinación, requerimientos especiales o seguimiento..."
                  className="p-3 border border-[#d1d5db] rounded-lg text-xs bg-white focus:outline-none focus:border-[#1b365d] resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-[#f0ede6] bg-[#fbf9f4] flex items-center justify-end gap-3">
          <button
            type="button"
            className="admin-btn admin-btn-ghost sm"
            onClick={handleClose}
          >
            {t('modal.cancel')}
          </button>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="admin-btn admin-btn-primary sm"
          >
            {updateMutation.isPending
              ? t('admin.editVolunteer.saving')
              : t('admin.editVolunteer.save')}
          </button>
        </div>
      </form>
    </dialog>
  );
}
