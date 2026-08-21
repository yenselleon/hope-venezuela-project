-- Migration 009: Normalize volunteer status, assigned zone consistency and PostgreSQL Trigger
-- Hope en Venezuela

-- 1. Actualizar a 'asignado' a todos los voluntarios que ya tienen una zona asignada
UPDATE voluntarios
SET estado_voluntario = 'asignado'
WHERE zona_asignada IS NOT NULL
  AND zona_asignada != ''
  AND estado_voluntario IN ('activo', 'aprobado');

-- 2. Restaurar a 'activo' a aquellos voluntarios que tengan estado 'asignado' pero no tengan ninguna zona asignada
UPDATE voluntarios
SET estado_voluntario = 'activo'
WHERE (zona_asignada IS NULL OR zona_asignada = '')
  AND estado_voluntario = 'asignado';

-- 3. Crear función de sincronización automática de estado en PostgreSQL
CREATE OR REPLACE FUNCTION trg_fn_sync_volunteer_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Si se asigna zona y el estado era activo o aprobado, promover a 'asignado'
  IF NEW.zona_asignada IS NOT NULL AND NEW.zona_asignada <> '' THEN
    IF NEW.estado_voluntario IN ('activo', 'aprobado') THEN
      NEW.estado_voluntario := 'asignado';
    END IF;
  -- Si se remueve la zona y el estado era 'asignado', regresar a 'activo'
  ELSIF (NEW.zona_asignada IS NULL OR NEW.zona_asignada = '') THEN
    IF NEW.estado_voluntario = 'asignado' THEN
      NEW.estado_voluntario := 'activo';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Crear Trigger que dispara la sincronización antes de cualquier INSERT o UPDATE
DROP TRIGGER IF EXISTS trg_sync_volunteer_status ON voluntarios;
CREATE TRIGGER trg_sync_volunteer_status
  BEFORE INSERT OR UPDATE OF zona_asignada, estado_voluntario ON voluntarios
  FOR EACH ROW
  EXECUTE FUNCTION trg_fn_sync_volunteer_status();
