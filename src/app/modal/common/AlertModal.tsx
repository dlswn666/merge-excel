'use client';

import React from 'react';
import { Modal, Box, Typography, Button, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// 알림 타입 (아이콘 및 색상 변경용)
export type AlertType = 'info' | 'warning' | 'error' | 'success';

interface AlertModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    message: string;
    buttonText?: string;
    type?: AlertType;
}

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    borderRadius: '8px',
    boxShadow: 24,
    p: 4,
};

const AlertModal: React.FC<AlertModalProps> = ({
    open,
    onClose,
    title,
    message,
    buttonText = '확인',
    type = 'info',
}) => {
    // 모달 타입에 따른 아이콘 및 색상 설정
    const getIconAndColor = () => {
        switch (type) {
            case 'info':
                return { icon: <InfoIcon />, color: 'info.main', bgColor: 'white' };
            case 'warning':
                return { icon: <WarningIcon />, color: 'warning.main', bgColor: 'white' };
            case 'error':
                return { icon: <ErrorIcon />, color: 'error.main', bgColor: 'white' };
            case 'success':
                return { icon: <CheckCircleIcon />, color: 'success.main', bgColor: 'white' };
            default:
                return { icon: <InfoIcon />, color: 'info.main', bgColor: 'white' };
        }
    };

    const { icon, color, bgColor } = getIconAndColor();

    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="alert-modal-title"
            aria-describedby="alert-modal-description"
        >
            <Box sx={modalStyle}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ color, fontSize: '28px' }}>{icon}</Box>
                        <Typography id="alert-modal-title" variant="h6" component="h2">
                            {title}
                        </Typography>
                    </Box>
                    <IconButton
                        aria-label="close"
                        onClick={onClose}
                        sx={{
                            color: (theme) => theme.palette.grey[500],
                            '&:hover': {
                                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                            },
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>

                <Box
                    sx={{
                        bgcolor: bgColor,
                        p: 2,
                        borderRadius: 1,
                        mb: 3,
                        color: (theme) => theme.palette.getContrastText(theme.palette[type].light),
                    }}
                >
                    <Typography id="alert-modal-description" variant="body1">
                        {message}
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Button variant="contained" onClick={onClose} color={type} sx={{ minWidth: 100 }} autoFocus>
                        {buttonText}
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default AlertModal;
