-- Migration 008: Add granular inventory actions and user-specific permissions support
-- Phase 4 Governance & Phase 3 Inventory enhancements

-- 1. Add column permisos_especificos to admin_users if not exists
alter table admin_users add column if not exists permisos_especificos text[] default '{}';

-- 2. Insert new inventory action permissions in rbac_permissions
insert into rbac_permissions (role, action, allowed, locked) values
  -- Acción: Editar insumos
  ('public',       'edit_inventory',        false, false),
  ('coordinador',  'edit_inventory',        true,  false),
  ('super_admin',  'edit_inventory',        true,  true),   -- locked

  -- Acción: Eliminar insumos (restringida por defecto a super_admin)
  ('public',       'delete_inventory',      false, false),
  ('coordinador',  'delete_inventory',      false, false),
  ('super_admin',  'delete_inventory',      true,  true),   -- locked

  -- Acción: Gestionar categorías (crear, editar, eliminar categorías)
  ('public',       'manage_categories',     false, false),
  ('coordinador',  'manage_categories',     false, false),
  ('super_admin',  'manage_categories',     true,  true)    -- locked
on conflict (role, action) do update
  set allowed = excluded.allowed,
      locked  = excluded.locked;
