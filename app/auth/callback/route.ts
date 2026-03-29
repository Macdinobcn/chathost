// app/auth/callback/route.ts
// Supabase redirige aquí después del magic link
// Intercambia el code por una sesión y redirige al dashboard

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );
    
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Redirigir al dashboard del cliente
      return NextResponse.redirect(`${origin}${next}`);
    }
    
    console.error('[auth/callback] Error al intercambiar code:', error);
  }

  // Si algo falla, volver al login con error
  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
}
