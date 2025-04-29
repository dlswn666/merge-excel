'use client';

import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

interface User {
    userId: string;
}

export default function Header() {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        if (mounted) {
            // 로그인 상태 확인
            const isAuthenticated = Cookies.get('isLoggedIn');
            setIsLoggedIn(isAuthenticated === 'true');

            // 사용자 정보 로드
            const userStr = sessionStorage.getItem('user');
            if (userStr) {
                try {
                    setUser(JSON.parse(userStr));
                } catch (e) {
                    console.error('Failed to parse user data:', e);
                }
            }
        }
    }, [mounted]);

    const handleLogout = () => {
        // 클라이언트 사이드에서만 실행
        if (mounted) {
            // 쿠키 제거
            Cookies.remove('isLoggedIn');

            // 세션 스토리지 데이터 제거
            sessionStorage.removeItem('user');

            // 로그인 페이지로 이동
            router.push('/login');
        }
    };

    return (
        <AppBar
            position="fixed"
            elevation={0}
            sx={{
                backgroundColor: 'white',
                borderBottom: '1px solid',
                borderColor: 'divider',
                color: 'text.primary',
                zIndex: (theme) => theme.zIndex.drawer + 1,
            }}
        >
            <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box component="img" src="/logo/logo.png" alt="로고" sx={{ height: 70, width: 'auto', ml: -3 }} />
                    <Typography variant="h6" component="div" sx={{ fontWeight: 600, mr: 1, mt: 1 }}>
                        One sheet 운수사 정산 플랫폼
                    </Typography>
                </Box>

                {mounted && isLoggedIn && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {user && (
                            <Typography variant="body1" sx={{ mr: 2 }}>
                                {user.userId}님 환영합니다
                            </Typography>
                        )}
                        <Button variant="outlined" color="primary" onClick={handleLogout} sx={{ ml: 1 }}>
                            로그아웃
                        </Button>
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
}
