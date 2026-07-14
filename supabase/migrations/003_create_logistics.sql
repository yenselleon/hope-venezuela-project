-- Migration 003: Create logistics, supplies tables and schema upgrades
-- Execute in Supabase SQL Editor

-- 1. Create zonas table
create table if not exists zonas (
  id uuid primary key default gen_random_uuid(),
  nombre text unique not null,
  lat double precision not null,
  lng double precision not null,
  created_at timestamptz default now()
);

-- Seed initial deployment zones
insert into zonas (nombre, lat, lng) values
  ('Vargas · La Guaira', 10.6012, -66.9328),
  ('Miranda · San Antonio', 10.3803, -66.9744),
  ('Miranda · Los Teques', 10.3458, -67.0423),
  ('Aragua · Maracay', 10.2442, -67.6066)
on conflict (nombre) do update set
  lat = excluded.lat,
  lng = excluded.lng;

-- 2. Create inventario table
create table if not exists inventario (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  categoria text not null, -- 'agua', 'alimentos', 'medicinas', 'higiene', 'colchones'
  unidad text not null, -- 'unidades', 'litros', 'kg', 'cajas'
  cantidad int not null default 0,
  stock_minimo int not null default 10,
  lote text default 'L-1001',
  fecha_vencimiento date,
  created_at timestamptz default now()
);

-- Seed initial inventory items
insert into inventario (nombre, categoria, unidad, cantidad, stock_minimo, fecha_vencimiento) values
  ('Agua potable 5L', 'agua', 'unidades', 120, 20, null),
  ('Arroz 1kg', 'alimentos', 'unidades', 85, 25, '2027-06-30'),
  ('Paracetamol 500mg', 'medicinas', 'cajas', 40, 15, '2026-12-31'),
  ('Kit higiene familiar', 'higiene', 'unidades', 110, 15, null),
  ('Colchón matrimonial', 'colchones', 'unidades', 15, 5, null)
on conflict do nothing;

-- 3. Create inventario_movimientos table (Audit log)
create table if not exists inventario_movimientos (
  id uuid primary key default gen_random_uuid(),
  inventario_id uuid references inventario(id) on delete cascade,
  tipo text not null, -- 'entrada' or 'salida'
  cantidad int not null,
  concepto text,
  usuario_email text,
  created_at timestamptz default now()
);

-- 4. Alter voluntarios table for foreign volunteer support
alter table voluntarios add column if not exists extranjero boolean default false;
alter table voluntarios add column if not exists pais text;

-- 5. Enable Row Level Security (RLS)
alter table zonas enable row level security;
alter table inventario enable row level security;
alter table inventario_movimientos enable row level security;

-- 6. Clean and re-create RLS Policies

-- ZONAS Policies
drop policy if exists "coordinador_superadmin_select_zonas" on zonas;
drop policy if exists "superadmin_write_zonas" on zonas;

create policy "coordinador_superadmin_select_zonas" on zonas
  for select to authenticated
  using (
    coalesce(
      auth.jwt() -> 'user_metadata' ->> 'role',
      auth.jwt() -> 'app_metadata' ->> 'role',
      auth.jwt() ->> 'role'
    ) in ('coordinador', 'super_admin')
  );

create policy "superadmin_write_zonas" on zonas
  for all to authenticated
  using (
    coalesce(
      auth.jwt() -> 'user_metadata' ->> 'role',
      auth.jwt() -> 'app_metadata' ->> 'role',
      auth.jwt() ->> 'role'
    ) = 'super_admin'
  );

-- INVENTARIO Policies
drop policy if exists "coordinador_superadmin_all_inventario" on inventario;
drop policy if exists "superadmin_delete_inventario" on inventario;

create policy "coordinador_superadmin_all_inventario" on inventario
  for all to authenticated
  using (
    coalesce(
      auth.jwt() -> 'user_metadata' ->> 'role',
      auth.jwt() -> 'app_metadata' ->> 'role',
      auth.jwt() ->> 'role'
    ) in ('coordinador', 'super_admin')
  )
  with check (
    coalesce(
      auth.jwt() -> 'user_metadata' ->> 'role',
      auth.jwt() -> 'app_metadata' ->> 'role',
      auth.jwt() ->> 'role'
    ) in ('coordinador', 'super_admin')
  );

-- INVENTARIO_MOVIMIENTOS Policies (Append-only by coordinators/admins)
drop policy if exists "coordinador_superadmin_select_movimientos" on inventario_movimientos;
drop policy if exists "coordinador_superadmin_insert_movimientos" on inventario_movimientos;
drop policy if exists "superadmin_delete_movimientos" on inventario_movimientos;

create policy "coordinador_superadmin_select_movimientos" on inventario_movimientos
  for select to authenticated
  using (
    coalesce(
      auth.jwt() -> 'user_metadata' ->> 'role',
      auth.jwt() -> 'app_metadata' ->> 'role',
      auth.jwt() ->> 'role'
    ) in ('coordinador', 'super_admin')
  );

create policy "coordinador_superadmin_insert_movimientos" on inventario_movimientos
  for insert to authenticated
  with check (
    coalesce(
      auth.jwt() -> 'user_metadata' ->> 'role',
      auth.jwt() -> 'app_metadata' ->> 'role',
      auth.jwt() ->> 'role'
    ) in ('coordinador', 'super_admin')
  );

create policy "superadmin_delete_movimientos" on inventario_movimientos
  for delete to authenticated
  using (
    coalesce(
      auth.jwt() -> 'user_metadata' ->> 'role',
      auth.jwt() -> 'app_metadata' ->> 'role',
      auth.jwt() ->> 'role'
    ) = 'super_admin'
  );

-- 7. Modify UPDATE policy for voluntarios table to allow coordinators to edit state/zone
drop policy if exists "admin_update" on voluntarios;

create policy "admin_update" on voluntarios
  for update to authenticated
  using (
    coalesce(
      auth.jwt() -> 'user_metadata' ->> 'role',
      auth.jwt() -> 'app_metadata' ->> 'role',
      auth.jwt() ->> 'role'
    ) in ('coordinador', 'super_admin')
  )
  with check (
    coalesce(
      auth.jwt() -> 'user_metadata' ->> 'role',
      auth.jwt() -> 'app_metadata' ->> 'role',
      auth.jwt() ->> 'role'
    ) in ('coordinador', 'super_admin')
  );
