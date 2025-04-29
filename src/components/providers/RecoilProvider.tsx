'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// RecoilRoot를 클라이언트 측에서만 로드하도록 dynamic import 사용
const RecoilRootClient = dynamic(
    () =>
        import('recoil').then((mod) => {
            const { RecoilRoot } = mod;
            return ({ children }: { children: React.ReactNode }) => <RecoilRoot>{children}</RecoilRoot>;
        }),
    {
        ssr: false,
        // @ts-ignore - Next.js dynamic loading component의 타입 문제 우회
        loading: () => null,
    }
);

// 클라이언트 사이드에서만 Recoil을 사용하기 위한 Provider
export default function RecoilProvider({ children }: { children: React.ReactNode }) {
    return <RecoilRootClient>{children}</RecoilRootClient>;
}
