import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';

const protectedRoutes = ['/dashboard', '/admin'];
const publicRoutes = ['/auth/login', '/auth/register'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = protectedRoutes.some(p => pathname.startsWith(p));
  const isPublic = publicRoutes.some(p => pathname.startsWith(p));

  if (!isProtected && !isPublic && pathname !== '/') {
    return NextResponse.next();
  }

  const res = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (isProtected && !user) {
    const loginUrl = new URL('/auth/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isPublic && user) {
    if (pathname === '/auth/register') {
      const plan = req.nextUrl.searchParams.get('plan')
      const model = req.nextUrl.searchParams.get('model')
      if (plan) {
        const payUrl = new URL('/dashboard/payment', req.url)
        payUrl.searchParams.set('plan', plan)
        payUrl.searchParams.set('model', model || '2step')
        return NextResponse.redirect(payUrl)
      }
    }
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  if (pathname.startsWith('/admin') && user) {
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
    const { data: profile } = await admin
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  // Redirect to mode selection if active challenge has no trading_mode
  if (pathname.startsWith('/dashboard') && pathname !== '/dashboard/select-mode' && user) {
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
    const { data: challenge } = await admin
      .from('challenges')
      .select('trading_mode, status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (challenge && challenge.status === 'active' && !challenge.trading_mode) {
      return NextResponse.redirect(new URL('/dashboard/select-mode', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/auth/login', '/auth/register'],
};
