// supabase/functions/invite-admin/index.ts
// Edge Function: Invitar nuevo administrador al sistema Hope en Venezuela
// Requiere service_role key (configurada automáticamente en el entorno de Supabase Functions)
// Solo accesible por super_admin autenticado.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface InvitePayload {
  nombre: string;
  email: string;
  role: 'coordinador' | 'super_admin';
  zonas?: string[];
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // 1. Verificar que el caller está autenticado y es super_admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Cliente con la clave anon del caller — para verificar su rol
    const supabaseAnon = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user: caller }, error: callerError } = await supabaseAnon.auth.getUser();
    if (callerError || !caller) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const callerRole =
      caller.user_metadata?.role ||
      caller.app_metadata?.role;

    if (callerRole !== 'super_admin') {
      return new Response(JSON.stringify({ error: 'Forbidden: super_admin required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Parsear y validar el body
    const body: InvitePayload = await req.json();
    const { nombre, email, role, zonas = [] } = body;

    if (!nombre || !email || !role) {
      return new Response(JSON.stringify({ error: 'Missing required fields: nombre, email, role' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!['coordinador', 'super_admin'].includes(role)) {
      return new Response(JSON.stringify({ error: 'Invalid role. Must be coordinador or super_admin' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. Crear el usuario con service_role (privilegios de admin)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: false, // Requiere que el usuario confirme su email
      user_metadata: {
        nombre,
        role,
      },
      app_metadata: {
        role,
      },
    });

    if (createError) {
      // Si el usuario ya existe, retornar error descriptivo
      if (createError.message?.includes('already registered')) {
        return new Response(JSON.stringify({ error: 'Este correo ya está registrado en el sistema' }), {
          status: 409,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw createError;
    }

    const newUserId = newUser.user.id;

    // 4. Insertar en admin_users con estado 'pendiente'
    const { error: insertError } = await supabaseAdmin
      .from('admin_users')
      .insert({
        id: newUserId,
        nombre,
        email,
        role,
        estado: 'pendiente',
        zonas,
      });

    if (insertError) {
      // Rollback: eliminar el usuario auth si falla el insert
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      throw insertError;
    }

    // 5. Enviar invitación por email (link de reseteo sirve como onboarding)
    const { error: inviteError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo: `${Deno.env.get('SITE_URL') ?? 'https://hope-venezuela.pages.dev'}/admin/login`,
      },
    });

    // No bloqueamos el flujo si el email falla — el admin puede reenviar
    if (inviteError) {
      console.warn('Failed to send invite email:', inviteError.message);
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: newUserId,
          nombre,
          email,
          role,
          estado: 'pendiente',
          zonas,
        },
      }),
      {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    console.error('Error in invite-admin:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
