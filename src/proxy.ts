import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/auth';

export async function proxy(request: NextRequest) {
  const token = request.cookies.get('bazaar_auth')?.value;
  const session = token ? await decrypt(token) : null;

  const { pathname } = request.nextUrl;

  // Protect customer routes
  if (pathname.startsWith('/customer')) {
    if (!session || session.role !== 'customer') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Protect seller routes
  if (pathname.startsWith('/seller')) {
    if (!session || session.role !== 'seller') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    // Check approval status
    if (pathname !== '/seller/pending') {
      if (session.approvalStatus !== 'approved') {
        return NextResponse.redirect(new URL('/seller/pending', request.url));
      }
    }
  }

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    if (!session || session.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // API protection
  if (pathname.startsWith('/api') && !pathname.startsWith('/api/auth') && !pathname.startsWith('/api/cron')) {
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Add custom header so we can access user info in API routes easily
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', session.id.toString());
    requestHeaders.set('x-user-role', session.role);
    if (session.approvalStatus) {
      requestHeaders.set('x-user-approval', session.approvalStatus);
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
