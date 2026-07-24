// src/services/inventarioService.js
// Servicio de inventario e insumos — Conexión real con Supabase.

import { supabase } from '@/lib/supabase';

export const inventarioService = {
  /**
   * Obtiene todos los artículos en inventario con filtros.
   */
  getAll: async (filters = {}) => {
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
    if (error) throw new Error(error.message);

    // Client-side quick filter logic for alert status to match UI requirements
    let items = data || [];
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
   * Crea un nuevo artículo en el catálogo de inventario.
   */
  create: async (item) => {
    const { data, error } = await supabase
      .from('inventario')
      .insert({
        nombre: item.nombre?.trim(),
        categoria: item.categoria,
        unidad: item.unidad,
        cantidad: parseInt(item.cantidad, 10) || 0,
        stock_minimo: parseInt(item.stock_minimo, 10) || 10,
        lote: item.lote || 'L-1001',
        fecha_vencimiento: item.fecha_vencimiento || null,
        centro: item.centro || 'Vargas · Casa Misionera',
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
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
};
