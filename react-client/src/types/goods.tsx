// types/goods.ts
export interface Goods {
    goodsId: number; // 상품의 고유 ID (BIGSERIAL)
    goodsName: string; // 상품명
    mobileGoodsName: string; // 모바일용 상품명
    salesPrice: number; // 판매 가격
    buyPrice: number; // 구매 가격
    origin: string;
    insertAt: string; // 생성일시 (CommonEntity로부터 상속)
    files: FileInfo[];
    aiCheckYn: string; // AI 검수 여부 (Y, N)
    // CommonEntity의 다른 필드 (insertId, modifiedAt, updateId)는 필요에 따라 추가
    // CommonEntity의 다른 필드 (insertId, modifiedAt, updateId)는 필요에 따라 추가
}

interface FileInfo {
    filesId: number; // 파일의 고유 ID (BIGSERIAL)
    filePath: string;
    fileName: string;
    goodsId: number;
}