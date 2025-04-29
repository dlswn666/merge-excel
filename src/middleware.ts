import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // 현재 경로
    const path = request.nextUrl.pathname;

    // 로그인이 필요하지 않은 공개 경로들
    const publicPaths = ['/login'];

    // 현재 로그인 상태 (쿠키에서 확인)
    const isAuthenticated = request.cookies.get('isLoggedIn')?.value === 'true';

    // 루트 경로일 경우 로그인 상태에 따라 리디렉션
    if (path === '/') {
        if (isAuthenticated) {
            return NextResponse.redirect(new URL('/home', request.url));
        } else {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // 로그인이 필요한 경로이고 로그인되지 않은 경우
    if (!publicPaths.includes(path) && !isAuthenticated) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // 이미 로그인된 상태에서 로그인 페이지 접근 시 홈으로 리디렉션
    if (path === '/login' && isAuthenticated) {
        return NextResponse.redirect(new URL('/home', request.url));
    }

    return NextResponse.next();
}

// 미들웨어가 실행될 경로 지정
export const config = {
    matcher: [
        // 특정 경로만 처리
        '/',
        '/login',
        '/home',
        '/excel-merge/:path*',
    ],
};
