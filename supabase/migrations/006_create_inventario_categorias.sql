-- Migration 006: Create inventario_categorias table with referential integrity
-- Execute in Supabase SQL Editor / CLI

-- 1. Create inventario_categorias table
create table if not exists inventario_categorias (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  nombre text not null,
  color text default '#003366',
  created_at timestamptz default now()
);

-- 2. Enable RLS
alter table inventario_categorias enable row level security;

-- 3. RLS Policies
drop policy if exists "coordinador_superadmin_all_categorias" on inventario_categorias;

create policy "coordinador_superadmin_all_categorias" on inventario_categorias
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

-- 4. Seed default categories
insert into inventario_categorias (slug, nombre, color) values
  ('agua', 'Agua potable', '#003366'),
  ('higiene', 'Higiene', '#2f7d4f'),
  ('alimentos', 'Alimentos', '#e6a93a'),
  ('refugio', 'Colchones / Refugio', '#7a86c8'),
  ('medicinas', 'Medicinas', '#b06fb0')
on conflict (slug) do nothing;

-- 5. Add Foreign Key constraint to inventario.categoria
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'fk_inventario_categoria'
  ) then
    alter table inventario
      add constraint fk_inventario_categoria
      foreign key (categoria) references inventario_categorias(slug)
      on update cascade
      on delete restrict;
  end if;
end $$;
