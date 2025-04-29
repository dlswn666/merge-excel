'use client';

import React, { useEffect, useState } from 'react';
import { Typography, Box, Paper, CircularProgress } from '@mui/material';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

interface User {
    username: string;
}

export default function Home() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setMounted(true);

        // 클라이언트 사이드에서만 실행
        if (mounted) {
            // 로그인 상태 확인
            const isAuthenticated = Cookies.get('isLoggedIn');

            if (isAuthenticated !== 'true') {
                // 로그인 상태가 아니면 로그인 페이지로 리디렉션
                router.push('/login');
            } else {
                // 사용자 정보 로드
                const userStr = sessionStorage.getItem('user');
                if (userStr) {
                    try {
                        setUser(JSON.parse(userStr));
                    } catch (e) {
                        console.error('Failed to parse user data:', e);
                    }
                }
                setLoading(false);
            }
        }
    }, [mounted, router]);

    // 로딩 중일 때는 로딩 표시
    if (loading && mounted) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Welcome to One Sheet{user?.username ? `, ${user.username}님` : ''}
            </Typography>
            <Paper sx={{ p: 3, mt: 2 }}>
                <Typography variant="h5" gutterBottom>
                    운수사 정산 플랫폼
                </Typography>
                <Typography variant="body1" paragraph>
                    One Sheet는 운수사의 정산 업무를 돕기 위한 웹 기반 도구입니다.
                </Typography>
                <Typography variant="body1">왼쪽 메뉴에서 원하는 기능을 선택하여 시작하세요.</Typography>
            </Paper>
        </Box>
    );
}
