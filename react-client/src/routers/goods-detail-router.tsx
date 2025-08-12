// src/pages/GoodsDetailPage.tsx (새로운 파일)

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import { useDarkMode } from '../contexts/DarkModeContext';
import { FileInfo, Goods } from '../types/goods'; // 기존 Goods 타입을 재사용합니다.

export const GoodsDetailPage = () => {
    const { goodsId } = useParams<{ goodsId: string }>();
    const navigate = useNavigate();
    const { isDarkMode } = useDarkMode();
    const proxyUrl = "/api";

    const [goods, setGoods] = useState<Goods | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- [추가된 부분] ---
    // 대표 사진, 상세 이미지, 상세 HTML을 분리하여 관리하기 위한 상태
    const [representativeImage, setRepresentativeImage] = useState<FileInfo | null>(null);
    const [detailImages, setDetailImages] = useState<FileInfo[]>([]);
    const [detailHtml, setDetailHtml] = useState<string | null>(null);

    useEffect(() => {
        const fetchGoodsDetail = async () => {
            if (!goodsId) {
                setError('상품 ID가 없습니다.');
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            try {
                const response = await axios.get(`${proxyUrl}/goods/${goodsId}`, { withCredentials: true });
                if (response.data.success) {
                    const fetchedGoods: Goods = response.data.data;
                    setGoods(fetchedGoods);

                    // --- [핵심 수정] ---
                    // API 응답을 받은 후, 데이터를 종류별로 분리하여 상태에 저장합니다.
                    const allFiles = fetchedGoods.files || [];

                    // 1. 대표 사진 분리
                    const repImage = allFiles.find(file => file.representativeYn === true);
                    setRepresentativeImage(repImage || null);

                    // 2. 상세 정보 분리
                    const detailItems = allFiles.filter(file => file.representativeYn !== true);
                    
                    // 2-1. 상세 정보가 HTML인 경우 (fileType: '2')
                    const htmlItem = detailItems.find(file => file.fileType === '2');
                    if (htmlItem) {
                        setDetailHtml(htmlItem.fileName);
                        setDetailImages([]); // HTML이 있으면 상세 이미지는 비웁니다.
                    } else {
                    // 2-2. 상세 정보가 이미지 파일인 경우
                        // 파일명을 기준으로 자연어 정렬을 적용합니다.
                        const sortedImages = detailItems.sort((a, b) => 
                            a.fileName.localeCompare(b.fileName, undefined, { numeric: true, sensitivity: 'base' })
                        );
                        setDetailImages(sortedImages);
                        setDetailHtml(null); // 이미지 파일이 있으면 HTML은 비웁니다.
                    }

                } else {
                    setError(response.data.message || '상품 정보를 불러오는데 실패했습니다.');
                }
            } catch (err) {
                console.error('상품 상세 정보 요청 중 에러 발생:', err);
                const axiosError = err as AxiosError<any>;
                setError(axiosError.response?.data?.message || '상품 정보를 불러오는 중 오류가 발생했습니다.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchGoodsDetail();
    }, [goodsId, proxyUrl]);


    if (isLoading) {
        return (
            <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="max-w-4xl mx-auto">
                    <div className="w-full h-96 bg-gray-300 dark:bg-gray-700 animate-pulse rounded-lg mb-8"></div>
                    <div className="space-y-4">
                        <div className="w-full h-64 bg-gray-300 dark:bg-gray-700 animate-pulse rounded-lg"></div>
                        <div className="w-full h-64 bg-gray-300 dark:bg-gray-700 animate-pulse rounded-lg"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`min-h-screen flex flex-col items-center justify-center p-8 ${isDarkMode ? 'bg-gray-900 text-red-400' : 'bg-gray-50 text-red-600'}`}>
                <h1 className="text-3xl font-bold mb-4">오류 발생</h1>
                <p>{error}</p>
                <button onClick={() => navigate(-1)} className="mt-8 px-4 py-2 bg-blue-600 text-white rounded-lg">뒤로 가기</button>
            </div>
        );
    }
    
    return (
        <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-gray-300' : 'bg-white text-gray-800'}`}>
            <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
                <header className="mb-8 text-center relative">
                    <button onClick={() => navigate(-1)} className={`absolute top-1/2 left-0 -translate-y-1/2 px-4 py-2 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}>
                        ← 뒤로
                    </button>
                    <h1 className="text-4xl font-extrabold tracking-tight">{goods?.goodsName}</h1>
                </header>

                <main>
                    {/* 1. 대표 사진 렌더링 */}
                    {representativeImage && (
                        <div className="mb-12">
                             <h2 className="text-2xl font-bold text-center mb-4 border-b pb-2 dark:border-gray-700">대표 이미지</h2>
                             <img
                                src={`${proxyUrl}${representativeImage.filePath}`}
                                alt={representativeImage.fileName}
                                className="w-full h-auto rounded-lg shadow-lg"
                            />
                        </div>
                    )}

                    {/* 2. 상세 정보 렌더링 */}
                    <div>
                        <h2 className="text-2xl font-bold text-center mb-4 border-b pb-2 dark:border-gray-700">상품 상세 정보</h2>
                        <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg shadow-inner">
                            {/* 2-1. 상세 HTML이 있을 경우 */}
                            {detailHtml && (
                                <div dangerouslySetInnerHTML={{ __html: detailHtml }} />
                            )}
                            {/* 2-2. 상세 이미지들이 있을 경우 */}
                            {detailImages.length > 0 && (
                                <div className="flex flex-col">
                                    {detailImages.map((file) => (
                                        <img
                                            key={file.filesId}
                                            src={`${proxyUrl}${file.filePath}`}
                                            alt={file.fileName}
                                            className="w-full h-auto block"
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};