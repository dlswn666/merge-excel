'use client';

import React from 'react';
import { Box, Typography, Container, Paper, Grid, Divider } from '@mui/material';
import Image from 'next/image';

export default function GuidePage() {
    return (
        <Container
            maxWidth="lg"
            sx={{
                py: { xs: 3, sm: 4, md: 5 },
                backgroundColor: '#ffffff',
                mt: -10,
            }}
        >
            <Box sx={{ textAlign: 'left', mb: 4 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: '#41505D', mb: 4 }}>
                    통합정산 가이드
                </Typography>
                <Paper
                    elevation={0}
                    sx={{
                        display: 'inline-flex',
                        px: 2.5,
                        py: 1,
                        borderRadius: '50px',
                        border: '1px solid #33B885',
                        mb: 4,
                    }}
                >
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#33B885', fontSize: '14px' }}>
                        간편하고 편리한 통합 정산 방법
                    </Typography>
                </Paper>
            </Box>

            <Grid container spacing={5}>
                <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 4 }}>
                        <Box
                            sx={{
                                fontSize: '28px',
                                fontWeight: 700,
                                color: '#33B885',
                                lineHeight: 1.2,
                                display: 'flex',
                                alignItems: 'center',
                                minWidth: '40px',
                            }}
                        >
                            01
                        </Box>
                        <Box sx={{ paddingTop: '6px' }}>
                            <Typography
                                variant="body1"
                                sx={{ color: '#41505D', lineHeight: 1.6, fontSize: '13px', fontWeight: 500 }}
                            >
                                제조사별 정산 엑셀 파일을 업로드하기만 하면 취합하여 데이터를 한눈에 정리할 수 있어요.
                                <br />
                                엑셀 파일 업로드란 첨부할 정산 엑셀 파일들을 마우스로 끌어넣거나 파일 업로드 하기를
                                선택하여 업로드 할 수 있어요.
                            </Typography>
                        </Box>
                    </Box>
                    <Box
                        sx={{
                            width: '100%',
                            height: 'auto',
                            position: 'relative',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            mb: 5,
                        }}
                    >
                        {/* 이미지는 실제 경로로 대체해야 합니다 */}
                        <div
                            style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Image
                                src="/images/guide/guide1.png"
                                alt="엑셀 파일 업로드 화면 이미지"
                                width={1000}
                                height={1000}
                            />
                        </div>
                    </Box>
                </Grid>

                <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 4 }}>
                        <Box
                            sx={{
                                fontSize: '28px',
                                fontWeight: 700,
                                color: '#33B885',
                                lineHeight: 1.2,
                                display: 'flex',
                                alignItems: 'center',
                                minWidth: '40px',
                            }}
                        >
                            02
                        </Box>
                        <Box sx={{ paddingTop: '6px' }}>
                            <Typography
                                variant="body1"
                                sx={{ color: '#41505D', lineHeight: 1.6, fontSize: '13px', fontWeight: 500 }}
                            >
                                이후 파일 업로드 목록에서 내가 업로드 한 엑셀 파일들의 업로드 상태와 어느 제조사
                                양식인지를 확인할 수 있어요.
                                <br />
                                삭제가 필요할 경우 원하는 파일 리스트를 체크한 뒤 좌측 상단 삭제 버튼 눌러 지울 수
                                있어요.
                                <br />
                                (제조사 명이 일치하지 않을 경우 문의하기를 통해 수정이 가능합니다.)
                            </Typography>
                        </Box>
                    </Box>
                    <Box
                        sx={{
                            width: '100%',
                            height: 'auto',
                            position: 'relative',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            mb: 5,
                        }}
                    >
                        {/* 이미지는 실제 경로로 대체해야 합니다 */}
                        <div
                            style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Image
                                src="/images/guide/guide2.png"
                                alt="파일 업로드 목록 화면 이미지"
                                width={1000}
                                height={1000}
                            />
                        </div>
                    </Box>
                </Grid>

                <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 4 }}>
                        <Box
                            sx={{
                                fontSize: '28px',
                                fontWeight: 700,
                                color: '#33B885',
                                lineHeight: 1.2,
                                display: 'flex',
                                alignItems: 'center',
                                minWidth: '40px',
                            }}
                        >
                            03
                        </Box>
                        <Box sx={{ paddingTop: '6px' }}>
                            <Typography
                                variant="body1"
                                sx={{ color: '#41505D', lineHeight: 1.6, fontSize: '13px', fontWeight: 500 }}
                            >
                                양식이 등록되지 않은 파일의 경우 지원 외 형식이라고 오류가 뜨게 됩니다. 이것은 해당
                                제조사의 양식이 이전 버전이거나,
                                <br />
                                등록되지 않았을 경우, 또는 파일이 양식과 다르게 임의로 수정되어 인식이 안될 경우에
                                해당됩니다.
                                <br />이 경우 우측 수동정렬 버튼을 눌러 직접 양식을 수정할 수 있습니다. (수동정렬 안내
                                가이드 바로가기)
                            </Typography>
                        </Box>
                    </Box>
                    <Box
                        sx={{
                            width: '100%',
                            height: 'auto',
                            position: 'relative',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            mb: 5,
                        }}
                    >
                        {/* 이미지는 실제 경로로 대체해야 합니다 */}
                        <div
                            style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Image
                                src="/images/guide/guide3.png"
                                alt="지원 외 형식 오류 화면 이미지"
                                width={1000}
                                height={1000}
                            />
                        </div>
                    </Box>
                </Grid>

                <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 4 }}>
                        <Box
                            sx={{
                                fontSize: '28px',
                                fontWeight: 700,
                                color: '#33B885',
                                lineHeight: 1.2,
                                display: 'flex',
                                alignItems: 'center',
                                minWidth: '40px',
                            }}
                        >
                            04
                        </Box>
                        <Box sx={{ paddingTop: '6px' }}>
                            <Typography
                                variant="body1"
                                sx={{ color: '#41505D', lineHeight: 1.6, fontSize: '13px', fontWeight: 500 }}
                            >
                                정상 업로드가 된 파일들을 확인 후, 데이터 미리보기 버튼을 눌러 통합 정산 데이터를 조회할
                                수 있습니다.
                            </Typography>
                        </Box>
                    </Box>
                    <Box
                        sx={{
                            width: '100%',
                            height: 'auto',
                            position: 'relative',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            mb: 5,
                        }}
                    >
                        {/* 이미지는 실제 경로로 대체해야 합니다 */}
                        <div
                            style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Image
                                src="/images/guide/guide4.png"
                                alt="데이터 미리보기 화면 이미지"
                                width={1000}
                                height={1000}
                            />
                        </div>
                    </Box>
                </Grid>

                <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 4 }}>
                        <Box
                            sx={{
                                fontSize: '28px',
                                fontWeight: 700,
                                color: '#33B885',
                                lineHeight: 1.2,
                                display: 'flex',
                                alignItems: 'center',
                                minWidth: '40px',
                            }}
                        >
                            05
                        </Box>
                        <Box sx={{ paddingTop: '6px' }}>
                            <Typography
                                variant="body1"
                                sx={{ color: '#41505D', lineHeight: 1.6, fontSize: '13px', fontWeight: 500 }}
                            >
                                병합된 통합 정산 데이터를 기간별로 조회할 수 있이며 다운로드하여 보관할 수 있습니다.
                            </Typography>
                        </Box>
                    </Box>
                    <Box
                        sx={{
                            width: '100%',
                            height: 'auto',
                            position: 'relative',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            mb: 5,
                        }}
                    >
                        {/* 이미지는 실제 경로로 대체해야 합니다 */}
                        <div
                            style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Image
                                src="/images/guide/guide5.png"
                                alt="데이터 조회 및 다운로드 화면 이미지"
                                width={1000}
                                height={1000}
                            />
                        </div>
                    </Box>
                </Grid>
            </Grid>
        </Container>
    );
}
