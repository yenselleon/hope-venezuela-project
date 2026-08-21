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

let inMemoryInventario = [...DEFAULT_INVENTARIO];
let inMemoryCategorias = [
  { id: 'cat-1', slug: 'agua', nombre: 'Agua potable', color: '#003366' },
  { id: 'cat-2', slug: 'higiene', nombre: 'Higiene', color: '#2f7d4f' },
  { id: 'cat-3', slug: 'alimentos', nombre: 'Alimentos', color: '#e6a93a' },
  { id: 'cat-4', slug: 'refugio', nombre: 'Colchones / Refugio', color: '#7a86c8' },
  { id: 'cat-5', slug: 'medicinas', nombre: 'Medicinas', color: '#b06fb0' },
];

const deletedItemIds = new Set();
const deletedCategorySlugs = new Set();
const updatedItemsMap = new Map();
const updatedCategoriesMap = new Map();

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
        // Filtrar eliminados y sobreescribir con actualizados localmente
        const remoteClean = data.filter((i) => !deletedItemIds.has(i.id)).map((i) => {
          return updatedItemsMap.has(i.id) ? { ...i, ...updatedItemsMap.get(i.id) } : i;
        });

        // Combinar con ítems creados localmente que no estén en remoto
        const remoteIds = new Set(remoteClean.map((i) => i.id));
        const localOnly = inMemoryInventario.filter((i) => !remoteIds.has(i.id) && !deletedItemIds.has(i.id));

        items = [...remoteClean, ...localOnly];
        inMemoryInventario = items;
      } else {
        items = inMemoryInventario.filter((i) => !deletedItemIds.has(i.id)).map((i) => {
          return updatedItemsMap.has(i.id) ? { ...i, ...updatedItemsMap.get(i.id) } : i;
        });

        if (filters.search) {
          const s = filters.search.toLowerCase();
          items = items.filter((i) => i.nombre.toLowerCase().includes(s));
        }
        if (filters.categoria) {
          items = items.filter((i) => i.categoria === filters.categoria);
        }
      }
    } catch {
      items = inMemoryInventario.filter((i) => !deletedItemIds.has(i.id)).map((i) => {
        return updatedItemsMap.has(i.id) ? { ...i, ...updatedItemsMap.get(i.id) } : i;
      });
    }

    // Filtrar por zona / centro de acopio si está activo
    const activeZone = filters.zona || filters.centro;
    if (activeZone && activeZone !== 'Todas' && activeZone !== 'Todos') {
      items = items.filter((i) => matchZone(i.centro, activeZone));
    }

    // Client-side quick filter logic for alert status to match UI requirements
    if (filters.alert === 'bajo') {
      items = items.filter((i) => i.cantidad <= i.stock_minimo);
    } else if (filters.alert === 'vence') {
      const today = new Date();
      const in30Days = new Date();
      in30Days.setDate(today.getDate() + 30);
      items = items.filter((i) => {
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

    let createdItem = null;

    try {
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

      if (!error && data) {
        createdItem = data;
        deletedItemIds.delete(data.id);
        inMemoryInventario.push(data);
      }
    } catch {
      // Fallback local
    }

    if (!createdItem) {
      createdItem = {
        id: 'inv-' + Date.now(),
        nombre: item.nombre?.trim(),
        categoria: item.categoria,
        unidad: item.unidad || 'u',
        cantidad: qty,
        stock_minimo: stockMin,
        lote: item.lote?.trim() || 'L-1001',
        fecha_vencimiento: item.fecha_vencimiento || null,
        centro: item.centro || 'Vargas · Casa Misionera',
      };
      deletedItemIds.delete(createdItem.id);
      inMemoryInventario.push(createdItem);
    }

    // Si tiene cantidad inicial, registrar movimiento de entrada en auditoría
    if (qty > 0 && createdItem?.id) {
      try {
        await supabase
          .from('inventario_movimientos')
          .insert({
            inventario_id: createdItem.id,
            tipo: 'entrada',
            cantidad: qty,
            concepto: 'Stock inicial registrado al dar de alta el insumo',
            usuario_email: item.usuario_email || 'coordinador@ready.set.go',
          });
      } catch (logErr) {
        console.warn('No se pudo registrar el movimiento inicial en inventario_movimientos:', logErr);
      }
    }

    return createdItem;
  },

  /**
   * Actualiza los datos de un artículo del inventario.
   */
  update: async (id, item) => {
    const qty = parseInt(item.cantidad, 10);
    const stockMin = parseInt(item.stock_minimo, 10);
    const payload = {
      nombre: item.nombre?.trim(),
      categoria: item.categoria,
      unidad: item.unidad || 'u',
      ...(isNaN(qty) ? {} : { cantidad: qty }),
      ...(isNaN(stockMin) ? {} : { stock_minimo: stockMin }),
      lote: item.lote?.trim() || 'L-1001',
      fecha_vencimiento: item.fecha_vencimiento || null,
      centro: item.centro || 'Vargas · Casa Misionera',
    };

    updatedItemsMap.set(id, payload);

    try {
      const { data, error } = await supabase
        .from('inventario')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        const idx = inMemoryInventario.findIndex((i) => i.id === id);
        if (idx !== -1) inMemoryInventario[idx] = data;
        return data;
      }
    } catch {
      // Fallback local
    }

    const idx = inMemoryInventario.findIndex((i) => i.id === id);
    if (idx !== -1) {
      inMemoryInventario[idx] = { ...inMemoryInventario[idx], ...payload, id };
      return inMemoryInventario[idx];
    }
    return { id, ...payload };
  },

  /**
   * Elimina un artículo del inventario.
   */
  delete: async (id) => {
    deletedItemIds.add(id);
    updatedItemsMap.delete(id);

    try {
      await supabase.from('inventario_movimientos').delete().eq('inventario_id', id);
      await supabase.from('inventario').delete().eq('id', id);
    } catch {
      // Fallback local
    }

    inMemoryInventario = inMemoryInventario.filter((i) => i.id !== id);
    return { success: true, id };
  },

  /**
   * Registra un movimiento de entrada/salida y actualiza el stock síncronamente.
   */
  registerMovement: async (movement) => {
    const { inventario_id, tipo, cantidad, concepto, destino, usuario_email } = movement;
    const qty = parseInt(cantidad, 10);

    let currentStock = 0;
    try {
      const { data: item, error: fetchErr } = await supabase
        .from('inventario')
        .select('cantidad')
        .eq('id', inventario_id)
        .single();

      if (!fetchErr && item) {
        currentStock = item.cantidad || 0;
      } else {
        const found = inMemoryInventario.find((i) => i.id === inventario_id);
        currentStock = found?.cantidad || 0;
      }
    } catch {
      const found = inMemoryInventario.find((i) => i.id === inventario_id);
      currentStock = found?.cantidad || 0;
    }

    const newStock = tipo === 'entrada' ? currentStock + qty : currentStock - qty;
    if (newStock < 0) {
      throw new Error('No hay suficiente stock para realizar esta salida.');
    }

    try {
      await supabase
        .from('inventario_movimientos')
        .insert({
          inventario_id,
          tipo,
          cantidad: qty,
          concepto: concepto?.trim(),
          destino: destino?.trim() || null,
          usuario_email: usuario_email || 'coordinador@ready.set.go',
        });
    } catch {
      // ignore
    }

    try {
      const { data: updatedItem, error: updateErr } = await supabase
        .from('inventario')
        .update({ cantidad: newStock })
        .eq('id', inventario_id)
        .select()
        .single();

      if (!updateErr && updatedItem) {
        const idx = inMemoryInventario.findIndex((i) => i.id === inventario_id);
        if (idx !== -1) inMemoryInventario[idx] = updatedItem;
        return updatedItem;
      }
    } catch {
      // ignore
    }

    const idx = inMemoryInventario.findIndex((i) => i.id === inventario_id);
    if (idx !== -1) {
      inMemoryInventario[idx].cantidad = newStock;
      return inMemoryInventario[idx];
    }

    return { id: inventario_id, cantidad: newStock };
  },

  /**
   * Registra una salida de stock (distribución, merma, traslado) con destino/beneficiario.
   */
  registerExit: async ({ inventario_id, cantidad, concepto, destino, usuario_email }) => {
    return inventarioService.registerMovement({
      inventario_id,
      tipo: 'salida',
      cantidad,
      concepto,
      destino,
      usuario_email,
    });
  },

  /**
   * Obtiene la lista de movimientos registrados, con filtros opcionales por tipo e ítem.
   */
  getMovements: async (filters = {}) => {
    try {
      let query = supabase
        .from('inventario_movimientos')
        .select(`
          *,
          inventario (
            nombre,
            categoria
          )
        `)
        .order('created_at', { ascending: false });

      if (filters.tipo) {
        query = query.eq('tipo', filters.tipo);
      }
      if (filters.inventario_id) {
        query = query.eq('inventario_id', filters.inventario_id);
      }
      query = query.limit(filters.limit || 150);

      const { data, error } = await query;
      if (!error && data) return data;
    } catch {
      // return empty
    }
    return [];
  },

  /**
   * Obtiene el catálogo de categorías de inventario persistidas en Supabase.
   */
  getCategories: async () => {
    try {
      const { data, error } = await supabase
        .from('inventario_categorias')
        .select('*')
        .order('created_at', { ascending: true });

      if (!error && data && data.length > 0) {
        const remoteClean = data.filter((c) => !deletedCategorySlugs.has(c.slug)).map((c) => {
          return updatedCategoriesMap.has(c.slug) ? { ...c, ...updatedCategoriesMap.get(c.slug) } : c;
        });

        const remoteSlugs = new Set(remoteClean.map((c) => c.slug));
        const localOnly = inMemoryCategorias.filter((c) => !remoteSlugs.has(c.slug) && !deletedCategorySlugs.has(c.slug));

        const merged = [...remoteClean, ...localOnly];
        inMemoryCategorias = merged;
        return merged;
      }
    } catch {
      // return fallback
    }

    return inMemoryCategorias.filter((c) => !deletedCategorySlugs.has(c.slug)).map((c) => {
      return updatedCategoriesMap.has(c.slug) ? { ...c, ...updatedCategoriesMap.get(c.slug) } : c;
    });
  },

  /**
   * Crea una nueva categoría en la base de datos con slug normalizado.
   */
  createCategory: async ({ nombre, color = '#003366' }) => {
    const name = nombre?.trim();
    if (!name) throw new Error('El nombre de la categoría es requerido.');

    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');

    deletedCategorySlugs.delete(slug);

    try {
      const { data, error } = await supabase
        .from('inventario_categorias')
        .insert({
          slug,
          nombre: name,
          color: color || '#003366',
        })
        .select()
        .single();

      if (!error && data) {
        inMemoryCategorias.push(data);
        return data;
      }
      if (error && error.code === '23505') {
        throw new Error(`La categoría "${name}" ya existe.`);
      }
    } catch (err) {
      if (err.message && err.message.includes('ya existe')) {
        throw err;
      }
    }

    const exists = inMemoryCategorias.find((c) => c.slug === slug && !deletedCategorySlugs.has(slug));
    if (exists) throw new Error(`La categoría "${name}" ya existe.`);

    const newCat = { id: 'cat-' + Date.now(), slug, nombre: name, color: color || '#003366' };
    inMemoryCategorias.push(newCat);
    return newCat;
  },

  /**
   * Actualiza una categoría existente.
   */
  updateCategory: async (slug, { nombre, color }) => {
    const name = nombre?.trim();
    if (!name) throw new Error('El nombre de la categoría es requerido.');

    const payload = {
      nombre: name,
      ...(color ? { color } : {}),
    };

    updatedCategoriesMap.set(slug, payload);

    try {
      const { data, error } = await supabase
        .from('inventario_categorias')
        .update(payload)
        .eq('slug', slug)
        .select()
        .single();

      if (!error && data) {
        const idx = inMemoryCategorias.findIndex((c) => c.slug === slug);
        if (idx !== -1) inMemoryCategorias[idx] = data;
        return data;
      }
    } catch {
      // Fallback local
    }

    const idx = inMemoryCategorias.findIndex((c) => c.slug === slug);
    if (idx !== -1) {
      inMemoryCategorias[idx] = { ...inMemoryCategorias[idx], ...payload };
      return inMemoryCategorias[idx];
    }
    return { slug, ...payload };
  },

  /**
   * Elimina una categoría si no tiene insumos asignados.
   */
  deleteCategory: async (slug) => {
    // Verificar insumos asignados en memoria
    const assignedCount = inMemoryInventario.filter((i) => i.categoria === slug && !deletedItemIds.has(i.id)).length;
    if (assignedCount > 0) {
      throw new Error(`No se puede eliminar la categoría porque tiene ${assignedCount} insumo(s) asignado(s). Reasigna o elimina los insumos primero.`);
    }

    deletedCategorySlugs.add(slug);
    updatedCategoriesMap.delete(slug);

    try {
      await supabase
        .from('inventario_categorias')
        .delete()
        .eq('slug', slug);
    } catch {
      // Fallback local
    }

    inMemoryCategorias = inMemoryCategorias.filter((c) => c.slug !== slug);
    return { success: true, slug };
  },
};
