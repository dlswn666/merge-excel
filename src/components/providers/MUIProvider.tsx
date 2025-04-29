'use client';

import React from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import EmotionCacheProvider from './EmotionCacheProvider';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#1976d2',
            light: '#e3f2fd',
        },
        secondary: {
            main: '#dc004e',
        },
        background: {
            default: '#f5f5f5',
            paper: '#ffffff',
        },
    },
    components: {
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#ffffff',
                    color: '#000000',
                },
            },
        },
    },
});

export default function MUIProvider({ children }: { children: React.ReactNode }) {
    return (
        <EmotionCacheProvider options={{ key: 'mui', prepend: true }}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </EmotionCacheProvider>
    );
}
