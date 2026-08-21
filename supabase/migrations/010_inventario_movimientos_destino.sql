-- Agrega destino/beneficiario a los movimientos de inventario y formaliza el tipo
alter table inventario_movimientos add column if not exists destino text;

alter table inventario_movimientos
  add constraint inventario_movimientos_tipo_check
  check (tipo in ('entrada', 'salida'))
  not valid;

alter table inventario_movimientos validate constraint inventario_movimientos_tipo_check;
