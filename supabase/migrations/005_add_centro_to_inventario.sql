-- Migration 005: Add centro to inventario and normalize categories
-- Execute in Supabase SQL Editor / CLI

-- 1. Add centro column to inventario table
alter table inventario add column if not exists centro text default 'Vargas · Casa Misionera';

-- 2. Normalize existing category values (e.g. 'colchones' -> 'refugio')
update inventario set categoria = 'refugio' where categoria = 'colchones';

-- 3. Seed initial inventory items if table is empty
insert into inventario (nombre, categoria, unidad, cantidad, stock_minimo, lote, fecha_vencimiento, centro)
select * from (values
  ('Agua potable 5L', 'agua', 'unidades', 120, 20, 'L-1001', null::date, 'Vargas · Casa Misionera'),
  ('Arroz 1kg', 'alimentos', 'unidades', 85, 25, 'L-1001', '2027-06-30'::date, 'Vargas · Casa Misionera'),
  ('Paracetamol 500mg', 'medicinas', 'cajas', 40, 15, 'L-1001', '2026-12-31'::date, 'Miranda · San Antonio'),
  ('Kit higiene familiar', 'higiene', 'unidades', 110, 15, 'L-1001', null::date, 'Caracas · Centro Principal'),
  ('Colchón matrimonial', 'refugio', 'unidades', 15, 5, 'L-1001', null::date, 'Caracas · Centro Principal')
) as v(nombre, categoria, unidad, cantidad, stock_minimo, lote, fecha_vencimiento, centro)
where not exists (select 1 from inventario limit 1);

-- 4. Update any null centro values
update inventario set centro = 'Vargas · Casa Misionera' where centro is null;
