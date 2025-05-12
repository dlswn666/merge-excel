'use client';

import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import dynamic from 'next/dynamic';
import MUIProvider from '../providers/MUIProvider';
import { usePathname } from 'next/navigation';
import Cookies from 'js-cookie';

// Header 컴포넌트를 클라이언트 측에서만 로드
const Header = dynamic(() => import('./Header'), { ssr: false });

// Sidebar 컴포넌트를 클라이언트 측에서만 로드
const Sidebar = dynamic(() => import('./Sidebar'), { ssr: false });

interface MainLayoutProps {
    children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const [mounted, setMounted] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const pathname = usePathname();

    // 로그인 페이지인지 확인
    const isLoginPage = pathname === '/login';

    useEffect(() => {
        setMounted(true);

        if (mounted) {
            // 쿠키를 확인하여 로그인 상태 파악
            const isAuthenticated = Cookies.get('isLoggedIn') === 'true';
            setIsLoggedIn(isAuthenticated);
        }
    }, [mounted]);

    return (
        <MUIProvider>
            <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'white' }}>
                {/* 로그인 페이지가 아니고 로그인된 상태일 때만 헤더와 사이드바 표시 */}
                {mounted && isLoggedIn && !isLoginPage && (
                    <>
                        <Header />
                        <Sidebar />
                    </>
                )}

                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        width: mounted && isLoggedIn && !isLoginPage ? { sm: `calc(100% - 240px)` } : '100%',
                        mr: mounted && isLoggedIn && !isLoginPage ? { sm: '200px' } : 0,
                        mt: mounted && isLoggedIn && !isLoginPage ? '100px' : 0,
                    }}
                >
                    {children}
                </Box>
            </Box>
        </MUIProvider>
    );
};

export default MainLayout;
