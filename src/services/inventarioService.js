import { supabase } from '@/lib/supabase';
import { matchZone } from '@/utils/formatters';

const DEFAULT_INVENTARIO = [
  { id: 'inv-1', nombre: 'Agua potable 1L', categoria: 'agua', unidad: 'u', cantidad: 10, stock_minimo: 15, lote: 'I-1', fecha_vencimiento: '2026-08-31', centro: 'Vargas · Casa Misionera' },
  { id: 'inv-2', nombre: 'Agua potable 5L', categoria: 'agua', unidad: 'unidades', cantidad: 120, stock_minimo: 20, lote: 'L-1001', fecha_vencimiento: null, centro: 'Vargas · Casa Misionera' },
  { id: 'inv-3', nombre: 'Arroz 1kg', categoria: 'alimentos', unidad: 'unidades', cantidad: 85, stock_minimo: 25, lote: 'L-1001', fecha_vencimiento: '2027-06-30', centro: 'Vargas · Casa Misionera' },
  { id: 'inv-4', nombre: 'Colchón matrimonial', categoria: 'refugio', unidad: 'unidades', cantidad: 15, stock_minimo: 5, lote: 'L-1001', fecha_vencimiento: null, centro: 'Caracas · Centro Principal' },
  { id: 'inv-5', nombre: 'Kit higiene familiar', categoria: 'higiene', unidad: 'unidades', cantidad: 110, stock_minimo: 15, lote: 'L-1001', fecha_vencimiento: null, centro: 'Caracas · Centro Principal' },
  { id: 'inv-6', nombre: 'Paracetamol 500mg', categoria: 'medicinas', unidad: 'cajas', cantidad: 40, stock_minimo: 15, lote: 'L-1001', fecha_vencimiento: '2026-12-31', centro: 'Miranda · San Antonio' },
  { id: 'inv-7', nombre: 'Kits Primeros Auxilios', categoria: 'medicinas', unidad: 'cajas', cantidad: 30, stock_minimo: 50, lote: 'L-1002', fecha_vencimiento: '2027-01-15', centro: 'Miranda · Los Teques' },
  { id: 'inv-8', nombre: 'Pastillas Potabilizadoras', categoria: 'agua', unidad: 'cajas', cantidad: 250, stock_minimo: 50, lote: 'L-1003', fecha_vencimiento: null, centro: 'Aragua · Maracay' },
];

export const inventarioService = {
  /**
   * Obtiene todos los artículos en inventario con filtros.
   */
  getAll: async (filters = {}) => {
    let items = [];
    try {
      let query = supabase
        .from('inventario')
        .select('*')
        .order('nombre', { ascending: true });

      if (filters.search) {
        query = query.ilike('nombre', `%${filters.search}%`);
      }

      if (filters.categoria) {
        query = query.eq('categoria', filters.categoria);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        items = data;
      } else {
        items = DEFAULT_INVENTARIO;
        if (filters.search) {
          const s = filters.search.toLowerCase();
          items = items.filter(i => i.nombre.toLowerCase().includes(s));
        }
        if (filters.categoria) {
          items = items.filter(i => i.categoria === filters.categoria);
        }
      }
    } catch {
      items = DEFAULT_INVENTARIO;
    }

    // Filtrar por zona / centro de acopio si está activo
    const activeZone = filters.zona || filters.centro;
    if (activeZone && activeZone !== 'Todas' && activeZone !== 'Todos') {
      items = items.filter((i) => matchZone(i.centro, activeZone));
    }

    // Client-side quick filter logic for alert status to match UI requirements
    if (filters.alert === 'bajo') {
      items = items.filter(i => i.cantidad <= i.stock_minimo);
    } else if (filters.alert === 'vence') {
      const today = new Date();
      const in30Days = new Date();
      in30Days.setDate(today.getDate() + 30);
      items = items.filter(i => {
        if (!i.fecha_vencimiento) return false;
        const expDate = new Date(i.fecha_vencimiento);
        return expDate >= today && expDate <= in30Days;
      });
    }

    return items;
  },

  /**
   * Crea un nuevo artículo en el catálogo de inventario y registra su stock inicial en auditoría.
   */
  create: async (item) => {
    const qty = parseInt(item.cantidad, 10) || 0;
    const stockMin = parseInt(item.stock_minimo, 10) || 10;

    const { data, error } = await supabase
      .from('inventario')
      .insert({
        nombre: item.nombre?.trim(),
        categoria: item.categoria,
        unidad: item.unidad || 'u',
        cantidad: qty,
        stock_minimo: stockMin,
        lote: item.lote?.trim() || 'L-1001',
        fecha_vencimiento: item.fecha_vencimiento || null,
        centro: item.centro || 'Vargas · Casa Misionera',
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Si tiene cantidad inicial, registrar movimiento de entrada en auditoría
    if (qty > 0 && data?.id) {
      try {
        await supabase
          .from('inventario_movimientos')
          .insert({
            inventario_id: data.id,
            tipo: 'entrada',
            cantidad: qty,
            concepto: 'Stock inicial registrado al dar de alta el insumo',
            usuario_email: item.usuario_email || 'coordinador@ready.set.go',
          });
      } catch (logErr) {
        console.warn('No se pudo registrar el movimiento inicial en inventario_movimientos:', logErr);
      }
    }

    return data;
  },

  /**
   * Registra un movimiento de entrada/salida y actualiza el stock síncronamente.
   */
  registerMovement: async (movement) => {
    const { inventario_id, tipo, cantidad, concepto, usuario_email } = movement;
    const qty = parseInt(cantidad, 10);

    // 1. Obtener artículo actual
    const { data: item, error: fetchErr } = await supabase
      .from('inventario')
      .select('cantidad')
      .eq('id', inventario_id)
      .single();

    if (fetchErr) throw new Error(fetchErr.message);

    // 2. Calcular nuevo stock
    const currentStock = item.cantidad || 0;
    const newStock = tipo === 'entrada' ? currentStock + qty : currentStock - qty;

    if (newStock < 0) {
      throw new Error('No hay suficiente stock para realizar esta salida.');
    }

    // 3. Insertar movimiento
    const { error: moveErr } = await supabase
      .from('inventario_movimientos')
      .insert({
        inventario_id,
        tipo,
        cantidad: qty,
        concepto: concepto?.trim(),
        usuario_email: usuario_email || 'coordinador@ready.set.go',
      });

    if (moveErr) throw new Error(moveErr.message);

    // 4. Actualizar inventario
    const { data: updatedItem, error: updateErr } = await supabase
      .from('inventario')
      .update({ cantidad: newStock })
      .eq('id', inventario_id)
      .select()
      .single();

    if (updateErr) throw new Error(updateErr.message);

    return updatedItem;
  },

  /**
   * Obtiene la lista de movimientos registrados.
   */
  getMovements: async () => {
    const { data, error } = await supabase
      .from('inventario_movimientos')
      .select(`
        *,
        inventario (
          nombre,
          categoria
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  },

  /**
   * Obtiene el catálogo de categorías de inventario persistidas en Supabase.
   */
  getCategories: async () => {
    const { data, error } = await supabase
      .from('inventario_categorias')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
  },

  /**
   * Crea una nueva categoría en la base de datos con slug normalizado.
   */
  createCategory: async ({ nombre, color = '#003366' }) => {
    const name = nombre?.trim();
    if (!name) throw new Error('El nombre de la categoría es requerido.');

    // Generar slug normalizado sin acentos ni caracteres especiales
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');

    const { data, error } = await supabase
      .from('inventario_categorias')
      .insert({
        slug,
        nombre: name,
        color: color || '#003366',
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error(`La categoría "${name}" ya existe.`);
      }
      throw new Error(error.message);
    }
    return data;
  },
};
