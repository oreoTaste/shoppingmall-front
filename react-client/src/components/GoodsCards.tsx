import { Goods } from "../types/goods";

export const GoodsCard = ({ goods, onEdit, isDarkMode }: { goods: Goods, onEdit: () => void, isDarkMode: boolean }) => {
    const proxyUrl = "/api";
    
    const imageUrl = goods.files && goods.files.length > 0
        ? `${proxyUrl}${goods.files[0].filePath}`
        : `https://placehold.co/600x400/${isDarkMode ? '2D3748' : 'E2E8F0'}/${isDarkMode ? 'E2E8F0' : '4A5568'}?text=${encodeURI(goods.goodsName)}&font=sans`;

    // [추가] AI 검수 상태에 따른 배지 스타일을 정의합니다.
    const aiCheckBadge = {
        text: goods.aiCheckYn === 'Y' ? 'AI 검수 완료' : '검수 미완료',
        className: goods.aiCheckYn === 'Y'
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    };

    return (
        <div 
            onClick={onEdit}
            className={`group cursor-pointer rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 ease-in-out ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
        >
            <div className="relative overflow-hidden rounded-t-2xl">
                <img 
                    src={imageUrl} 
                    alt={goods.goodsName} 
                    className="w-full h-52 object-cover transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => { e.currentTarget.src = `https://placehold.co/600x400/${isDarkMode ? '2D3748' : 'E2E8F0'}/${isDarkMode ? 'E2E8F0' : '4A5568'}?text=Image Error&font=sans`; }} // 이미지 로드 실패 시
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0"></div>
                <h3 className="absolute bottom-4 left-4 text-white text-xl font-bold truncate pr-4">{goods.goodsName}</h3>
            </div>
            <div className="p-5">
                <div className="flex justify-between items-center">
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {new Date(goods.insertAt).toLocaleDateString('ko-KR')} 등록
                    </p>
                    {/* [수정] 기존 "판매중" 배지를 AI 검수 상태 배지로 교체합니다. */}
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${aiCheckBadge.className}`}>
                        {aiCheckBadge.text}
                    </span>
                </div>
                <p className={`mt-4 text-2xl font-extrabold text-right ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {goods.salesPrice.toLocaleString()}원
                </p>
            </div>
        </div>
    );
};