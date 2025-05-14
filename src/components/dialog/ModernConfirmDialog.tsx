import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    Slide,
    Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PreviewIcon from '@mui/icons-material/Preview';
import CancelIcon from '@mui/icons-material/Cancel';
import { TransitionProps } from '@mui/material/transitions';

// 1. 모던한 입장 애니메이션을 위해 Slide Transition을 적용
const Transition = React.forwardRef(function Transition(
    props: TransitionProps & { children: React.ReactElement<any, any> },
    ref: React.Ref<unknown>
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

// 2. PaperProps로 모달의 스타일 커스터마이징
const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: theme.shape.borderRadius * 2,
        padding: theme.spacing(1),
    },
}));

interface ModernConfirmDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    contentText: React.ReactNode;
    cancelText?: string;
    confirmText?: string;
}

export default function ModernConfirmDialog({
    open,
    onClose,
    onConfirm,
    title,
    contentText,
    cancelText = '취소',
    confirmText = '확인',
}: ModernConfirmDialogProps) {
    return (
        <StyledDialog
            open={open}
            onClose={onClose}
            TransitionComponent={Transition}
            fullWidth
            maxWidth="xs"
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-description"
        >
            <DialogTitle id="confirm-dialog-title">
                <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                    {title}
                </Typography>
            </DialogTitle>

            <DialogContent sx={{ pt: 1 }}>
                <DialogContentText
                    id="confirm-dialog-description"
                    sx={{ color: 'text.secondary', fontSize: '0.95rem', textAlign: 'center' }}
                >
                    {contentText}
                </DialogContentText>
            </DialogContent>

            <DialogActions sx={{ px: 2, pb: 2, justifyContent: 'center' }}>
                <Button
                    startIcon={<CancelIcon />}
                    onClick={onClose}
                    variant="outlined"
                    sx={{ textTransform: 'none', minWidth: '100px' }}
                >
                    {cancelText}
                </Button>
                <Button
                    startIcon={<PreviewIcon />}
                    onClick={onConfirm}
                    variant="contained"
                    color="primary"
                    sx={{ textTransform: 'none', minWidth: '100px', ml: 1 }}
                    autoFocus
                >
                    {confirmText}
                </Button>
            </DialogActions>
        </StyledDialog>
    );
}
