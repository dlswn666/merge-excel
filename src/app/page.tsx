'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { Box, Typography, CircularProgress } from '@mui/material';

export default function RootPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 쿠키를 통해 로그인 상태 확인
        const isAuthenticated = Cookies.get('isLoggedIn') === 'true';

        // 로그인 상태에 따라 즉시 리디렉션
        if (isAuthenticated) {
            router.replace('/excel-merge');
        } else {
            router.replace('/login');
        }

        // 5초 후에도 리디렉션이 안 되면 로딩 상태 해제 (오류 방지)
        const timer = setTimeout(() => {
            setLoading(false);
        }, 5000);

        return () => clearTimeout(timer);
    }, [router]);

    // 로딩 상태 표시
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                gap: 2,
            }}
        >
            <CircularProgress />
            <Typography variant="body1">로딩 중...</Typography>
        </Box>
    );
}
