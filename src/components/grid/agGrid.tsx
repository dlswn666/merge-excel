'use client';

import React from 'react';
import { AgGridReact } from 'ag-grid-react';
import {
    ColDef,
    GridOptions,
    ModuleRegistry,
    ClientSideRowModelModule,
    GridReadyEvent,
    GridApi,
    Column,
} from 'ag-grid-community';
import { Box, Typography } from '@mui/material';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';

// AG Grid CSS
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

// 데이터가 없을 때 보여줄 컴포넌트
const NoRowsOverlay = () => {
    return (
        <Box
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                gap: 2,
            }}
        >
            <InsertDriveFileOutlinedIcon sx={{ fontSize: 48, color: '#9e9e9e' }} />
            <Typography variant="body1" sx={{ color: '#666666' }}>
                데이터가 없습니다
            </Typography>
            <Typography variant="body2" sx={{ color: '#9e9e9e' }}>
                엑셀 파일을 업로드하여 데이터를 추가해주세요
            </Typography>
        </Box>
    );
};

// 로딩 중일 때 보여줄 컴포넌트
const LoadingOverlay = () => {
    return (
        <Box
            sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
            }}
        >
            <Typography variant="body1" sx={{ color: '#666666' }}>
                데이터를 불러오는 중...
            </Typography>
        </Box>
    );
};

// Register the required modules
ModuleRegistry.registerModules([ClientSideRowModelModule]);

interface AgGridProps {
    rowData: any[];
    columnDefs: ColDef[];
    gridOptions?: GridOptions;
    height?: string | number;
}

const CustomAgGrid: React.FC<AgGridProps> = ({ rowData, columnDefs, gridOptions, height = '600px' }) => {
    const defaultGridOptions: GridOptions = {
        animateRows: true,
        pagination: true,
        paginationAutoPageSize: true,
        enableCellTextSelection: true,
        suppressRowClickSelection: true,
        rowSelection: 'multiple',
        defaultColDef: {
            sortable: true,
            filter: true,
            resizable: true,
        },
        suppressPropertyNamesCheck: true,
        rowHeight: 48,
        headerHeight: 48,
        suppressScrollOnNewData: true,
        noRowsOverlayComponent: NoRowsOverlay,
        loadingOverlayComponent: LoadingOverlay,
        // 컬럼 드래그 앤 드롭 관련 옵션
        suppressColumnMoveAnimation: true,
        suppressDragLeaveHidesColumns: true,
        // legacy 테마 사용
        theme: 'legacy',
        ...gridOptions,
    };

    const onGridReady = (params: GridReadyEvent) => {
        const gridApi: GridApi = params.api;

        // Show loading overlay
        gridApi.setGridOption('overlayLoadingTemplate', 'LoadingOverlay');
        gridApi.showLoadingOverlay();

        // If there's data, hide loading overlay
        if (rowData && rowData.length > 0) {
            gridApi.hideOverlay();
        } else {
            // If no data, show no-rows overlay
            gridApi.setGridOption('overlayNoRowsTemplate', 'NoRowsOverlay');
            gridApi.showNoRowsOverlay();
        }

        // 창 크기가 변경될 때 컬럼 크기 자동 조정
        const handleResize = () => {
            const availableWidth = document.querySelector('.ag-theme-alpine')?.clientWidth;
            if (availableWidth && columnDefs.length > 0) {
                const widthForEachColumn = Math.floor(availableWidth / columnDefs.length);
                const columnWidths = columnDefs
                    .filter((colDef) => colDef.field)
                    .map((colDef) => ({
                        key: colDef.field as string,
                        newWidth: widthForEachColumn,
                    }));
                gridApi.setColumnWidths(columnWidths);
            }
        };

        window.addEventListener('resize', handleResize);
        // 초기 컬럼 크기 설정
        // handleResize();

        // cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    };

    return (
        <Box
            className="ag-theme-alpine"
            sx={{
                width: '100%',
                height: height,
                overflow: 'auto',
                '& .ag-root': {
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                },
                '& .ag-header': {
                    borderBottom: '2px solid #f0f0f0',
                    backgroundColor: 'white',
                },
                '& .ag-header-cell': {
                    padding: '0 16px',
                },
                '& .ag-header-cell-label': {
                    fontWeight: 600,
                    color: '#1a1a1a',
                    fontSize: '0.875rem',
                },
                '& .ag-cell': {
                    padding: '0 16px',
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '0.875rem',
                    color: '#333333',
                },
                '& .ag-row': {
                    borderColor: '#f5f5f5',
                    '&:hover': {
                        backgroundColor: '#f8f9fa !important',
                    },
                },
                '& .ag-row-selected': {
                    backgroundColor: '#e3f2fd !important',
                    '&:hover': {
                        backgroundColor: '#e3f2fd !important',
                    },
                },
                '& .ag-paging-panel': {
                    borderTop: '1px solid #f0f0f0',
                    padding: '16px',
                    color: '#666666',
                },
                '& .ag-cell-focus': {
                    border: 'none !important',
                    outline: 'none !important',
                },
                '& .ag-header-cell-resize::after': {
                    backgroundColor: '#e0e0e0',
                },
                '& .ag-overlay-loading-wrapper': {
                    backgroundColor: 'rgba(255, 255, 255, 0.5)',
                },
                '& .ag-overlay-loading-center': {
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    padding: '16px 24px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                },
                '& .ag-overlay-no-rows-wrapper': {
                    backgroundColor: '#ffffff',
                },
            }}
        >
            <AgGridReact
                rowData={rowData}
                columnDefs={columnDefs}
                gridOptions={defaultGridOptions}
                onGridReady={onGridReady}
            />
        </Box>
    );
};

export default CustomAgGrid;
