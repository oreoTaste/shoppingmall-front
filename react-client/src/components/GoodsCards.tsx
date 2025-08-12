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

    // 이미지 또는 HTML 콘텐츠를 렌더링하는 컴포넌트
    const ImageRenderer = () => {
        // 1. fileType이 '1'인 파일을 먼저 찾습니다.
        let targetFile: FileInfo | undefined = goods.files?.find(file => file.fileType === '1');

        // 2. fileType이 '1'인 파일이 없으면, 배열의 첫 번째 파일을 사용합니다.
        if (!targetFile && goods.files?.length > 0) {
            targetFile = goods.files[0];
        }

        // 3. 렌더링할 파일이 결정된 경우
        if (targetFile) {
            // 3-1. filePath가 있는 경우: 일반 이미지 렌더링
            if (targetFile.filePath) {
                const imageUrl = `${proxyUrl}${targetFile.filePath}`;
                return (
                    <img
                        src={imageUrl}
                        alt={goods.goodsName}
                        className="w-full h-52 object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => { e.currentTarget.src = `https://placehold.co/600x400/${isDarkMode ? '2D3748' : 'E2E8F0'}/${isDarkMode ? 'E2E8F0' : '4A5568'}?text=Image Error&font=sans`; }}
                    />
                );
            }

            // 3-2. fileName에 HTML 콘텐츠가 있는 경우: HTML 직접 렌더링
            if (targetFile.fileName) {
                return (
                    <div
                        className="w-full h-52 [&>img]:w-full [&>img]:h-full [&>img]:object-cover transition-transform duration-300 group-hover:[&>img]:scale-110"
                        dangerouslySetInnerHTML={{ __html: targetFile.fileName }}
                    />
                );
            }
        }

        // 4. 표시할 파일이 전혀 없는 경우: 플레이스홀더 이미지 렌더링
        const placeholderUrl = `https://placehold.co/600x400/${isDarkMode ? '2D3748' : 'E2E8F0'}/${isDarkMode ? 'E2E8F0' : '4A5568'}?text=${encodeURI(goods.goodsName)}&font=sans`;
        return (
            <img
                src={placeholderUrl}
                alt={goods.goodsName}
                className="w-full h-52 object-cover"
            />
        );
    };

    return (
        <div
            onClick={onEdit}
            className={`group cursor-pointer rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 ease-in-out ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
        >
            <div className="relative overflow-hidden rounded-t-2xl">
                <ImageRenderer />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0"></div>
                <h3 className="absolute bottom-4 left-4 text-white text-xl font-bold truncate pr-4">{goods.goodsName}</h3>
            </div>
            <div className="p-5">
                <div className="flex justify-between items-center">
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {new Date(goods.insertAt).toLocaleDateString('ko-KR')} 등록
                    </p>
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