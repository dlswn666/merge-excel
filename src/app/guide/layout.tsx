import React from 'react';

export default function GuideLayout({ children }: { children: React.ReactNode }) {
    return (
        <div
            style={{
                margin: 0,
                padding: 0,
                backgroundColor: '#f4f6f8',
                fontFamily:
                    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
                boxSizing: 'border-box',
                minHeight: '100vh',
            }}
        >
            {children}
        </div>
    );
}
