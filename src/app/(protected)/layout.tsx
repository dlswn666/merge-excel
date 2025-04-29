'use client';

import React from 'react';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    // 루트 레이아웃에서 MainLayout을 사용하므로 여기서는 children만 반환
    return <>{children}</>;
}
