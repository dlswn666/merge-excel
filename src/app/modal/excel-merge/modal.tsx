'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
    Modal,
    Box,
    Typography,
    Button,
    Divider,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    SelectChangeEvent,
    IconButton,
    Alert,
    Paper,
    ClickAwayListener,
    Tooltip,
} from '@mui/material';
import { ColDef, GridOptions } from 'ag-grid-community';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CustomAgGrid from '@/components/grid/agGrid';
import * as XLSX from 'xlsx';
import CloseIcon from '@mui/icons-material/Close';
import { AlertModal, ConfirmModal } from '@/app/modal/common';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

interface ExcelMergeModalProps {
    open: boolean;
    onClose: () => void;
    excelData: any[];
    fileName: string;
    excelFormData: any[];
    gridOptions: any;
    regularExcelForm: any[];
    onDataTransform?: (data: any[]) => void;
}

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '80%',
    height: 'calc(100% - 40px)',
    maxHeight: '95vh',
    bgcolor: 'background.paper',
    border: '1px solid #e0e0e0',
    outline: 'none',
    p: 4,
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
    borderRadius: '8px',
    overflow: 'auto',
};

const ExcelMergeModal: React.FC<ExcelMergeModalProps> = ({
    open,
    onClose,
    excelData,
    fileName,
    gridOptions,
    regularExcelForm,
    onDataTransform,
}) => {
    const [rowData, setRowData] = useState<any[]>([]);
    const [columnDefs, setColumnDefs] = useState<ColDef[]>([]);
    const [regularHeader, setRegularHeader] = useState<string[]>([]);
    const [selectedRowData, setSelectedRowData] = useState<any>([]); // 선택한 행의 데이터 저장
    const [selectedValues, setSelectedValues] = useState<Record<string, string>>({});
    const [gridColumnDefs, setGridColumnDefs] = useState<ColDef[]>([]);
    const [gridRowData, setGridRowData] = useState<any[]>([]);
    const [matchedHeaderData, setMatchedHeaderData] = useState<any[]>([
        {
            header: '충전기 ID',
            value: '충전기 ID',
        },
        {
            header: '충전시작',
            value: '충전시작',
        },
        {
            header: '충전종료',
            value: '충전종료',
        },
        {
            header: '충전시간',
            value: '충전시간',
        },
        {
            header: '충전량',
            value: '충전량',
        },
        {
            header: '충전금액',
            value: '충전금액',
        },
    ]);
    const [convertedData, setConvertedData] = useState<any[]>([]);
    const [selectedIndex, setSelectedIndex] = useState<number>(-1);
    const [transRegularData, setTransRegularData] = useState<any[]>([]);
    const [isTransformed, setIsTransformed] = useState<boolean>(false);

    // 오류 모달 관련 상태 추가
    const [errorModalOpen, setErrorModalOpen] = useState<boolean>(false);
    const [unmatchedHeaders, setUnmatchedHeaders] = useState<string[]>([]);

    // 확인 모달 상태 추가
    const [confirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
    const [transformedData, setTransformedData] = useState<Record<string, any>[]>([]);

    // 성공 모달 상태 추가
    const [successModalOpen, setSuccessModalOpen] = useState<boolean>(false);

    // 미리보기 상태 추가
    const [showPreview, setShowPreview] = useState<boolean>(false);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [previewColumnDefs, setPreviewColumnDefs] = useState<ColDef[]>([]);

    // 컴포넌트가 마운트되거나 excelData가 변경될 때 데이터 처리
    useEffect(() => {
        if (excelData && excelData.length > 0) {
            // 엑셀 데이터에서 컬럼 정보 추출
            processExcelData(excelData);
            setSelectedRowData(Object.keys(excelData[0]));
            setConvertedData(convertSelectedRowData(excelData, -1));
        }

        if (regularExcelForm && regularExcelForm.length > 0) {
            setRegularHeader(regularExcelForm.map((form) => form.header));
        }
    }, [excelData, regularExcelForm]);

    // 특정 필드에 대해 가장 긴 문자열 길이 계산
    const getMaxLengthForField = (data: any[], field: string): number => {
        return Math.max(
            ...data.map((row) => String(row[field] ?? '').length),
            field.length // 헤더 이름까지 고려
        );
    };

    // 컬럼 너비 추정 함수
    const estimateColumnWidth = (length: number, charSize = 10, padding = 40): number => {
        return Math.max(length * charSize + padding, 100);
    };

    // 엑셀 데이터 처리 함수
    const processExcelData = (data: any[]) => {
        if (data.length === 0) return;

        const firstRow = data[0];
        const keys = Object.keys(firstRow);

        const cols: ColDef[] = keys.map((key) => {
            const maxLength = getMaxLengthForField(data, key);
            const estimatedWidth = estimateColumnWidth(maxLength);

            return {
                field: key,
                headerName: key,
                sortable: true,
                filter: true,
                resizable: true,
                width: estimatedWidth,
                cellStyle: isNumeric(firstRow[key]) ? { textAlign: 'right' } : { textAlign: 'center' },
            };
        });

        setColumnDefs(cols);
        setRowData(data);
        setGridColumnDefs(cols);
        setGridRowData(data);

        // 선택된 행 데이터 초기화
        setSelectedRowData({});
    };

    // 숫자 여부 확인 함수
    const isNumeric = (value: any): boolean => {
        return !isNaN(parseFloat(value)) && isFinite(value);
    };

    // 행 데이터 선택 핸들러
    const handleRowSelect = (event: SelectChangeEvent<number>) => {
        // 현재 행 사용 누르면 현재 header 그대로 사용
        // 1번째 행 사용 누르면 1번째 행 데이터를 header 사용
        const selectedIndex = Number(event.target.value);
        setSelectedIndex(selectedIndex);
        // rowData가 비어있는 경우 처리
        if (!rowData || rowData.length === 0) {
            setSelectedRowData([]);
            return;
        }
        handleHeaderRowSelect(selectedIndex);
        const rowDataKeys = Object.keys(rowData[0] || {});
        if (selectedIndex >= 0 && selectedIndex < rowData.length) {
            // rowdata 해당 행 value값 추출
            const rowDataValues = rowData[selectedIndex] || {};
            const selectedRowDataArray = rowDataKeys.map((key) => {
                return rowDataValues[key];
            });
            console.log(selectedRowDataArray);
            setSelectedRowData(selectedRowDataArray);
            setConvertedData(convertSelectedRowData(rowData, selectedIndex));
        } else {
            // rowData key값 추출
            console.log(rowDataKeys);
            setSelectedRowData(rowDataKeys);
            setConvertedData(convertSelectedRowData(rowData, selectedIndex));
        }
    };

    //Header 행 선택에 따른 ag-grid 데이터 변경
    const handleHeaderRowSelect = (index: number) => {
        if (index === -1) {
            setGridColumnDefs(columnDefs);
            setGridRowData(rowData);
            return;
        }

        const copyRowData = rowData;

        const newRowData = copyRowData.slice(index + 1).map((row) => {
            const newRow: Record<string, any> = {};
            columnDefs.forEach((col, colIdx) => {
                const newKey = rowData[index][col.field as string];
                newRow[newKey] = row[col.field as string];
            });
            return newRow;
        });
        console.log(newRowData);

        const firstRow = newRowData[0];
        const keys = Object.keys(firstRow);

        const cols: ColDef[] = keys.map((key) => {
            const maxLength = getMaxLengthForField(newRowData, key);
            const estimatedWidth = estimateColumnWidth(maxLength);

            return {
                field: key,
                headerName: key,
                sortable: true,
                filter: true,
                resizable: true,
                width: estimatedWidth,
                cellStyle: isNumeric(firstRow[key]) ? { textAlign: 'right' } : { textAlign: 'center' },
            };
        });

        setGridColumnDefs(cols);
        setGridRowData(newRowData);
    };

    // 선택된 행의 값을 key 값으로 변경 후 데이터 변환
    const convertSelectedRowData = (data: any[], index: number) => {
        // index가 -1이거나 data가 비어있으면 원본 데이터 반환
        if (index === -1 || !data || data.length === 0) {
            return data;
        }

        const keyRow = data[index];
        if (!keyRow) {
            return data;
        }

        const newKeys = Object.values(keyRow) as string[];
        const result: Record<string, any>[] = [];

        for (let i = 0; i < data.length; i++) {
            if (i === index) continue; // key로 사용하는 행은 건너뜀

            const row = data[i];
            const newRow: Record<string, any> = {};
            const oldKeys = Object.keys(row);

            oldKeys.forEach((key, idx) => {
                const newKey = newKeys[idx];
                if (newKey) {
                    newRow[newKey] = row[key];
                }
            });

            if (i > index) {
                // 선택된 행 이후의 데이터만 변환
                result.push(newRow);
            }
        }

        console.log(result);
        return result;
    };

    // Select 값 변경 핸들러 추가
    const handleSelectChange = (header: string, value: string) => {
        console.log('선택 변경:', header, value);
        setSelectedValues((prev) => ({
            ...prev,
            [header]: value,
        }));

        // matchedHeaderData 업데이트
        setMatchedHeaderData((prev) => prev.map((item) => (item.header === header ? { ...item, value: value } : item)));
    };

    //엑셀 폼 수정 버튼 클릭 핸들러
    const handleExcelFormModify = () => {
        // 먼저 매칭되지 않은 헤더가 있는지 확인
        const unmatchedHeaderList: string[] = [];

        // 데이터의 키 목록 가져오기
        const availableKeys: string[] = [];
        if (convertedData.length > 0) {
            const firstRow = convertedData[0];
            Object.keys(firstRow).forEach((key) => {
                availableKeys.push(key);
            });
        }

        // 매칭 안 된 헤더 찾기
        matchedHeaderData.forEach((item) => {
            // 매칭값이 없거나 데이터에 해당 키가 없는 경우
            if (!item.value || !availableKeys.includes(item.value)) {
                unmatchedHeaderList.push(item.header);
            }
        });

        // 매칭 안 된 헤더가 있으면 오류 모달 표시
        if (unmatchedHeaderList.length > 0) {
            setUnmatchedHeaders(unmatchedHeaderList);
            setErrorModalOpen(true);
            return; // 함수 종료
        }

        // 매칭된 경우 데이터 변환
        const result: Record<string, any>[] = [];
        convertedData.forEach((row) => {
            const newRow: Record<string, any> = {};
            const keys = Object.keys(row);

            matchedHeaderData.forEach((item) => {
                keys.forEach((key) => {
                    if (item.value === key) {
                        newRow[item.header] = row[key];
                    }
                });
            });

            result.push(newRow);
        });

        // 변환된 데이터를 저장하고 확인 모달 표시
        setTransformedData(result);
        setConfirmModalOpen(true);
    };

    // 확인 모달 확인 버튼 핸들러
    const handleConfirmExcelFormModify = () => {
        console.log('변환된 데이터:', transformedData);
        // 변환된 데이터를 부모 컴포넌트로 전달
        if (onDataTransform && transformedData.length > 0) {
            onDataTransform(transformedData);
        }

        // 모달 닫기
        setConfirmModalOpen(false);

        // 변환 완료 상태 설정
        setIsTransformed(true);

        // 성공 모달 표시
        setSuccessModalOpen(true);
    };

    // 오류 모달 닫기 함수
    const handleErrorModalClose = () => {
        setErrorModalOpen(false);
    };

    // 확인 모달 닫기 함수
    const handleConfirmModalClose = () => {
        setConfirmModalOpen(false);
    };

    // 성공 모달 닫기 함수
    const handleSuccessModalClose = () => {
        setSuccessModalOpen(false);
        onClose(); // 메인 모달도 닫기
    };

    // 규정 폼으로 데이터 수정
    const regularExcelFormModify = () => {
        if (selectedIndex === -1) {
            console.log('현재 행 사용');
        } else {
            console.log('특정 행 사용');
        }
    };

    // 변환 초기화 버튼 핸들러
    const handleResetTransform = () => {
        setIsTransformed(false);
        setTransformedData([]);
        // 선택된 값도 초기화
        setSelectedValues({});
        // 매칭된 헤더 데이터 초기화
        setMatchedHeaderData(
            matchedHeaderData.map((item) => ({
                ...item,
                value: item.header, // 기본값으로 초기화
            }))
        );
    };

    // 모든 셀렉트박스가 선택되었는지 확인하는 함수 추가
    const allSelectsAreFilled = () => {
        if (!regularExcelForm || regularExcelForm.length === 0) return false;

        // 모든 셀렉트박스가 값을 가지고 있는지 확인
        return regularExcelForm.every(
            (form) => selectedValues[form.header] && selectedValues[form.header].trim() !== ''
        );
    };

    // 셀렉트박스 초기화 함수 추가
    const handleResetValues = () => {
        // 선택된 값 초기화
        setSelectedValues({});

        // 매칭된 헤더 데이터의 value 값도 초기화
        setMatchedHeaderData(
            matchedHeaderData.map((item) => ({
                ...item,
                value: '', // 빈 값으로 초기화
            }))
        );

        // 미리보기 관련 데이터 초기화
        setShowPreview(false);
        setPreviewData([]);
        setPreviewColumnDefs([]);
    };

    // 미리보기 버튼 클릭 핸들러
    const handlePreview = () => {
        // 미리보기 상태 토글
        setShowPreview(true);

        // 디버깅용 - 모든 관련 데이터 출력
        console.log('matchedHeaderData:', matchedHeaderData);
        console.log('selectedValues:', selectedValues);
        console.log('convertedData 첫 번째 행:', convertedData.length > 0 ? convertedData[0] : 'No data');

        // ColDef 배열 생성 - No 칼럼 추가
        const colDefs: ColDef[] = [
            {
                field: 'no',
                headerName: 'No',
                sortable: false,
                filter: false,
                resizable: true,
                flex: 1,
                cellStyle: { textAlign: 'center' },
                valueGetter: (params) => (params.node?.rowIndex ? params.node.rowIndex + 1 : 1),
            },
            ...regularExcelForm.map((form) => {
                return {
                    field: form.header,
                    headerName: form.header,
                    sortable: true,
                    filter: true,
                    resizable: true,
                    flex: 1,
                    cellStyle: { textAlign: 'center' }, // justifyContent를 textAlign으로 변경
                };
            }),
        ];

        setPreviewColumnDefs(colDefs);

        // 데이터 변환
        const previewRows: any[] = [];

        if (convertedData.length > 0) {
            convertedData.forEach((row, index) => {
                const newRow: Record<string, any> = {
                    no: index + 1, // 번호 추가
                };

                // 매핑 로직 변경: matchedHeaderData 대신 selectedValues를 직접 사용
                regularExcelForm.forEach((form) => {
                    const headerName = form.header; // 예: '충전기 ID'
                    const selectedField = selectedValues[headerName]; // 선택된 필드명

                    console.log(
                        `매핑 확인 - 헤더: ${headerName}, 선택값: ${selectedField}, 데이터:`,
                        selectedField ? row[selectedField] : 'undefined'
                    );

                    if (selectedField && row[selectedField] !== undefined) {
                        newRow[headerName] = row[selectedField];
                    } else {
                        newRow[headerName] = '';
                    }
                });

                console.log('생성된 행:', newRow);
                previewRows.push(newRow);
            });
        }

        console.log('최종 미리보기 데이터:', previewRows);
        setPreviewData(previewRows);
    };

    return (
        <>
            <Modal open={open} onClose={onClose}>
                <Box sx={modalStyle}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'flex-end',
                            justifyContent: 'flex-end',
                            gap: 2,
                            minHeight: 50,
                        }}
                    >
                        <Button
                            onClick={onClose}
                            sx={{ bgcolor: '#fff', color: '#000', boxShadow: 'none', border: '1px solid #CFD2D5' }}
                        >
                            닫기
                        </Button>
                        <Button
                            onClick={handleExcelFormModify}
                            disabled={isTransformed}
                            sx={{
                                bgcolor: '#A1D8B8',
                                color: '#22675F',
                                boxShadow: 'none',
                                border: '1px solid #CFD2D5',
                                '&:hover': {
                                    background: '#8bc9a6',
                                    color: '#22675F',
                                    boxShadow: 'none',
                                    border: '1px solid #CFD2D5',
                                },
                            }}
                        >
                            엑셀 폼 수정
                        </Button>
                    </Box>
                    <Divider />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                            수동 정렬하기
                        </Typography>
                        <Tooltip
                            title={
                                <Typography sx={{ color: '#074B33', fontSize: 14 }}>
                                    지원이 되지 않는 엑셀 양식을 직접 맞춰 총합 정산할 수 있어요
                                </Typography>
                            }
                            placement="right"
                            arrow
                            componentsProps={{
                                tooltip: {
                                    sx: {
                                        bgcolor: '#A1D8B8',
                                        '& .MuiTooltip-arrow': {
                                            color: '#A1D8B8',
                                        },
                                        maxWidth: 300,
                                        p: 1.5,
                                    },
                                },
                            }}
                        >
                            <IconButton size="small" sx={{ p: 0 }}>
                                <HelpOutlineIcon fontSize="small" sx={{ color: '#41505D' }} />
                            </IconButton>
                        </Tooltip>
                    </Box>
                    {/* <Paper sx={{ p: 3, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" sx={{ color: '#41505D' }}>
                                지원이 되지 않는 엑셀 양식을 직접 맞춰 통합 정산할 수 있어요
                            </Typography>
                        </Box>
                    </Paper> */}

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, width: '100%' }}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 2,
                                width: '100%',
                            }}
                        >
                            <Box>
                                <Typography variant="body2" sx={{ color: '#41505D', fontWeight: 700, fontSize: 18 }}>
                                    업로드 엑셀
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#41505D', fontWeight: 600, fontSize: 16 }}>
                                    파일명 : {fileName}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Typography variant="body2" sx={{ color: '#41505D', fontWeight: 600, fontSize: 16 }}>
                                    Header 행 선택
                                </Typography>
                                <FormControl size="small" sx={{ minWidth: 150 }}>
                                    <Select
                                        labelId="row-select-label"
                                        displayEmpty
                                        onChange={handleRowSelect}
                                        defaultValue={-1}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                borderColor: '#1976d2',
                                            },
                                            height: '32px',
                                            '& .MuiMenuItem-root': {
                                                '&:hover': {
                                                    backgroundColor: '#6ED8AF',
                                                    color: '#fff',
                                                },
                                                textAlign: 'center',
                                                justifyContent: 'center',
                                            },
                                            '& .MuiSelect-select': {
                                                textAlign: 'center',
                                            },
                                        }}
                                        MenuProps={{
                                            PaperProps: {
                                                sx: {
                                                    '& .MuiMenuItem-root': {
                                                        '&:hover': {
                                                            backgroundColor: '#6ED8AF',
                                                            color: '#fff',
                                                        },
                                                        textAlign: 'center',
                                                        justifyContent: 'center',
                                                    },
                                                },
                                            },
                                        }}
                                    >
                                        <MenuItem value={-1}>
                                            <em>최초 행 사용</em>
                                        </MenuItem>
                                        {rowData
                                            .map((_, index) => (
                                                <MenuItem key={index} value={index}>
                                                    {index + 1}번째 행
                                                </MenuItem>
                                            ))
                                            .slice(0, 5)}{' '}
                                        {/* 최대 5개 행만 표시 */}
                                    </Select>
                                </FormControl>
                            </Box>
                        </Box>
                    </Box>
                    <Box sx={{ width: '100%', height: '300px' }}>
                        <CustomAgGrid
                            rowData={gridRowData}
                            columnDefs={gridColumnDefs}
                            height={'300px'}
                            gridOptions={{ ...gridOptions, alwaysShowHorizontalScroll: true }}
                        />
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                        <Typography variant="body2" sx={{ color: '#41505D', fontWeight: 600, fontSize: 20 }}>
                            정렬하기
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Button
                                onClick={handleResetValues}
                                sx={{
                                    bgcolor: '#fff',
                                    color: '#41505D',
                                    boxShadow: 'none',
                                    border: '1px solid #CFD2D5',
                                }}
                            >
                                초기화
                            </Button>
                            <Button
                                onClick={handlePreview}
                                disabled={!allSelectsAreFilled()}
                                sx={{
                                    bgcolor: '#fff',
                                    color: '#41505D',
                                    boxShadow: 'none',
                                    border: '1px solid #CFD2D5',
                                    opacity: allSelectsAreFilled() ? 1 : 0.5,
                                }}
                            >
                                미리보기
                            </Button>
                        </Box>
                    </Box>
                    <Box sx={{ width: '100%', overflowY: 'auto', scrollbarWidth: 'thin', minHeight: '400px', mb: 3 }}>
                        {regularExcelForm && regularExcelForm.length > 0 ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        width: '100%',
                                        gap: 2,
                                        p: 2,
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    {regularExcelForm.map((form) => (
                                        <Box
                                            key={form.header}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                flexDirection: 'column',
                                                justifyContent: 'space-between',
                                                gap: 2,
                                            }}
                                        >
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: '#41505D',
                                                    width: '100px',
                                                    fontWeight: 600,
                                                    fontSize: 16,
                                                    textAlign: 'center',
                                                }}
                                            >
                                                {form.header}
                                            </Typography>
                                            <FormControl
                                                sx={{
                                                    m: 1,
                                                    minWidth: 150,
                                                    // 선택된 항목이 있는 경우 박스 주변에 강조 표시
                                                    '& .MuiOutlinedInput-root': {
                                                        borderColor: selectedValues[form.header]
                                                            ? '#1976d2'
                                                            : 'inherit',
                                                        boxShadow: selectedValues[form.header]
                                                            ? '0 0 0 2px rgba(25, 118, 210, 0.1)'
                                                            : 'none',
                                                        '&.Mui-focused': {
                                                            borderColor: '#1976d2',
                                                        },
                                                    },
                                                }}
                                            >
                                                <Select
                                                    value={selectedValues[form.header] || ''}
                                                    onChange={(e) => handleSelectChange(form.header, e.target.value)}
                                                    displayEmpty
                                                    sx={{
                                                        height: '32px',
                                                        // 선택 여부에 따라 테두리 색상 변경
                                                        '& .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: selectedValues[form.header]
                                                                ? '#1976d2'
                                                                : '#0e0f0f',
                                                        },
                                                        // 선택된 경우 배경색 살짝 변경
                                                        backgroundColor: selectedValues[form.header]
                                                            ? 'rgba(25, 118, 210, 0.05)'
                                                            : 'transparent',
                                                        '& .MuiMenuItem-root': {
                                                            '&:hover': {
                                                                backgroundColor: '#6ED8AF',
                                                                color: '#fff',
                                                            },
                                                            textAlign: 'center',
                                                            justifyContent: 'center',
                                                        },
                                                        '& .MuiSelect-select': {
                                                            textAlign: 'center',
                                                        },
                                                    }}
                                                    MenuProps={{
                                                        PaperProps: {
                                                            sx: {
                                                                '& .MuiMenuItem-root': {
                                                                    '&:hover': {
                                                                        backgroundColor: '#6ED8AF',
                                                                        color: '#fff',
                                                                    },
                                                                    textAlign: 'center',
                                                                    justifyContent: 'center',
                                                                },
                                                            },
                                                        },
                                                    }}
                                                >
                                                    <MenuItem value="">선택하기</MenuItem>
                                                    {selectedRowData && selectedRowData.length > 0 ? (
                                                        selectedRowData
                                                            .filter((option: string) => {
                                                                return (
                                                                    option === selectedValues[form.header] ||
                                                                    !Object.values(selectedValues).includes(option)
                                                                );
                                                            })
                                                            .map((option: string, index: number) => (
                                                                <MenuItem key={`${option}-${index}`} value={option}>
                                                                    {option}
                                                                </MenuItem>
                                                            ))
                                                    ) : (
                                                        <MenuItem value="">데이터 없음</MenuItem>
                                                    )}
                                                </Select>
                                            </FormControl>
                                        </Box>
                                    ))}
                                </Box>
                                {showPreview && previewData.length > 0 && (
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 2,
                                            width: '100%',
                                            height: '300px',
                                        }}
                                    >
                                        <CustomAgGrid
                                            rowData={previewData}
                                            columnDefs={previewColumnDefs}
                                            height={'100%'}
                                            gridOptions={{
                                                ...gridOptions,
                                                headerHeight: 40, // 헤더 높이 조정
                                                getRowHeight: () => 40, // 행 높이 조정
                                            }}
                                        />
                                    </Box>
                                )}
                            </Box>
                        ) : (
                            <Typography variant="body2" sx={{ color: '#666666', p: 2 }}>
                                사용 가능한 정규 헤더 데이터가 없습니다.
                            </Typography>
                        )}
                    </Box>
                </Box>
            </Modal>

            {/* 오류 모달 - AlertModal 사용 */}
            <AlertModal
                open={errorModalOpen}
                onClose={handleErrorModalClose}
                title="매칭 오류 발생"
                message={`다음 항목의 매칭이 되지 않았습니다. 매칭을 완료해주세요.\n\n${unmatchedHeaders
                    .map((header) => `• ${header}`)
                    .join('\n')}`}
                type="warning"
                buttonText="확인"
            />

            {/* 확인 모달 - ConfirmModal 사용 */}
            <ConfirmModal
                open={confirmModalOpen}
                onClose={handleConfirmModalClose}
                onConfirm={handleConfirmExcelFormModify}
                title="엑셀 데이터 변환 확인"
                message={`선택한 매핑 정보로 데이터를 변환하시겠습니까?\n총 ${transformedData.length}개의 행이 변환됩니다.`}
                type="question"
                confirmText="변환"
                cancelText="취소"
            />

            {/* 성공 모달 - AlertModal 사용 */}
            <AlertModal
                open={successModalOpen}
                onClose={handleSuccessModalClose}
                title="변환 완료"
                message={`데이터가 성공적으로 변환되었습니다. 총 ${transformedData.length}개의 행이 변환되었습니다.`}
                type="success"
                buttonText="확인"
            />
        </>
    );
};

export default ExcelMergeModal;
