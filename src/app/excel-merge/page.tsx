'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Typography,
    Box,
    Paper,
    Button,
    Divider,
    Modal,
    IconButton,
    TextField,
    Checkbox,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    ClickAwayListener,
} from '@mui/material';
import { ColDef, GridReadyEvent, IGetRowsParams, GridOptions, RowModelType, GridApi } from 'ag-grid-community';
import CustomAgGrid from '@/components/grid/agGrid';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import ExcelMergeModal from '@/app/modal/excel-merge/modal';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ko } from 'date-fns/locale/ko';
import DeleteIcon from '@mui/icons-material/Delete';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ModernConfirmDialog from '@/components/dialog/ModernConfirmDialog';

interface ExcelFile {
    id: number;
    name: string;
    status: 'pending' | 'success' | 'error';
    errorMessage?: string;
    formType?: string;
    formName?: string;
    headerRow?: number;
    data?: any[];
    selected: boolean;
}

interface ExcelFormType {
    id: string;
    name: string;
    headers: string[];
    description: string;
    headerRow: number;
}

interface RegularExcelFormType {
    header: string;
    matchHeaders: string[];
}

interface ExcelData {
    id: number;
    formType: string;
    data: any[];
}

interface RowData {
    chargingStartTime: string;
    [key: string]: any;
}

interface TutorialStep {
    title: string;
    description: string;
    placement: 'top' | 'bottom' | 'left' | 'right';
    image: string;
}

// 엑셀 폼 형식 정의
const EXCEL_FORM_TYPES: ExcelFormType[] = [
    {
        id: 'evsis',
        name: 'EVSIS',
        headers: [
            '충전사업자',
            '대표가맹점',
            '가맹점/충전소',
            '충전기/커넥터 ID',
            '회원 기관',
            '회원 번호',
            '인증구분',
            '거래분류',
            '구독구분',
            '충전상태',
            '충전량(kWh)',
            '충전요금',
            '충전시작일시',
            '충전종료일시',
            '충전시간(분)',
            '충전속도',
            '기본단가',
            '할인율',
            '선물카드금액',
            '사용포인트',
            '결제요청금액',
            '결제금액',
            '결제처리상태',
            '결제상태',
            '결제(부분)취소처리상태',
            '충전종료사유',
            '결제실패사유',
            '결제제외사유',
            '수집일자',
            '거래일자',
            '모델ID',
            '최종배포버전',
            '충전소ID',
            '거래고유번호',
        ],
        description: 'EVSIS 엑셀 형식',
        headerRow: 1,
    },
    {
        id: 'chargin',
        name: '차지인',
        headers: [
            'No',
            '충전기그룹',
            '충전기명',
            '충전기 ID',
            '이용방법',
            '충전시작',
            '충전종료',
            '완료수신',
            '이용시간',
            '충전량',
            '사용금액',
        ],
        description: '차지인 엑셀 형식',
        headerRow: 3,
    },
];

// 정규 엑셀 폼 형식 정의
const REGULAR_EXCEL_FORM_TYPES: RegularExcelFormType[] = [
    {
        header: '충전기ID',
        matchHeaders: ['충전기 ID', '충전기/커넥터 ID'],
    },
    {
        header: '충전시작',
        matchHeaders: ['충전시작일시', '충전시작'],
    },
    {
        header: '충전종료',
        matchHeaders: ['충전종료일시', '충전종료'],
    },
    {
        header: '충전시간',
        matchHeaders: ['이용시간', '충전시간(분)', '충전시간'],
    },
    {
        header: '충전량',
        matchHeaders: ['충전량(kWh)', '충전량'],
    },
    {
        header: '충전금액',
        matchHeaders: ['충전요금', '사용금액', '충전금액'],
    },
];

/**
 * 다양한 형식의 엑셀 데이터를 정규 형식으로 변환하는 함수
 * @param excelDataList 다양한 형식의 엑셀 데이터 목록
 * @returns 정규화된 데이터 배열
 */
function normalizeExcelData(excelDataList: ExcelData[]): any[] {
    // 새로운 데이터가 아래에 추가되도록 기존 데이터 유지
    const normalizedRows: any[] = [];

    // 최신 추가된 데이터부터 처리 (ID 순으로 내림차순 정렬)
    const sortedDataList = [...excelDataList].sort((a, b) => b.id - a.id);

    sortedDataList.forEach((excelData) => {
        excelData.data.forEach((row) => {
            const normalizedRow: any = {};
            // REGULAR_EXCEL_FORM_TYPES의 각 헤더에 대해 매칭되는 값 찾기
            REGULAR_EXCEL_FORM_TYPES.forEach(({ header, matchHeaders }) => {
                const matchingKey = Object.keys(row).find((key) => matchHeaders.includes(key));
                if (matchingKey) {
                    normalizedRow[header] = row[matchingKey];
                }
            });
            // 새 데이터를 배열 끝에 추가 (아래쪽에 쌓임)
            normalizedRows.push(normalizedRow);
        });
    });

    // 행 번호(No) 추가
    return normalizedRows.map((row, index) => ({
        No: index + 1,
        ...row,
    }));
}

/**
 * 컬럼 너비를 데이터에 맞게 계산하는 함수
 * @param normalizedData 정규화된 데이터 배열
 * @param headers 헤더 정보 배열
 * @returns 너비가 계산된 컬럼 설정 배열
 */
function calculateColumnWidths(normalizedData: any[], headers: RegularExcelFormType[]): any[] {
    return headers.map(({ header }) => {
        // 헤더 길이 계산 (한글은 2자로 계산)
        const headerLength = [...header].reduce((acc, char) => {
            return acc + (/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(char) ? 2 : 1);
        }, 0);

        // 데이터의 최대 길이 계산
        let maxDataLength = 0;
        normalizedData.forEach((row) => {
            if (row[header]) {
                const dataStr = String(row[header]);
                const dataLength = [...dataStr].reduce((acc, char) => {
                    return acc + (/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(char) ? 2 : 1);
                }, 0);
                maxDataLength = Math.max(maxDataLength, dataLength);
            }
        });

        // 최소 너비 8, 헤더와 데이터 중 큰 값 + 여유공간 4
        const width = Math.max(8, Math.max(headerLength, maxDataLength) + 4);

        return {
            header,
            key: header,
            width: width,
        };
    });
}

const tutorialSteps: TutorialStep[] = [
    {
        title: '엑셀 파일 업로드',
        description: '각 충전소의 정산 엑셀 파일을 업로드하면 자동으로 데이터를 병합해드립니다. ',
        placement: 'bottom',
        image: '/images/tutorial/tooltip1.png',
    },
    {
        title: '파일 검증',
        description: '각 충전소의 정산 엑셀 파일을 업로드하면 자동으로 데이터를 병합해드립니다. ',
        placement: 'bottom',
        image: '/images/tutorial/tooltip2.png',
    },
    {
        title: '수동 정렬',
        description: '양식이 등록되지 않은 경우 오류가 발생할 수 있습니다.',
        placement: 'bottom',
        image: '/images/tutorial/tooltip3.png',
    },
    {
        title: '데이터 통합',
        description: '오류시 수동정렬을 통해 데이터 병합을 할 수 있습니다.(미등록 양식 오류일 경우에만 해당)',
        placement: 'bottom',
        image: '/images/tutorial/tooltip4.png',
    },
    {
        title: '다운로드',
        description: '병합된 데이터를 날짜별로 조회할 수 있으며 다운로드 할 수 있습니다.',
        placement: 'bottom',
        image: '/images/tutorial/tooltip5.png',
    },
];

const ExcelMerge = () => {
    const [files, setFiles] = useState<ExcelFile[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [excelDataList, setExcelDataList] = useState<ExcelData[]>([]);
    const [rowData, setRowData] = useState<RowData[]>([]);
    const [normalizedData, setNormalizedData] = useState<any[]>([]);
    const gridApiRef = useRef<GridApi | null>(null);
    const [uploadExcelData, setUploadExcelData] = useState<any[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [dragFiles, setDragFiles] = useState<File[]>([]);
    const dropZoneRef = useRef<HTMLInputElement>(null);
    const [selectedFileData, setSelectedFileData] = useState<any[]>([]);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [filteredRowData, setFilteredRowData] = useState<RowData[]>([]);
    const [uploadRowData, setUploadRowData] = useState<RowData[]>([]);
    const [selectedFileName, setSelectedFileName] = useState<string>('');
    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

    // 컬럼 정의
    const columnDefs: ColDef[] = [
        {
            field: 'No',
            headerName: 'No',
            flex: 1,
            sort: 'asc',
            cellStyle: { justifyContent: 'center' },
        },
        {
            field: 'id',
            headerName: '충전기ID',
            flex: 1,
            sort: 'asc',
            cellStyle: { justifyContent: 'center' },
        },
        {
            field: 'chargingStartTime',
            headerName: '충전시작',
            flex: 1,
            sort: 'asc',
            sortIndex: 0,
            cellStyle: { justifyContent: 'center' },
        },
        {
            field: 'chargingEndTime',
            headerName: '충전종료',
            flex: 1,
            cellStyle: { justifyContent: 'center' },
        },
        {
            field: 'chargingTime',
            headerName: '충전시간',
            flex: 1,
            cellStyle: { justifyContent: 'right' },
            valueFormatter: (params) => {
                return params.value ? `${params.value}분` : '';
            },
        },
        {
            field: 'chargingAmount',
            headerName: '충전량',
            flex: 1,
            cellStyle: { justifyContent: 'right' },
            valueFormatter: (params) => {
                return params.value ? `${params.value}kWh` : '';
            },
        },
        {
            field: 'chargingAmountM',
            headerName: '충전금액',
            flex: 1,
            cellStyle: { justifyContent: 'right' },
            valueFormatter: (params) => {
                return params.value ? `${params.value.toLocaleString()}원` : '';
            },
        },
    ];

    const [excelUploadModalOpen, setExcelUploadModalOpen] = useState(false);
    const [openTutorial, setOpenTutorial] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [validFiles, setValidFiles] = useState<ExcelFile[]>([]);
    const [invalidFiles, setInvalidFiles] = useState<ExcelFile[]>([]);

    // AG Grid 설정
    const gridOptions: GridOptions = {
        pagination: true,
        paginationPageSize: 30,
        cacheBlockSize: 30,
        rowModelType: 'clientSide',
        defaultColDef: {
            sortable: true,
            resizable: true,
        },
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files).map((file, index) => ({
                id: Date.now() + index,
                name: file.name,
                status: 'pending' as const,
                selected: false,
            }));
            setFiles((prev) => [...prev, ...newFiles]);
        }
    };

    const handleDelete = (id: number) => {
        setFiles((prev) => prev.filter((file) => file.id !== id));
        // 엑셀 데이터 목록에서도 해당 파일 데이터 제거
        setExcelDataList((prev) => prev.filter((data) => data.id !== id));
    };

    const handleCheckboxChange = (id: number) => {
        setFiles((prev) => prev.map((file) => (file.id === id ? { ...file, selected: !file.selected } : file)));
    };

    // 엑셀 헤더 검증 함수
    const validateExcelHeaders = (
        headers: string[]
    ): { isValid: boolean; formType?: string; formName?: string; error?: string; header?: number } => {
        let errorMessage = '지원하지 않는 엑셀 형식입니다.';
        if (Array.isArray(headers)) {
            for (const form of EXCEL_FORM_TYPES) {
                const isMatch = form.headers.every((header) => headers.includes(header));
                if (isMatch) {
                    return { isValid: true, formType: form.id, formName: form.name, header: form.headerRow };
                } else {
                    errorMessage = '지원하지 않는 엑셀 형식입니다.';
                }
            }
        } else {
            errorMessage = 'header 행이 잘못 설정되어 있습니다.';
        }
        return {
            isValid: false,
            error: errorMessage,
        };
    };

    const validateFile = async (id: number, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const headerRows = EXCEL_FORM_TYPES.map((form) => form.headerRow).filter(
            (row, index, self) => self.indexOf(row) === index
        );

        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'array' });
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];

                // 파일 이름 업데이트 (상태와 관계없이)
                setFiles((prev) =>
                    prev.map((fileItem) =>
                        fileItem.id === id
                            ? {
                                  ...fileItem,
                                  name: file.name,
                              }
                            : fileItem
                    )
                );

                // 먼저 엑셀 데이터를 추출하여 저장 (형식 지원 여부와 관계없이)
                const excelData = XLSX.utils.sheet_to_json(worksheet);

                // 모든 엑셀 파일 데이터 저장 (유효성 검사와 무관하게)
                setFiles((prev) => {
                    const updatedFiles = [...prev];
                    const fileIndex = updatedFiles.findIndex((file) => file.id === id);
                    if (fileIndex !== -1) {
                        updatedFiles[fileIndex] = {
                            ...updatedFiles[fileIndex],
                            data: excelData, // 모든 파일의 데이터를 저장
                        };
                    }
                    return updatedFiles;
                });

                // 업로드 데이터 저장 (모달 표시용 - 이제 각 파일마다 저장하므로 불필요할 수 있음)
                setUploadExcelData(excelData);

                let foundValidFormat = false;
                for (const headerRow of headerRows) {
                    const headers = XLSX.utils.sheet_to_json(worksheet, {
                        header: 1,
                        range: headerRow - 1,
                    })[0] as string[];

                    const validation = validateExcelHeaders(headers);
                    if (validation.isValid) {
                        foundValidFormat = true;
                        // 기존에 같은 ID의 데이터가 있는지 확인
                        const existingDataIndex = excelDataList.findIndex((data) => data.id === id);

                        // 형식이 맞는 엑셀 데이터 추출
                        const formattedExcelData = XLSX.utils.sheet_to_json(worksheet, {
                            range: headerRow - 1,
                        });

                        // 데이터 저장 (기존 데이터가 있으면 교체, 없으면 추가)
                        if (existingDataIndex >= 0) {
                            const updatedDataList = [...excelDataList];
                            updatedDataList[existingDataIndex] = {
                                id,
                                formType: validation.formType!,
                                data: formattedExcelData,
                            };
                            setExcelDataList(updatedDataList);
                        } else {
                            setExcelDataList((prev) => [
                                ...prev,
                                {
                                    id,
                                    formType: validation.formType!,
                                    data: formattedExcelData,
                                },
                            ]);
                        }

                        // 파일 상태 업데이트 (성공)
                        setFiles((prev) => {
                            const updatedFiles = [...prev];
                            const fileIndex = updatedFiles.findIndex((file) => file.id === id);
                            if (fileIndex !== -1) {
                                updatedFiles[fileIndex] = {
                                    ...updatedFiles[fileIndex],
                                    name: file.name,
                                    status: 'success',
                                    formType: validation.formType,
                                    formName: validation.formName,
                                    headerRow: validation.header,
                                    data: formattedExcelData, // 성공 시에도 데이터 저장
                                };
                            }
                            return updatedFiles;
                        });
                        break;
                    }
                }

                // 유효한 형식을 찾지 못한 경우
                if (!foundValidFormat) {
                    setFiles((prev) => {
                        const updatedFiles = [...prev];
                        const fileIndex = updatedFiles.findIndex((file) => file.id === id);
                        if (fileIndex !== -1) {
                            updatedFiles[fileIndex] = {
                                ...updatedFiles[fileIndex],
                                name: file.name,
                                status: 'error',
                                errorMessage: '지원하지 않는 엑셀 형식입니다.',
                                data: excelData, // 오류 상태에서도 데이터 유지
                            };
                        }
                        return updatedFiles;
                    });
                }
            };
            reader.readAsArrayBuffer(file);
        } catch (error) {
            console.error('엑셀 파일 처리 중 오류:', error);
            setFiles((prev) => {
                const updatedFiles = [...prev];
                const fileIndex = updatedFiles.findIndex((file) => file.id === id);
                if (fileIndex !== -1) {
                    updatedFiles[fileIndex] = {
                        ...updatedFiles[fileIndex],
                        name: file.name,
                        status: 'error',
                        errorMessage: '파일 검증 중 오류가 발생했습니다.',
                    };
                }
                return updatedFiles;
            });
        }
    };

    useEffect(() => {
        setValidFiles(files.filter((file) => file.status === 'success'));
        setInvalidFiles(files.filter((file) => file.status === 'error'));
    }, [files]);

    // 모달 열기 함수 - 파일 ID를 받아서 해당 파일의 데이터를 모달로 전달
    const modifyModalOpen = (fileId: number) => {
        // 파일 ID로 해당 파일 찾기
        const fileData = files.find((file) => file.id === fileId);

        if (fileData && fileData.data) {
            // 해당 파일의 데이터를 모달로 전달
            setSelectedFileData(fileData.data);
            setExcelUploadModalOpen(true);
        } else {
            console.error('파일 데이터를 찾을 수 없습니다:', fileId);
        }
    };

    // 변환된 데이터 처리 함수
    const handleTransformedData = (transformedData: any[]) => {
        if (!transformedData || transformedData.length === 0) return;

        // 현재 파일의 ID 찾기 (modifyModalOpen에서 설정한 selectedFileData 기반)
        const currentFileIndex = files.findIndex(
            (file) => file.data && JSON.stringify(file.data) === JSON.stringify(selectedFileData)
        );

        if (currentFileIndex === -1) {
            console.error('현재 처리 중인 파일을 찾을 수 없습니다.');
            return;
        }

        const currentFileId = files[currentFileIndex].id;

        // 파일 상태 업데이트 (사용자 수정 완료)
        setFiles((prev) => {
            const updatedFiles = [...prev];
            const fileIndex = updatedFiles.findIndex((file) => file.id === currentFileId);
            if (fileIndex !== -1) {
                updatedFiles[fileIndex] = {
                    ...updatedFiles[fileIndex],
                    status: 'success', // 상태를 성공으로 변경
                    formName: '사용자 수정', // 폼 이름 변경
                    data: transformedData, // 변환된 데이터로 업데이트
                };
            }
            return updatedFiles;
        });

        // excelDataList 업데이트
        setExcelDataList((prev) => {
            const existingDataIndex = prev.findIndex((data) => data.id === currentFileId);
            if (existingDataIndex >= 0) {
                const updatedDataList = [...prev];
                updatedDataList[existingDataIndex] = {
                    id: currentFileId,
                    formType: 'custom', // 사용자 정의 타입
                    data: transformedData,
                };
                return updatedDataList;
            } else {
                return [
                    ...prev,
                    {
                        id: currentFileId,
                        formType: 'custom',
                        data: transformedData,
                    },
                ];
            }
        });
    };

    // 엑셀 데이터가 변경될 때마다 정규화된 데이터 업데이트
    useEffect(() => {
        if (excelDataList.length > 0) {
            const normalized = normalizeExcelData(excelDataList);
            setNormalizedData(normalized);

            // AG Grid 데이터 업데이트
            const gridData = normalized.map((item, index) => ({
                No: index + 1,
                id: item['충전기ID'] || `Row-${index + 1}`,
                chargingStartTime: item['충전시작'] || '',
                chargingEndTime: item['충전종료'] || '',
                chargingTime: item['충전시간'] || '',
                chargingAmount: item['충전량'] || '',
                chargingAmountM: item['충전금액'] || '',
            }));
            setRowData(gridData);
            setUploadRowData(gridData); // 초기 필터링 데이터 설정

            // 빈 input 박스 추가
            if (files.length === 0) {
                setFiles([{ id: Date.now(), name: '', status: 'pending', selected: false }]);
            }
        } else {
            setNormalizedData([]);
            setRowData([]);
            setUploadRowData([]); // 필터링 데이터 초기화
            // 데이터가 없을 때도 빈 input 박스 유지
        }
    }, [excelDataList]);

    const filterDataByDate = useCallback(() => {
        if (!startDate || !endDate || !rowData.length) {
            setUploadRowData(sortDataByChargingStartTime(rowData));
            return;
        }

        const filtered = rowData.filter((row) => {
            const chargingStartDate = new Date(row.chargingStartTime);
            return chargingStartDate >= startDate && chargingStartDate <= endDate;
        });

        // 필터링된 데이터도 충전시작 시간으로 정렬
        setUploadRowData(sortDataByChargingStartTime(filtered));
    }, [startDate, endDate, rowData]);

    // 데이터를 충전시작시간 기준으로 정렬하는 함수
    const sortDataByChargingStartTime = (data: RowData[]): RowData[] => {
        if (!data || data.length === 0) return [];

        const sortedData = [...data].sort((a, b) => {
            const dateA = new Date(a.chargingStartTime || '');
            const dateB = new Date(b.chargingStartTime || '');

            // 날짜가 유효하지 않은 경우 처리
            const isValidDateA = !isNaN(dateA.getTime());
            const isValidDateB = !isNaN(dateB.getTime());

            if (!isValidDateA && !isValidDateB) return 0;
            if (!isValidDateA) return 1;
            if (!isValidDateB) return -1;

            // 오름차순 정렬 (오래된 날짜가 먼저)
            return dateA.getTime() - dateB.getTime();
        });

        // 정렬 후 행 번호 다시 설정
        return sortedData.map((row, index) => ({
            ...row,
            No: index + 1,
        }));
    };

    const handleClearFilter = () => {
        setStartDate(null);
        setEndDate(null);
        setUploadRowData(sortDataByChargingStartTime(rowData));
    };

    const handleApplyFilter = () => {
        filterDataByDate();
    };

    useEffect(() => {
        setUploadRowData(sortDataByChargingStartTime(rowData));
    }, [rowData]);

    const downloadExcelForm = () => {
        if (!filteredRowData.length) {
            alert('다운로드할 데이터가 없습니다.');
            return;
        }

        // 데이터를 충전시작 시간으로 정렬
        const sortedData = sortDataByChargingStartTime(filteredRowData);

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('충전 데이터');

        // 컬럼 정의에서 헤더 정보 추출
        const headers = columnDefs.map((col) => ({
            header: col.headerName || col.field,
            key: col.field,
            width: 15, // 기본 폭 설정
        }));

        // 헤더 설정
        worksheet.columns = headers;

        // 스타일 적용을 위한 헤더 행 가져오기
        const headerRow = worksheet.getRow(1);

        // 헤더 스타일 적용
        headerRow.eachCell((cell) => {
            cell.font = { bold: true, size: 12 };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFE0E0E0' },
            };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' },
            };
        });

        // 높이 설정
        headerRow.height = 25;

        // 데이터 행 추가 (정렬된 데이터 사용)
        sortedData.forEach((row, index) => {
            const rowData: any = {};

            // 컬럼 정의에 맞게 데이터 구성
            columnDefs.forEach((col) => {
                const field = col.field;
                if (field) {
                    // 값 포맷팅 적용
                    if (
                        col.valueFormatter &&
                        typeof col.valueFormatter === 'function' &&
                        row[field] !== undefined &&
                        row[field] !== null
                    ) {
                        // valueFormatter 함수를 직접 사용하는 대신 포맷 규칙을 직접 적용
                        if (field === 'chargingTime' && row[field]) {
                            rowData[field] = `${row[field]}`;
                        } else if (field === 'chargingAmount' && row[field]) {
                            rowData[field] = `${row[field]}`;
                        } else if (field === 'chargingAmountM' && row[field]) {
                            rowData[field] = `${row[field]}`;
                        } else {
                            rowData[field] = row[field];
                        }
                    } else {
                        rowData[field] = row[field];
                    }
                }
            });

            worksheet.addRow(rowData);

            // 방금 추가한 행에 스타일 적용
            const dataRow = worksheet.getRow(index + 2); // 헤더 다음부터 시작

            // 데이터 행 스타일 적용
            dataRow.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' },
                };

                // 숫자 데이터 정렬
                if (typeof cell.value === 'number') {
                    cell.alignment = { vertical: 'middle', horizontal: 'right' };
                } else {
                    cell.alignment = { vertical: 'middle', horizontal: 'center' };
                }
            });

            // 높이 설정
            dataRow.height = 20;
        });

        // 열 너비 자동 조정
        worksheet.columns.forEach((column) => {
            if (column && typeof column.eachCell === 'function') {
                let maxLength = 0;
                column.eachCell({ includeEmpty: true }, (cell) => {
                    const columnLength = cell.value ? String(cell.value).length : 10;
                    if (columnLength > maxLength) {
                        maxLength = columnLength;
                    }
                });
                // 최소 너비 10, 최대 너비 30 설정
                column.width = Math.max(10, Math.min(30, maxLength + 2));
            }
        });

        // 엑셀 파일 다운로드
        workbook.xlsx.writeBuffer().then((buffer) => {
            const blob = new Blob([buffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `충전데이터_${new Date().toISOString().split('T')[0]}.xlsx`;
            a.click();
            window.URL.revokeObjectURL(url);
        });
    };

    // 드래그 앤 드랍 이벤트 핸들러
    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);

        // 파일 확장자로 엑셀 파일 확인
        const validExcelFiles = files.filter((file) => {
            const fileName = file.name.toLowerCase();
            return fileName.endsWith('.xlsx') || fileName.endsWith('.xls');
        });

        if (validExcelFiles.length === 0) {
            alert('엑셀 파일만 업로드 가능합니다.');
            return;
        }

        setDragFiles(validExcelFiles);

        // 각 파일에 대해 validateFile 함수 실행
        for (let i = 0; i < validExcelFiles.length; i++) {
            const file = validExcelFiles[i];
            const newId = Date.now() + i;

            // 새로운 파일 항목 추가 (기존 항목 유지)
            setFiles((prev) => {
                // 마지막 항목이 빈 항목이면 교체, 아니면 추가
                const lastItem = prev[prev.length - 1];
                if (lastItem && !lastItem.name) {
                    return [...prev.slice(0, -1), { id: newId, name: file.name, status: 'pending', selected: false }];
                }
                return [...prev, { id: newId, name: file.name, status: 'pending', selected: false }];
            });

            // 파일 검증을 위한 이벤트 객체 생성
            const event = {
                target: {
                    files: [file],
                },
            } as unknown as React.ChangeEvent<HTMLInputElement>;

            await validateFile(newId, event);
        }
    };

    const handleTutorialOpen = () => {
        setOpenTutorial(true);
        setCurrentStep(0);
    };

    const handleNextStep = () => {
        if (currentStep < tutorialSteps.length - 1) {
            setCurrentStep((prev) => prev + 1);
        }
    };

    const handlePrevStep = () => {
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    const handleTutorialSkip = () => {
        setOpenTutorial(false);
    };

    const handleDeleteSelectedFiles = () => {
        const selectedFileIds = files.filter((file) => file.selected).map((file) => file.id);
        setFiles((prevFiles) => prevFiles.filter((file) => !file.selected));
        setExcelDataList((prevDataList) => prevDataList.filter((data) => !selectedFileIds.includes(data.id)));
    };

    const handlePreviewData = () => {
        const errorFilesExist = files.some((file) => file.status === 'error');

        if (errorFilesExist) {
            setOpenConfirmDialog(true);
        } else {
            const successfulFilesData = files
                .filter((file) => file.status === 'success' && file.data && file.formType)
                .map((file) => ({
                    id: file.id,
                    formType: file.formType!,
                    data: file.data!,
                }));

            if (successfulFilesData.length > 0) {
                const normalized = normalizeExcelData(successfulFilesData);
                const gridData = normalized.map((item, index) => ({
                    No: index + 1,
                    id: item['충전기ID'] || `Row-${index + 1}`,
                    chargingStartTime: item['충전시작'] || '',
                    chargingEndTime: item['충전종료'] || '',
                    chargingTime: item['충전시간'] || '',
                    chargingAmount: item['충전량'] || '',
                    chargingAmountM: item['충전금액'] || '',
                }));
                setFilteredRowData(gridData);
            } else {
                setFilteredRowData([]);
            }
        }
    };

    const handleConfirmDialogClose = () => {
        setOpenConfirmDialog(false);
    };

    const handleConfirmDialogProceed = () => {
        const successfulFilesData = files
            .filter((file) => file.status === 'success' && file.data && file.formType)
            .map((file) => ({
                id: file.id,
                formType: file.formType!,
                data: file.data!,
            }));

        if (successfulFilesData.length > 0) {
            const normalized = normalizeExcelData(successfulFilesData);
            const gridData = normalized.map((item, index) => ({
                No: index + 1,
                id: item['충전기ID'] || `Row-${index + 1}`,
                chargingStartTime: item['충전시작'] || '',
                chargingEndTime: item['충전종료'] || '',
                chargingTime: item['충전시간'] || '',
                chargingAmount: item['충전량'] || '',
                chargingAmountM: item['충전금액'] || '',
            }));
            setFilteredRowData(gridData);
        } else {
            setFilteredRowData([]);
        }
        setOpenConfirmDialog(false);
    };

    return (
        <Box sx={{ p: 3, maxWidth: '1200px', margin: '0 auto' }}>
            <Typography
                variant="h4"
                component="h1"
                gutterBottom
                sx={{
                    fontWeight: 600,
                    color: '#1a1a1a',
                    mb: 3,
                }}
            >
                통합 정산하기
            </Typography>
            <Box sx={{ border: '2px solid #e0e0e0', borderRadius: 2, p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography
                        variant="body1"
                        sx={{
                            color: '#666666',
                        }}
                    >
                        엑셀 파일을 업로드하여 데이터를 한눈에 정리하세요
                    </Typography>
                    <ClickAwayListener onClickAway={handleTutorialSkip}>
                        <div>
                            <Tooltip
                                open={openTutorial}
                                onClose={(e) => {
                                    e?.stopPropagation();
                                    e?.preventDefault();
                                }}
                                placement="right-start"
                                disableFocusListener
                                disableHoverListener
                                disableTouchListener
                                componentsProps={{
                                    tooltip: {
                                        sx: {
                                            bgcolor: '#A1D8B8',
                                            maxWidth: 'none',
                                            p: 0,
                                            borderRadius: '16px',
                                            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
                                            marginTop: '-85px',
                                            '& .MuiTooltip-arrow': {
                                                color: '#A1D8B8',
                                                top: '10% !important',
                                                left: '0 !important',
                                            },
                                        },
                                    },
                                    arrow: {
                                        sx: {
                                            color: '#A1D8B8',
                                            position: 'absolute',
                                            top: '20%',
                                            left: 0,
                                        },
                                    },
                                }}
                                arrow
                                title={
                                    <Box
                                        sx={{
                                            position: 'relative',
                                            width: 500,
                                            p: 0,
                                            minHeight: 450,
                                            bgcolor: '#A1D8B8',
                                            borderRadius: '16px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                        }}
                                    >
                                        <IconButton
                                            onClick={handleTutorialSkip}
                                            sx={{
                                                position: 'absolute',
                                                right: 8,
                                                top: 8,
                                                color: '#666666',
                                                zIndex: 1,
                                            }}
                                        >
                                            <ClearIcon fontSize="small" sx={{ color: '#22675F' }} />
                                        </IconButton>

                                        <Box sx={{ flex: 1, overflow: 'auto' }}>
                                            <Box sx={{ display: 'flex', gap: 1, p: 2, pb: 1 }}>
                                                {tutorialSteps.map((_, index) => (
                                                    <Box
                                                        key={index}
                                                        sx={{
                                                            width: 8,
                                                            height: 8,
                                                            borderRadius: '50%',
                                                            backgroundColor:
                                                                index === currentStep ? '#6ED8AF' : '#E5E7EB',
                                                        }}
                                                    />
                                                ))}
                                            </Box>
                                            <Box sx={{ p: 3, pt: 0 }}>
                                                <Box
                                                    sx={{
                                                        width: '100%',
                                                        height: 200,
                                                        mb: 2,
                                                        mt: 3,
                                                        borderRadius: 2,
                                                        overflow: 'hidden',
                                                        '& img': {
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'cover',
                                                        },
                                                    }}
                                                >
                                                    <img
                                                        src={tutorialSteps[currentStep].image}
                                                        alt={tutorialSteps[currentStep].title}
                                                    />
                                                </Box>
                                                <Typography
                                                    variant="subtitle1"
                                                    sx={{ fontWeight: 600, mb: 1, color: '#074B33' }}
                                                >
                                                    {tutorialSteps[currentStep].title}
                                                </Typography>
                                                <Typography variant="body2" sx={{ mb: 2, color: '#074B33' }}>
                                                    {tutorialSteps[currentStep].description}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Box
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'flex-end',
                                                gap: 1,
                                                p: 2,
                                            }}
                                        >
                                            {currentStep === tutorialSteps.length - 1 ? (
                                                <>
                                                    <Button
                                                        size="small"
                                                        onClick={handlePrevStep}
                                                        sx={{
                                                            color: '#22675F',
                                                            bgcolor: '#fff',
                                                            fontWeight: 600,
                                                            '&:hover': {
                                                                bgcolor: '#F3F4F6',
                                                            },
                                                        }}
                                                    >
                                                        Prev
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        onClick={handleTutorialSkip}
                                                        variant="contained"
                                                        sx={{
                                                            backgroundColor: '#6ED8AF',
                                                            color: '#fff',
                                                            fontWeight: 600,
                                                            boxShadow: 'none',
                                                            '&:hover': {
                                                                backgroundColor: '#5BC39D',
                                                                boxShadow: 'none',
                                                            },
                                                        }}
                                                    >
                                                        Close
                                                    </Button>
                                                </>
                                            ) : (
                                                <>
                                                    <Button
                                                        size="small"
                                                        onClick={handleTutorialSkip}
                                                        sx={{
                                                            color: '#22675F',
                                                            bgcolor: '#fff',
                                                            fontWeight: 600,
                                                            '&:hover': {
                                                                bgcolor: '#F3F4F6',
                                                            },
                                                        }}
                                                    >
                                                        Skip
                                                    </Button>
                                                    {currentStep > 0 && (
                                                        <Button
                                                            size="small"
                                                            onClick={handlePrevStep}
                                                            sx={{
                                                                color: '#22675F',
                                                                bgcolor: '#fff',
                                                                fontWeight: 600,
                                                                '&:hover': {
                                                                    bgcolor: '#F3F4F6',
                                                                },
                                                            }}
                                                        >
                                                            Prev
                                                        </Button>
                                                    )}
                                                    <Button
                                                        size="small"
                                                        onClick={handleNextStep}
                                                        variant="contained"
                                                        sx={{
                                                            backgroundColor: '#6ED8AF',
                                                            color: '#fff',
                                                            boxShadow: 'none',
                                                            fontWeight: 600,
                                                            '&:hover': {
                                                                backgroundColor: '#5BC39D',
                                                                boxShadow: 'none',
                                                            },
                                                        }}
                                                    >
                                                        Next
                                                    </Button>
                                                </>
                                            )}
                                        </Box>
                                    </Box>
                                }
                            >
                                <Button
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        handleTutorialOpen();
                                    }}
                                    sx={{
                                        color: '#666666',
                                        border: '1px solid #A5A8AD',
                                        borderRadius: '8px',
                                        height: '35px',
                                        width: '120px',
                                        '&:hover': {
                                            backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                        },
                                    }}
                                >
                                    통합 가이드 안내
                                </Button>
                            </Tooltip>
                        </div>
                    </ClickAwayListener>
                </Box>
            </Box>
            <Box>
                <Typography variant="h6" sx={{ mb: 2, fontSize: '18px', fontWeight: 600 }}>
                    엑셀 파일 업로드
                </Typography>
                <Paper
                    sx={{
                        p: 3,
                        mb: 3,
                        border: '2px dashed #CFD2D5',
                        boxShadow: 'none',
                        bgcolor: isDragging ? '#F3F4F6' : '#fff',
                    }}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                >
                    <Box
                        sx={{
                            borderRadius: 1,
                            p: 3,
                            textAlign: 'center',
                            bgcolor: 'transparent',
                        }}
                    >
                        <UploadFileIcon sx={{ fontSize: 40, color: '#9CA3AF', mb: 1, display: 'inline' }} />
                        <Typography sx={{ color: '#4B5563', mb: 0.5, display: 'inline', ml: 1 }}>
                            정리할 파일을 마우스로 끌어 놓으세요.
                        </Typography>
                        <Typography sx={{ color: '#9CA3AF', fontSize: '14px', display: 'block' }}>
                            또는 아래의 '파일 업로드' 버튼을 클릭하여 파일을 선택하세요.
                        </Typography>
                        {/* 파일 업로드 버튼을 안내문구 아래에 배치 */}
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => fileInputRef.current?.click()}
                                sx={{
                                    height: 40,
                                    minWidth: 120,
                                    borderRadius: 2,
                                    background: '#A1D8B8',
                                    border: '1px solid #e0e0e0',
                                    boxShadow: 'none',
                                    color: '#22675F',
                                    fontWeight: 600,
                                    '&:hover': {
                                        background: '#8bc9a6',
                                    },
                                }}
                            >
                                파일 업로드
                            </Button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={handleFileSelect}
                                multiple
                                accept=".xlsx,.xls"
                            />
                        </Box>
                    </Box>
                </Paper>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography sx={{ fontSize: '18px', fontWeight: 600 }}>
                        파일 업로드 목록{' '}
                        <span style={{ fontSize: '14px', fontWeight: 400, color: '#666' }}>
                            {files.length ? `(정상: ${validFiles.length}, 지원 외: ${invalidFiles.length})` : ''}
                        </span>
                    </Typography>
                    <Box>
                        <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={handleDeleteSelectedFiles}
                            disabled={files.every((file) => !file.selected)}
                            sx={{ ml: 2 }}
                        >
                            선택 삭제
                        </Button>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={handlePreviewData}
                            disabled={!files.some((file) => file.status === 'success')}
                            sx={{
                                ml: 2,
                                backgroundColor: 'white',
                                border: '1px solid #e0e0e0',
                                color: '#22675F',
                                fontWeight: 600,
                            }}
                        >
                            데이터 미리보기
                        </Button>
                    </Box>
                </Box>
                <Paper sx={{ p: 3, border: '1px solid #E5E7EB', boxShadow: 'none' }}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: '#F8F8FB' }}>
                                    <TableCell padding="checkbox" sx={{ borderBottom: '1px solid #E5E7EB' }}>
                                        <Checkbox
                                            size="small"
                                            checked={files.length > 0 && files.every((file) => file.selected)}
                                            indeterminate={
                                                files.length > 0 &&
                                                files.some((file) => file.selected) &&
                                                !files.every((f) => f.selected)
                                            }
                                            onChange={(e) => {
                                                setFiles((prev) =>
                                                    prev.map((file) => ({
                                                        ...file,
                                                        selected: e.target.checked,
                                                    }))
                                                );
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            borderBottom: '1px solid #E5E7EB',
                                            color: '#6B7280',
                                            fontSize: '14px',
                                        }}
                                    >
                                        파일명
                                    </TableCell>
                                    <TableCell
                                        align="center"
                                        sx={{
                                            borderBottom: '1px solid #E5E7EB',
                                            color: '#6B7280',
                                            fontSize: '14px',
                                        }}
                                    >
                                        상태
                                    </TableCell>
                                    <TableCell
                                        align="center"
                                        sx={{
                                            borderBottom: '1px solid #E5E7EB',
                                            color: '#6B7280',
                                            fontSize: '14px',
                                        }}
                                    >
                                        제조사명
                                    </TableCell>
                                    <TableCell
                                        align="center"
                                        sx={{
                                            borderBottom: '1px solid #E5E7EB',
                                            color: '#6B7280',
                                            fontSize: '14px',
                                        }}
                                    >
                                        삭제
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {files.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    gap: 1,
                                                }}
                                            >
                                                <UploadFileIcon sx={{ fontSize: 48, color: '#9CA3AF' }} />
                                                <Typography sx={{ color: '#6B7280', fontSize: '16px' }}>
                                                    데이터가 없습니다. 엑셀을 업로드 해주세요.
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    files.map((file) => (
                                        <TableRow
                                            key={file.id}
                                            sx={{
                                                '&:hover': { bgcolor: '#F8F8FB' },
                                                borderBottom: '1px solid #E5E7EB',
                                            }}
                                        >
                                            <TableCell padding="checkbox" sx={{ borderBottom: '1px solid #E5E7EB' }}>
                                                <Checkbox
                                                    size="small"
                                                    checked={file.selected}
                                                    onChange={() => handleCheckboxChange(file.id)}
                                                />
                                            </TableCell>
                                            <TableCell
                                                sx={{
                                                    borderBottom: '1px solid #E5E7EB',
                                                    color: '#111827',
                                                    fontSize: '14px',
                                                    cursor: file.status === 'error' ? 'pointer' : 'default',
                                                    '&:hover':
                                                        file.status === 'error'
                                                            ? {
                                                                  textDecoration: 'underline',
                                                                  color: '#2196F3',
                                                              }
                                                            : {},
                                                }}
                                                onClick={() =>
                                                    file.status === 'error' &&
                                                    (modifyModalOpen(file.id), setSelectedFileName(file.name))
                                                }
                                            >
                                                {file.name}
                                            </TableCell>
                                            <TableCell
                                                align="center"
                                                sx={{
                                                    borderBottom: '1px solid #E5E7EB',
                                                    cursor: file.status === 'error' ? 'pointer' : 'default',
                                                }}
                                                onClick={() =>
                                                    file.status === 'error' &&
                                                    (modifyModalOpen(file.id), setSelectedFileName(file.name))
                                                }
                                            >
                                                {file.status === 'success' && (
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: 1,
                                                        }}
                                                    >
                                                        <CheckCircleIcon sx={{ color: '#A1D8B8', fontSize: 24 }} />
                                                    </Box>
                                                )}
                                                {file.status === 'error' && (
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: 1,
                                                        }}
                                                    >
                                                        <ErrorIcon sx={{ color: '#FF6E39', fontSize: 24 }} />
                                                    </Box>
                                                )}
                                            </TableCell>
                                            <TableCell
                                                align="center"
                                                sx={{
                                                    borderBottom: '1px solid #E5E7EB',
                                                    cursor: file.status === 'error' ? 'pointer' : 'default',
                                                }}
                                                onClick={() =>
                                                    file.status === 'error' &&
                                                    (modifyModalOpen(file.id), setSelectedFileName(file.name))
                                                }
                                            >
                                                {file.status === 'error' && (
                                                    <Typography
                                                        sx={{
                                                            color: '#FF6E39',
                                                            fontSize: '14px',
                                                            bgcolor: '#FEE9E3',
                                                            borderRadius: 1,
                                                            p: 1,
                                                            minWidth: 100,
                                                        }}
                                                    >
                                                        지원 외 형식
                                                    </Typography>
                                                )}
                                                {file.status === 'success' && (
                                                    <Typography
                                                        sx={{
                                                            color: '#39B3FF',
                                                            fontSize: '14px',
                                                            bgcolor: '#E3F6FE',
                                                            borderRadius: 1,
                                                            p: 1,
                                                            minWidth: 100,
                                                        }}
                                                    >
                                                        {file.formName}
                                                    </Typography>
                                                )}
                                            </TableCell>
                                            <TableCell align="center" sx={{ borderBottom: '1px solid #E5E7EB' }}>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleDelete(file.id)}
                                                    sx={{ color: '#9CA3AF' }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Box>
            <Divider sx={{ my: 3 }} />
            <Box sx={{ height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography
                        variant="h6"
                        sx={{
                            color: '#333333',
                            fontWeight: 500,
                        }}
                    >
                        데이터 목록 ( Total : {filteredRowData.length} )
                    </Typography>
                </Box>

                {/* 검색 조건 영역 */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            borderRadius: 1,
                            backgroundColor: '#f9f9f9',
                            mb: 3,
                            p: 2,
                            border: '1px solid #e0e0e0',
                            pl: 10,
                            pr: 10,
                            height: 60,
                            width: '100%',
                        }}
                    >
                        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                                날짜별 검색
                            </Typography>
                            <DatePicker
                                label="시작일"
                                value={startDate}
                                onChange={(newValue) => setStartDate(newValue)}
                                format="yyyy-MM-dd"
                                slotProps={{
                                    textField: {
                                        size: 'small',
                                        sx: {
                                            width: 200,
                                            '& .MuiInputBase-root': {
                                                height: 35,
                                                cursor: 'pointer !important',
                                                userSelect: 'none',
                                                '&:hover': {
                                                    backgroundColor: '#f8f8f8',
                                                    '& .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#1976d2',
                                                    },
                                                },
                                            },
                                            '& .MuiOutlinedInput-input': {
                                                paddingTop: '6px',
                                                paddingBottom: '6px',
                                                cursor: 'pointer !important',
                                                userSelect: 'none',
                                            },
                                            '& *': {
                                                cursor: 'pointer !important',
                                                userSelect: 'none',
                                                WebkitUserSelect: 'none',
                                                MozUserSelect: 'none',
                                                msUserSelect: 'none',
                                            },
                                            '& input': {
                                                cursor: 'pointer !important',
                                                userSelect: 'none',
                                            },
                                            cursor: 'pointer !important',
                                            userSelect: 'none',
                                            WebkitUserSelect: 'none',
                                            MozUserSelect: 'none',
                                            msUserSelect: 'none',
                                        },
                                        inputProps: {
                                            style: {
                                                cursor: 'pointer',
                                                userSelect: 'none',
                                            },
                                        },
                                        readOnly: true,
                                        onClick: (e) => {
                                            const btnEl = e.currentTarget.querySelector(
                                                '.MuiInputAdornment-root button'
                                            ) as HTMLButtonElement;
                                            if (btnEl) btnEl.click();
                                        },
                                    },
                                    day: {
                                        sx: {
                                            '&.Mui-selected': {
                                                backgroundColor: '#A1D8B8',
                                                color: '#000000',
                                                '&:hover': {
                                                    backgroundColor: '#8bc9a6',
                                                },
                                                '&:focus': {
                                                    backgroundColor: '#8bc9a6',
                                                },
                                            },
                                            '&:hover': {
                                                backgroundColor: '#e8f5e9',
                                            },
                                        },
                                    },
                                }}
                            />
                            <DatePicker
                                label="종료일"
                                value={endDate}
                                onChange={(newValue) => setEndDate(newValue)}
                                format="yyyy-MM-dd"
                                slotProps={{
                                    textField: {
                                        size: 'small',
                                        sx: {
                                            width: 200,
                                            '& .MuiInputBase-root': {
                                                height: 35,
                                                cursor: 'pointer !important',
                                                userSelect: 'none',
                                                '&:hover': {
                                                    backgroundColor: '#f8f8f8',
                                                    '& .MuiOutlinedInput-notchedOutline': {
                                                        borderColor: '#1976d2',
                                                    },
                                                },
                                            },
                                            '& .MuiOutlinedInput-input': {
                                                paddingTop: '6px',
                                                paddingBottom: '6px',
                                                cursor: 'pointer !important',
                                                userSelect: 'none',
                                            },
                                            '& *': {
                                                cursor: 'pointer !important',
                                                userSelect: 'none',
                                                WebkitUserSelect: 'none',
                                                MozUserSelect: 'none',
                                                msUserSelect: 'none',
                                            },
                                            '& input': {
                                                cursor: 'pointer !important',
                                                userSelect: 'none',
                                            },
                                            cursor: 'pointer !important',
                                            userSelect: 'none',
                                            WebkitUserSelect: 'none',
                                            MozUserSelect: 'none',
                                            msUserSelect: 'none',
                                        },
                                        inputProps: {
                                            style: {
                                                cursor: 'pointer',
                                                userSelect: 'none',
                                            },
                                        },
                                        readOnly: true,
                                        onClick: (e) => {
                                            const btnEl = e.currentTarget.querySelector(
                                                '.MuiInputAdornment-root button'
                                            ) as HTMLButtonElement;
                                            if (btnEl) btnEl.click();
                                        },
                                    },
                                    day: {
                                        sx: {
                                            '&.Mui-selected': {
                                                backgroundColor: '#A1D8B8',
                                                color: '#000000',
                                                '&:hover': {
                                                    backgroundColor: '#8bc9a6',
                                                },
                                                '&:focus': {
                                                    backgroundColor: '#8bc9a6',
                                                },
                                            },
                                            '&:hover': {
                                                backgroundColor: '#e8f5e9',
                                            },
                                        },
                                    },
                                }}
                            />
                        </LocalizationProvider>
                        <Button
                            variant="contained"
                            onClick={handleApplyFilter}
                            sx={{
                                height: 40,
                                minWidth: 100,
                                backgroundColor: 'white',
                                border: '1px solid #e0e0e0',
                                color: '#41505D',
                                borderRadius: 2,
                                fontSize: 16,
                                fontWeight: 500,
                                boxShadow: 'none',
                                '&:hover': {
                                    backgroundColor: '#f0f0f0',
                                },
                            }}
                        >
                            검색
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleClearFilter}
                            sx={{
                                height: 40,
                                minWidth: 100,
                                backgroundColor: 'white',
                                border: '1px solid #e0e0e0',
                                color: 'black',
                                borderRadius: 2,
                                boxShadow: 'none',
                                '&:hover': {
                                    backgroundColor: '#f0f0f0',
                                },
                            }}
                        >
                            초기화
                        </Button>
                    </Box>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={downloadExcelForm}
                        sx={{
                            height: 60,
                            minWidth: 150,
                            borderRadius: 2,
                            background: '#A1D8B8',
                            border: '1px solid #e0e0e0',
                            boxShadow: 'none',
                            ml: 2,
                            mb: 3,
                            color: '#22675F',
                            '&:hover': {
                                background: '#8bc9a6',
                                boxShadow: 'none',
                            },
                        }}
                    >
                        데이터 내려받기
                    </Button>
                </Box>

                <CustomAgGrid
                    rowData={filteredRowData}
                    columnDefs={columnDefs}
                    height={400}
                    gridOptions={gridOptions}
                />
            </Box>
            <ExcelMergeModal
                open={excelUploadModalOpen}
                onClose={() => setExcelUploadModalOpen(false)}
                excelData={selectedFileData}
                fileName={selectedFileName}
                excelFormData={EXCEL_FORM_TYPES}
                gridOptions={gridOptions}
                regularExcelForm={REGULAR_EXCEL_FORM_TYPES}
                onDataTransform={handleTransformedData}
            />
            <ModernConfirmDialog
                open={openConfirmDialog}
                onClose={handleConfirmDialogClose}
                onConfirm={handleConfirmDialogProceed}
                title="알림"
                contentText={
                    <>
                        지원 외 형식 파일이 있습니다.
                        <br />
                        데이터를 미리 보시겠습니까?
                    </>
                }
                cancelText="취소"
                confirmText="미리보기"
            />
        </Box>
    );
};

export default ExcelMerge;
