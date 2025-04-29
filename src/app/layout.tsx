import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import RecoilProvider from '@/components/providers/RecoilProvider';
import MainLayout from '@/components/layout/MainLayout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Neo Excel',
    description: 'Excel-like application built with Next.js',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ko">
            <body className={inter.className}>
                <RecoilProvider>
                    <MainLayout>{children}</MainLayout>
                </RecoilProvider>
            </body>
        </html>
    );
}
