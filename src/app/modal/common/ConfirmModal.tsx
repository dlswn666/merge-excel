'use client';

import React from 'react';
import { Modal, Box, Typography, Button, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';

// 모달 타입 (아이콘 및 색상 변경용)
export type ConfirmType = 'info' | 'warning' | 'question';

interface ConfirmModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: ConfirmType;
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

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    open,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = '확인',
    cancelText = '취소',
    type = 'question',
}) => {
    // 모달 타입에 따른 아이콘 및 색상 설정
    const getIconAndColor = () => {
        switch (type) {
            case 'info':
                return { icon: <InfoIcon />, color: 'info.main' };
            case 'warning':
                return { icon: <WarningIcon />, color: 'warning.main' };
            case 'question':
            default:
                return { icon: <QuestionMarkIcon />, color: 'primary.main' };
        }
    };

    const { icon, color } = getIconAndColor();

    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="confirm-modal-title"
            aria-describedby="confirm-modal-description"
        >
            <Box sx={modalStyle}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ color, fontSize: '28px' }}>{icon}</Box>
                        <Typography id="confirm-modal-title" variant="h6" component="h2">
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

                <Typography id="confirm-modal-description" variant="body1" sx={{ mb: 3 }}>
                    {message}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button variant="outlined" onClick={onClose}>
                        {cancelText}
                    </Button>
                    <Button variant="contained" onClick={onConfirm} autoFocus>
                        {confirmText}
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default ConfirmModal;
