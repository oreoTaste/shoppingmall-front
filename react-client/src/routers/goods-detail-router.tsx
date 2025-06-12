// src/pages/GoodsDetailPage.tsx (새로운 파일)

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import { useDarkMode } from '../contexts/DarkModeContext';
import { Goods } from '../types/goods'; // 기존 Goods 타입을 재사용합니다.
import { SkeletonCard } from '../components/SkeletonCard'; // 로딩 스켈레톤 재사용

export const GoodsDetailPage = () => {
    const { goodsId } = useParams<{ goodsId: string }>();
    const navigate = useNavigate();
    const { isDarkMode } = useDarkMode();
    const proxyUrl = "/api";

    const [goods, setGoods] = useState<Goods | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchGoodsDetail = async () => {
            if (!goodsId) {
                setError('상품 ID가 없습니다.');
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            try {
                // 개별 상품 정보를 가져오는 API를 호출합니다. (이 API는 백엔드에 구현되어 있어야 합니다)
                // 예시: GET /api/goods/detail/{goodsId}
                const response = await axios.get(`${proxyUrl}/goods/${goodsId}`, { withCredentials: true });
                if (response.data.success) {
                    setGoods(response.data.data);
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

    // 파일 이름으로 이미지들을 자연어 순으로 정렬하는 함수
    const getSortedImageFiles = () => {
        if (!goods?.files) return [];
        return [...goods.files].sort((a, b) => 
            // '상세사진1', '상세사진2', '상세사진11' 같은 파일명을 올바르게 정렬
            a.fileName.localeCompare(b.fileName, undefined, { numeric: true, sensitivity: 'base' })
        );
    };

    if (isLoading) {
        return (
            <div className={`min-h-screen p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <h1 className="text-3xl font-bold text-center mb-8">로딩 중...</h1>
                <div className="max-w-3xl mx-auto">
                    <SkeletonCard isDarkMode={isDarkMode} />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`min-h-screen p-8 text-center ${isDarkMode ? 'bg-gray-900 text-red-400' : 'bg-gray-50 text-red-600'}`}>
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
                    <p className="mt-2 text-md text-gray-500">상품 상세 이미지</p>
                </header>

                <main className="bg-gray-200 dark:bg-gray-800 p-2 rounded-lg shadow-inner">
                    <div className="flex flex-col">
                        {getSortedImageFiles().map((file) => (
                            <img
                                key={file.filesId}
                                src={`${proxyUrl}${file.filePath}`}
                                alt={file.fileName}
                                className="w-full h-auto block" // 이미지 사이의 미세한 간격을 없애기 위해 block 처리
                            />
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
};