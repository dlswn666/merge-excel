'use client';

import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    // 직접 로그인 페이지에 스타일을 적용했으므로 여기서는 children만 반환
    return <>{children}</>;
}
