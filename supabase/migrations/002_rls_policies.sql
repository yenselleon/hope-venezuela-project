-- Migration 002: RLS Policies for voluntarios
-- Execute in Supabase SQL Editor AFTER migration 001

alter table voluntarios enable row level security;

-- Limpiar políticas previas para evitar conflictos al re-ejecutar en el editor SQL
drop policy if exists "anon_insert" on voluntarios;
drop policy if exists "coordinador_select" on voluntarios;
drop policy if exists "admin_update" on voluntarios;
drop policy if exists "admin_delete" on voluntarios;

-- Formulario público: permite INSERT tanto a anon (usuarios no registrados) como a authenticated (coordinadores logueados)
create policy "anon_insert" on voluntarios
  for insert to anon, authenticated with check (true);

-- Coordinadores y super_admin pueden leer
create policy "coordinador_select" on voluntarios
  for select to authenticated
  using (
    coalesce(
      auth.jwt() -> 'user_metadata' ->> 'role',
      auth.jwt() -> 'app_metadata' ->> 'role',
      auth.jwt() ->> 'role'
    ) in ('coordinador', 'super_admin')
  );

-- Solo super_admin puede modificar
create policy "admin_update" on voluntarios
  for update to authenticated
  using (
    coalesce(
      auth.jwt() -> 'user_metadata' ->> 'role',
      auth.jwt() -> 'app_metadata' ->> 'role',
      auth.jwt() ->> 'role'
    ) = 'super_admin'
  )
  with check (
    coalesce(
      auth.jwt() -> 'user_metadata' ->> 'role',
      auth.jwt() -> 'app_metadata' ->> 'role',
      auth.jwt() ->> 'role'
    ) = 'super_admin'
  );

-- Solo super_admin puede eliminar
create policy "admin_delete" on voluntarios
  for delete to authenticated
  using (
    coalesce(
      auth.jwt() -> 'user_metadata' ->> 'role',
      auth.jwt() -> 'app_metadata' ->> 'role',
      auth.jwt() ->> 'role'
    ) = 'super_admin'
  );
