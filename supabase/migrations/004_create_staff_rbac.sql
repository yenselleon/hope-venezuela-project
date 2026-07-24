-- Migration 004: Staff management & RBAC
-- Fase 4 — Gobernanza
-- Execute in Supabase SQL Editor AFTER migrations 001, 002, 003

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. TABLA admin_users
--    Sincronizada con auth.users. Almacena metadatos de staff.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists admin_users (
  id          uuid primary key references auth.users(id) on delete cascade,
  nombre      text not null,
  email       text unique not null,
  role        text not null default 'coordinador'
                check (role in ('coordinador', 'super_admin')),
  estado      text not null default 'pendiente'
                check (estado in ('activo', 'pendiente', 'inactivo')),
  zonas       text[] default '{}',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Trigger para actualizar updated_at automáticamente
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists admin_users_updated_at on admin_users;
create trigger admin_users_updated_at
  before update on admin_users
  for each row execute function set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. RLS — admin_users
-- ─────────────────────────────────────────────────────────────────────────────
alter table admin_users enable row level security;

drop policy if exists "staff_select" on admin_users;
drop policy if exists "staff_insert" on admin_users;
drop policy if exists "staff_update" on admin_users;
drop policy if exists "staff_delete" on admin_users;

-- Coordinador y super_admin pueden leer
create policy "staff_select" on admin_users
  for select to authenticated
  using (
    coalesce(
      auth.jwt() -> 'user_metadata' ->> 'role',
      auth.jwt() -> 'app_metadata' ->> 'role'
    ) in ('coordinador', 'super_admin')
  );

-- Solo super_admin puede insertar
create policy "staff_insert" on admin_users
  for insert to authenticated
  with check (
    coalesce(
      auth.jwt() -> 'user_metadata' ->> 'role',
      auth.jwt() -> 'app_metadata' ->> 'role'
    ) = 'super_admin'
  );

-- Solo super_admin puede modificar
create policy "staff_update" on admin_users
  for update to authenticated
  using (
    coalesce(
      auth.jwt() -> 'user_metadata' ->> 'role',
      auth.jwt() -> 'app_metadata' ->> 'role'
    ) = 'super_admin'
  )
  with check (
    coalesce(
      auth.jwt() -> 'user_metadata' ->> 'role',
      auth.jwt() -> 'app_metadata' ->> 'role'
    ) = 'super_admin'
  );

-- Solo super_admin puede eliminar (soft-delete vía estado = 'inactivo' preferido)
create policy "staff_delete" on admin_users
  for delete to authenticated
  using (
    coalesce(
      auth.jwt() -> 'user_metadata' ->> 'role',
      auth.jwt() -> 'app_metadata' ->> 'role'
    ) = 'super_admin'
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. TABLA rbac_permissions
--    Matriz de permisos persistida. Una fila por (role, action).
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists rbac_permissions (
  role     text not null check (role in ('public', 'coordinador', 'super_admin')),
  action   text not null,
  allowed  boolean not null default false,
  locked   boolean not null default false,  -- true = columna Super-Admin (no editable)
  primary key (role, action)
);

-- RLS — rbac_permissions
alter table rbac_permissions enable row level security;

drop policy if exists "rbac_select" on rbac_permissions;
drop policy if exists "rbac_update" on rbac_permissions;

-- Coordinador y super_admin pueden leer la matriz
create policy "rbac_select" on rbac_permissions
  for select to authenticated
  using (
    coalesce(
      auth.jwt() -> 'user_metadata' ->> 'role',
      auth.jwt() -> 'app_metadata' ->> 'role'
    ) in ('coordinador', 'super_admin')
  );

-- Solo super_admin puede modificar (y solo filas no bloqueadas)
create policy "rbac_update" on rbac_permissions
  for update to authenticated
  using (
    coalesce(
      auth.jwt() -> 'user_metadata' ->> 'role',
      auth.jwt() -> 'app_metadata' ->> 'role'
    ) = 'super_admin'
    and locked = false
  )
  with check (
    coalesce(
      auth.jwt() -> 'user_metadata' ->> 'role',
      auth.jwt() -> 'app_metadata' ->> 'role'
    ) = 'super_admin'
    and locked = false
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. TABLA rbac_audit_log
--    Registro inmutable de cambios en la matriz de permisos.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists rbac_audit_log (
  id          uuid primary key default gen_random_uuid(),
  changed_by  uuid references auth.users(id),
  changes     jsonb not null,  -- Array de {action, role, old_value, new_value}
  created_at  timestamptz default now()
);

-- RLS — rbac_audit_log
alter table rbac_audit_log enable row level security;

drop policy if exists "audit_select" on rbac_audit_log;
drop policy if exists "audit_insert" on rbac_audit_log;

-- Solo super_admin puede leer el historial de auditoría
create policy "audit_select" on rbac_audit_log
  for select to authenticated
  using (
    coalesce(
      auth.jwt() -> 'user_metadata' ->> 'role',
      auth.jwt() -> 'app_metadata' ->> 'role'
    ) = 'super_admin'
  );

-- super_admin puede insertar entradas de auditoría
create policy "audit_insert" on rbac_audit_log
  for insert to authenticated
  with check (
    coalesce(
      auth.jwt() -> 'user_metadata' ->> 'role',
      auth.jwt() -> 'app_metadata' ->> 'role'
    ) = 'super_admin'
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. SEED DATA — Matriz de permisos inicial (§8 del brief)
-- ─────────────────────────────────────────────────────────────────────────────
insert into rbac_permissions (role, action, allowed, locked) values
  -- Acción: Registrarse / Donar (público)
  ('public',       'register_donate',       true,  false),
  ('coordinador',  'register_donate',       true,  false),
  ('super_admin',  'register_donate',       true,  true),   -- locked

  -- Acción: Ver voluntarios
  ('public',       'view_volunteers',       false, false),
  ('coordinador',  'view_volunteers',       true,  false),
  ('super_admin',  'view_volunteers',       true,  true),   -- locked

  -- Acción: Aprobar voluntarios
  ('public',       'approve_volunteers',    false, false),
  ('coordinador',  'approve_volunteers',    true,  false),
  ('super_admin',  'approve_volunteers',    true,  true),   -- locked

  -- Acción: Revelar datos sensibles
  ('public',       'reveal_sensitive_data', false, false),
  ('coordinador',  'reveal_sensitive_data', true,  false),
  ('super_admin',  'reveal_sensitive_data', true,  true),   -- locked

  -- Acción: Exportar Excel / PDF
  ('public',       'export_data',           false, false),
  ('coordinador',  'export_data',           true,  false),
  ('super_admin',  'export_data',           true,  true),   -- locked

  -- Acción: Gestionar inventario
  ('public',       'manage_inventory',      false, false),
  ('coordinador',  'manage_inventory',      true,  false),
  ('super_admin',  'manage_inventory',      true,  true),   -- locked

  -- Acción: Gestionar admins / RBAC (CRÍTICA — solo super_admin)
  ('public',       'manage_admins_rbac',    false, false),
  ('coordinador',  'manage_admins_rbac',    false, false),
  ('super_admin',  'manage_admins_rbac',    true,  true)    -- locked
on conflict (role, action) do update
  set allowed = excluded.allowed,
      locked  = excluded.locked;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. SEED DATA — Super-admin semillas
--    INSTRUCCIÓN: Ejecutar DESPUÉS de que los usuarios existan en auth.users.
--    Obtener los UUIDs reales desde el panel de Supabase Auth y sustituirlos.
-- ─────────────────────────────────────────────────────────────────────────────
-- NOTA: Descomentar y ejecutar manualmente después de obtener los UUIDs reales.
-- Los emails son: voluntariosrsg@gmail.com y yensel41@gmail.com

-- INSERT INTO admin_users (id, nombre, email, role, estado, zonas) VALUES
--   ('<UUID_voluntariosrsg>', 'Hope Admin', 'voluntariosrsg@gmail.com', 'super_admin', 'activo', '{}'),
--   ('<UUID_yensel41>',       'Yensel León', 'yensel41@gmail.com',      'super_admin', 'activo', '{}')
-- ON CONFLICT (id) DO UPDATE
--   SET role = 'super_admin', estado = 'activo';
