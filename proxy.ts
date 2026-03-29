// proxy.ts
import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

export async function proxy(req: NextRequest) {
  const res = NextResponse.next();
  const pathname = req.nextUrl.pathname;

  // EN DESARROLLO: /admin sin autenticación
  if (process.env.NODE_ENV === 'development' && pathname.startsWith('/admin')) {
    return res;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return req.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const adminEmails = ['alexcollspeyra@gmail.com', 'chathostapp@gmail.com'];
  const isAdmin = user?.email && adminEmails.includes(user.email);

  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      const loginUrl = new URL('/auth/login', req.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return res;
  }

  if (pathname.startsWith('/admin')) {
    if (!user) {
      const loginUrl = new URL('/auth/login', req.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (isAdmin) return res;

    const clientDetailMatch = pathname.match(/^\/admin\/clients\/([^/]+)/);
    if (clientDetailMatch) {
      const { data: clientUser } = await supabase
        .from('client_users').select('client_id').eq('email', user.email).single();
      if (clientUser && clientDetailMatch[1] === clientUser.client_id) return res;
    }

    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
