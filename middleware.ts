// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Skip middleware untuk public routes dan static files
  const publicRoutes = ['/login', '/', '/api'];
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
  
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Buat Supabase client untuk middleware
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Ambil auth token dari localStorage melalui cookie
  // Supabase biasanya menyimpan dengan format sb-[project-ref]-auth-token
  const authCookie = req.cookies.get('sb-lmvcfrtzescnsrqvyspq-auth-token')?.value;
  
  // Jika tidak ada auth cookie, coba cek dengan nama yang umum
  const fallbackAuthCookie = req.cookies.get('supabase-auth-token')?.value;

  // Jika tidak ada token sama sekali, redirect ke login
  if (!authCookie && !fallbackAuthCookie) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    // Untuk middleware, kita tidak bisa menggunakan localStorage
    // Jadi kita akan mengandalkan header Authorization jika ada
    const authorization = req.headers.get('authorization');
    
    if (!authorization && !authCookie && !fallbackAuthCookie) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Cek akses ke halaman admin
    if (pathname.startsWith('/admin')) {
      const isAdmin = req.cookies.get('is-admin')?.value === 'true';
      
      if (!isAdmin) {
        // User biasa tidak bisa akses admin, redirect ke home
        return NextResponse.redirect(new URL('/', req.url));
      }
    }

    return NextResponse.next();
    
  } catch (error) {
    console.error('Middleware error:', error);
    // Jika ada error, redirect ke login untuk safety
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public|.*\\.).*)',
  ],
};
