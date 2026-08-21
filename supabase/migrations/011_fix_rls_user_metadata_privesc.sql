-- Corrige escalamiento de privilegios: todas las policies usaban
-- COALESCE(user_metadata->>'role', app_metadata->>'role', ...), y user_metadata
-- es editable por el propio usuario autenticado vía supabase.auth.updateUser().
-- Un usuario cualquiera podía auto-asignarse role: 'super_admin' en su JWT y
-- pasar estas políticas. Se elimina user_metadata de la cadena: solo app_metadata
-- (escribible únicamente por el backend con service_role) decide el rol.

-- ── admin_users ──
drop policy if exists staff_select on admin_users;
create policy staff_select on admin_users for select
  using (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = any (array['coordinador','super_admin']));

drop policy if exists staff_insert on admin_users;
create policy staff_insert on admin_users for insert
  with check (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'super_admin');

drop policy if exists staff_update on admin_users;
create policy staff_update on admin_users for update
  using (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'super_admin')
  with check (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'super_admin');

drop policy if exists staff_delete on admin_users;
create policy staff_delete on admin_users for delete
  using (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'super_admin');

-- ── voluntarios ──
drop policy if exists coordinador_select on voluntarios;
create policy coordinador_select on voluntarios for select
  using (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = any (array['coordinador','super_admin']));

drop policy if exists admin_update on voluntarios;
create policy admin_update on voluntarios for update
  using (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = any (array['coordinador','super_admin']))
  with check (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = any (array['coordinador','super_admin']));

drop policy if exists admin_delete on voluntarios;
create policy admin_delete on voluntarios for delete
  using (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'super_admin');

-- ── zonas ──
drop policy if exists coordinador_superadmin_select_zonas on zonas;
create policy coordinador_superadmin_select_zonas on zonas for select
  using (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = any (array['coordinador','super_admin']));

drop policy if exists superadmin_write_zonas on zonas;
create policy superadmin_write_zonas on zonas for all
  using (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'super_admin');

-- ── inventario ──
drop policy if exists coordinador_superadmin_all_inventario on inventario;
create policy coordinador_superadmin_all_inventario on inventario for all
  using (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = any (array['coordinador','super_admin']))
  with check (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = any (array['coordinador','super_admin']));

-- ── inventario_movimientos ──
drop policy if exists coordinador_superadmin_select_movimientos on inventario_movimientos;
create policy coordinador_superadmin_select_movimientos on inventario_movimientos for select
  using (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = any (array['coordinador','super_admin']));

drop policy if exists coordinador_superadmin_insert_movimientos on inventario_movimientos;
create policy coordinador_superadmin_insert_movimientos on inventario_movimientos for insert
  with check (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = any (array['coordinador','super_admin']));

drop policy if exists superadmin_delete_movimientos on inventario_movimientos;
create policy superadmin_delete_movimientos on inventario_movimientos for delete
  using (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'super_admin');

-- ── inventario_categorias ──
drop policy if exists coordinador_superadmin_all_categorias on inventario_categorias;
create policy coordinador_superadmin_all_categorias on inventario_categorias for all
  using (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = any (array['coordinador','super_admin']))
  with check (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = any (array['coordinador','super_admin']));

-- ── rbac_permissions ──
drop policy if exists rbac_select on rbac_permissions;
create policy rbac_select on rbac_permissions for select
  using (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = any (array['coordinador','super_admin']));

drop policy if exists rbac_update on rbac_permissions;
create policy rbac_update on rbac_permissions for update
  using (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'super_admin' and locked = false)
  with check (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'super_admin' and locked = false);

-- ── rbac_audit_log ──
drop policy if exists audit_select on rbac_audit_log;
create policy audit_select on rbac_audit_log for select
  using (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'super_admin');

drop policy if exists audit_insert on rbac_audit_log;
create policy audit_insert on rbac_audit_log for insert
  with check (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'super_admin');
