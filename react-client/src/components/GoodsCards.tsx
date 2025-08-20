import { Goods, FileInfo } from "../types/goods";

export const GoodsCard = ({ goods, onEdit, isDarkMode }: { goods: Goods, onEdit: () => void, isDarkMode: boolean }) => {
    const proxyUrl = "/api";

    // AI 검수 상태에 따른 배지 스타일
    const aiCheckBadge = {
        text: goods.aiCheckYn === 'Y' ? 'AI 검수 완료' : '검수 미완료',
        className: goods.aiCheckYn === 'Y'
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    };

    // 이미지 또는 HTML 콘텐츠를 렌더링하는 컴포넌트 (변경 없음)
    const ImageRenderer = () => {
        let targetFile: FileInfo | undefined = goods.files?.find(file => file.fileType === '1' && file.representativeYn);
        
        if (!targetFile) {
            targetFile = goods.files?.find(file => file.fileType === '1');
        }

        if (!targetFile && goods.files?.length > 0) {
            targetFile = goods.files[0];
        }

        if (targetFile) {
            if (targetFile.filePath) {
                const imageUrl = `${proxyUrl}${targetFile.filePath}`;
                return (
                    <img
                        src={imageUrl}
                        alt={goods.goodsName}
                        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => { e.currentTarget.src = `https://placehold.co/600x400/${isDarkMode ? '2D3748' : 'E2E8F0'}/${isDarkMode ? 'E2E8F0' : '4A5568'}?text=Image Error&font=sans`; }}
                    />
                );
            }
            if (targetFile.fileName) {
                return (
                    <div
                        className="w-full h-48 [&>img]:w-full [&>img]:h-full [&>img]:object-cover transition-transform duration-300 group-hover:[&>img]:scale-105"
                        dangerouslySetInnerHTML={{ __html: targetFile.fileName }}
                    />
                );
            }
        }
        const placeholderUrl = `https://placehold.co/600x400/${isDarkMode ? '2D3748' : 'E2E8F0'}/${isDarkMode ? 'E2E8F0' : '4A5568'}?text=${encodeURI(goods.goodsName)}&font=sans`;
        return (
            <img
                src={placeholderUrl}
                alt={goods.goodsName}
                className="w-full h-48 object-cover"
            />
        );
    };

    return (
        <div
            onClick={onEdit}
            className={`group flex flex-col cursor-pointer rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 ease-in-out overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
        >
            {/* === 1. 이미지 영역 === */}
            <div className="relative overflow-hidden">
                <ImageRenderer />
                {/* 이미지 위 그라데이션 효과는 제거하여 깔끔하게 만듭니다. */}
            </div>

            {/* === 2. 콘텐츠 영역: Flexbox Column으로 체계적인 레이아웃 구성 === */}
            <div className="p-4 flex flex-col flex-grow">
                
                {/* 상단 정보 그룹 */}
                <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        <span>{goods.lgroupName}</span>
                        {goods.mgroupName && <> &gt; <span>{goods.mgroupName}</span></>}
                    </p>
                    <h3 className={`mt-1 text-base font-bold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {goods.goodsName}
                    </h3>
                </div>

                {/* 중간 공백 (이 div가 남은 공간을 모두 차지하여 가격을 아래로 밀어냅니다) */}
                <div className="flex-grow" />

                {/* 하단 가격 및 상태 그룹 */}
                <div>
                    <p className={`text-2xl font-extrabold text-right mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {goods.salesPrice.toLocaleString()}원
                    </p>
                    <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                        <span className={`font-semibold px-2 py-0.5 rounded-full ${aiCheckBadge.className}`}>
                            {aiCheckBadge.text}
                        </span>
                        <span>
                            {new Date(goods.insertAt).toLocaleDateString('ko-KR')} 등록
                        </span>
                    </div>
                </div>

            </div>
        </div>
    );
};