-- Migration 001: Create voluntarios table
-- Execute in Supabase SQL Editor

create table voluntarios (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),

  -- Step 1: Datos personales
  nombre text not null,
  cedula text not null,
  edad int,
  telefono text not null,
  genero text,
  estado text,
  municipio text,
  profesion text not null,

  -- Step 2: Áreas de apoyo
  areas text[] default '{}',
  especialidad_salud text,
  grado_academico text,
  vehiculo text,
  certificaciones text[] default '{}',

  -- Step 3: Disponibilidad
  zonas text[] default '{}',
  hospedaje text,
  familia text[] default '{}',
  movilizacion text,
  apoyo_logistico text[] default '{}',
  turnos text[] default '{}',
  duracion text,
  duracion_dias int,

  -- Admin
  estado_voluntario text default 'pendiente',
  zona_asignada text,
  turno_asignado text,
  coordinador_id uuid,
  notas_admin text
);
