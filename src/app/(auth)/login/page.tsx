'use client';

import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Checkbox, FormControlLabel } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useSetRecoilState } from 'recoil';
import { authState } from '@/store/atoms';
import Cookies from 'js-cookie';
import Image from 'next/image';

interface User {
    userId: string;
}

interface AuthState {
    isLoggedIn: boolean;
    user: User | null;
}

// 테스트용 로그인 정보
const TEST_USER = {
    id: 'TEST123',
    password: '123',
};

export default function Login() {
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [mounted, setMounted] = useState(false);
    const [isLoginError, setIsLoginError] = useState(false);
    const router = useRouter();
    const setAuth = useSetRecoilState(authState);

    // 저장된 로그인 정보 불러오기
    useEffect(() => {
        setMounted(true);
        const isAuthenticated = Cookies.get('isLoggedIn');
        if (isAuthenticated === 'true') {
            router.push('/home');
            return;
        }

        const savedLoginInfo = localStorage.getItem('rememberedLogin');
        if (savedLoginInfo) {
            const {
                userId: savedUserId,
                password: savedPassword,
                rememberMe: savedRememberMe,
            } = JSON.parse(savedLoginInfo);
            setUserId(savedUserId);
            setPassword(savedPassword);
            setRememberMe(savedRememberMe);
        }
    }, [router]);

    // 로그인 검증 함수
    const validateLogin = (inputId: string, inputPassword: string): boolean => {
        return inputId === TEST_USER.id && inputPassword === TEST_USER.password;
    };

    // 로그인 정보 저장 함수
    const saveLoginInfo = (userId: string, password: string, remember: boolean) => {
        if (remember) {
            localStorage.setItem(
                'rememberedLogin',
                JSON.stringify({
                    userId,
                    password,
                    rememberMe: remember,
                })
            );
        } else {
            localStorage.removeItem('rememberedLogin');
        }
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (userId && password) {
            if (validateLogin(userId, password)) {
                setIsLoginError(false);
                setError('');
                if (mounted) {
                    setAuth({
                        isLoggedIn: true,
                        user: { userId },
                    });
                    Cookies.set('isLoggedIn', 'true', { expires: 0.06944444444444445 });
                    sessionStorage.setItem('user', JSON.stringify({ userId }));

                    // 로그인 정보 저장
                    saveLoginInfo(userId, password, rememberMe);

                    router.push('/home');
                }
            } else {
                setIsLoginError(true);
                setError('아이디/비밀번호를 확인해주세요');
            }
        } else {
            setError('아이디와 비밀번호를 모두 입력해주세요.');
        }
    };

    const handleRememberMeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        setRememberMe(checked);
        if (!checked) {
            localStorage.removeItem('rememberedLogin');
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                minHeight: '100vh',
                width: '100%',
            }}
        >
            {/* 로그인 영역 */}
            <Box
                sx={{
                    flex: '0 0 60%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 4,
                    backgroundColor: '#fff',
                }}
            >
                <Box
                    component="form"
                    onSubmit={handleLogin}
                    sx={{
                        width: '100%',
                        maxWidth: '400px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                    }}
                >
                    <Typography
                        align="center"
                        sx={{
                            fontSize: '24px',
                            fontWeight: 600,
                            mb: 3,
                            color: '#333',
                        }}
                    >
                        환영합니다.
                        <br />
                        로그인을 진행해주세요.
                    </Typography>

                    <TextField
                        fullWidth
                        placeholder="아이디를 입력하세요"
                        value={userId}
                        onChange={(e) => {
                            setUserId(e.target.value);
                            setIsLoginError(false);
                            setError('');
                        }}
                        error={isLoginError}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                height: '48px',
                                backgroundColor: isLoginError ? '#F8F8FB' : '#fff',
                                '& fieldset': {
                                    borderColor: isLoginError ? '#FF6E39' : '#E5E7EB',
                                },
                                '&:hover fieldset': {
                                    borderColor: isLoginError ? '#FF6E39' : '#E5E7EB',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: isLoginError ? '#FF6E39' : '#A1D8B8',
                                },
                            },
                            '& input::placeholder': {
                                fontSize: '14px',
                                color: '#9CA3AF',
                            },
                        }}
                    />

                    <Box sx={{ position: 'relative' }}>
                        <TextField
                            fullWidth
                            type="password"
                            placeholder="비밀번호를 입력하세요"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setIsLoginError(false);
                                setError('');
                            }}
                            error={isLoginError}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    height: '48px',
                                    backgroundColor: isLoginError ? '#F8F8FB' : '#fff',
                                    '& fieldset': {
                                        borderColor: isLoginError ? '#FF6E39' : '#E5E7EB',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: isLoginError ? '#FF6E39' : '#E5E7EB',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: isLoginError ? '#FF6E39' : '#A1D8B8',
                                    },
                                },
                                '& input::placeholder': {
                                    fontSize: '14px',
                                    color: '#9CA3AF',
                                },
                            }}
                        />
                        {isLoginError && (
                            <Typography
                                sx={{
                                    position: 'absolute',
                                    right: 0,
                                    top: '100%',
                                    color: '#FF6E39',
                                    bgcolor: '#FEE9E3',
                                    fontSize: '12px',
                                    mt: '4px',
                                }}
                            >
                                {error}
                            </Typography>
                        )}
                    </Box>

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={rememberMe}
                                onChange={handleRememberMeChange}
                                sx={{
                                    color: '#9CA3AF',
                                    '&.Mui-checked': {
                                        color: '#A1D8B8',
                                    },
                                }}
                            />
                        }
                        label="아이디/비밀번호 기억하기"
                        sx={{
                            '& .MuiFormControlLabel-label': {
                                fontSize: '14px',
                                color: '#6B7280',
                            },
                        }}
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{
                            mt: 1,
                            height: '48px',
                            backgroundColor: '#A1D8B8',
                            color: '#fff',
                            fontSize: '16px',
                            fontWeight: 500,
                            '&:hover': {
                                backgroundColor: '#90C9A7',
                            },
                        }}
                    >
                        로그인
                    </Button>

                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography
                            sx={{
                                cursor: 'pointer',
                                color: '#6B7280',
                                fontSize: '14px',
                            }}
                        >
                            아이디/비밀번호 찾기
                        </Typography>
                        <Typography
                            sx={{
                                cursor: 'pointer',
                                color: '#6B7280',
                                fontSize: '14px',
                            }}
                        >
                            회원가입하기
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* 오른쪽 브랜드 영역 */}
            <Box
                sx={{
                    flex: '0 0 40%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    bgcolor: '#E1F6EE',
                    p: 4,
                }}
            >
                <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Image src="/logo/logo.png" alt="로고" width={120} height={120} />
                    <Typography
                        sx={{
                            color: '#4B5563',
                            fontSize: '16px',
                        }}
                    >
                        운수사 전기버스 통합 정산 플랫폼
                    </Typography>
                    <Typography
                        sx={{
                            color: '#111827',
                            fontSize: '32px',
                            fontWeight: 600,
                        }}
                    >
                        One sheet
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
}
