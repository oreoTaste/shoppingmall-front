import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../contexts/DarkModeContext';
import Navbar from '../components/Navbar';

interface Goods {
    id: number;
    goodsName: string;
    price: number;
    description: string;
    createdAt: string;
}

export const GoodsListRouter = () => {
    const navigate = useNavigate();
    const [goodsList, setGoodsList] = useState<Goods[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { isDarkMode } = useDarkMode();

    useEffect(() => {
        const fetchGoods = async () => {
            const url = `/goods/list`; // 상품 목록 조회 API 엔드포인트
            setIsLoading(true);
            try {
                const response = await axios.get(url, {
                    withCredentials: true,
                    headers: { "X-API-Request": "true" }
                });
                
                if (response.data.success) {
                    setGoodsList(response.data.data); // API 응답 구조에 따라 data 필드를 사용
                } else {
                    alert('상품 목록을 불러오는데 실패했습니다.');
                }
            } catch (error) {
                console.error('상품 목록 요청 중 에러 발생:', error);
                // API 연동 전, 또는 에러 발생 시 UI 확인을 위한 목업 데이터
                setGoodsList([
                    { id: 1, goodsName: '멋진 신발 (예시)', price: 120000, description: '아주 멋진 신발입니다.', createdAt: new Date().toISOString() },
                    { id: 2, goodsName: '편한 티셔츠 (예시)', price: 45000, description: '정말 편해요.', createdAt: new Date().toISOString() },
                ]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchGoods();
    }, []);

    const handleRowClick = (goodsId: number) => {
        // 상세 페이지가 있다면 아래와 같이 이동시킬 수 있습니다.
        // navigate(`/goods/detail/${goodsId}`);
        alert(`상품 ID: ${goodsId} 클릭 (상세 페이지로 이동 가능)`);
    };

    if(isLoading) {
        return (
            <div className="text-center py-10">상품 목록을 불러오는 중입니다...</div>
        );
    }

    return (
        <div className={`p-8 rounded-lg shadow-lg max-w-6xl w-full mx-auto mt-10
            ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
            <Navbar isDarkMode={isDarkMode} />
            <div className="overflow-x-auto">
                <table className={`min-w-full text-lg`}>
                    <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <tr>
                            <th scope="col" className="px-6 py-4 text-left font-medium tracking-wider">상품명</th>
                            <th scope="col" className="px-6 py-4 text-left font-medium tracking-wider">가격</th>
                            <th scope="col" className="px-6 py-4 text-left font-medium tracking-wider">등록일</th>
                        </tr>
                    </thead>
                    <tbody className={`divide-y ${isDarkMode ? 'divide-gray-600' : 'divide-gray-200'}`}>
                        {goodsList.map((goods) => (
                            <tr key={goods.id} onClick={() => handleRowClick(goods.id)} 
                                className={`cursor-pointer transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                                <td className="px-6 py-4 whitespace-nowrap">{goods.goodsName}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{goods.price.toLocaleString()}원</td>
                                <td className="px-6 py-4 whitespace-nowrap">{new Date(goods.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                    {goodsList.length === 0 && !isLoading && (
                    <div className={`text-center py-10 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        등록된 상품이 없습니다.
                    </div>
                )}
            </div>
        </div>
    );
};