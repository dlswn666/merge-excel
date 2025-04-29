'use client';

import React from 'react';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Box, Divider } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import MergeTypeIcon from '@mui/icons-material/MergeType';
import { useRouter, usePathname } from 'next/navigation';

const DRAWER_WIDTH = 240;

const menuItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/home' },
    { text: 'Excel Merge', icon: <MergeTypeIcon />, path: '/excel-merge' },
];

const Sidebar: React.FC = () => {
    const router = useRouter();
    const pathname = usePathname();

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: DRAWER_WIDTH,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: DRAWER_WIDTH,
                    boxSizing: 'border-box',
                    borderRight: '1px solid',
                    borderColor: 'divider',
                    backgroundColor: 'background.default',
                },
            }}
        >
            <Box sx={{ height: '64px' }} /> {/* Header 높이만큼 여백 */}
            <Divider />
            <List>
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding>
                        <ListItemButton
                            selected={pathname === item.path}
                            onClick={() => router.push(item.path)}
                            sx={{
                                '&.Mui-selected': {
                                    backgroundColor: 'primary.light',
                                    color: 'primary.main',
                                    '&:hover': {
                                        backgroundColor: 'primary.light',
                                    },
                                },
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    color: pathname === item.path ? 'primary.main' : 'inherit',
                                    minWidth: 40,
                                }}
                            >
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Drawer>
    );
};

export default Sidebar;
