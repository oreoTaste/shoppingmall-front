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
    imageHtml: string;
    representativeFile: FileInfo;
    // CommonEntity의 다른 필드 (insertId, modifiedAt, updateId)는 필요에 따라 추가
    // CommonEntity의 다른 필드 (insertId, modifiedAt, updateId)는 필요에 따라 추가
    lgroup: string; // 대분류
    lgroupName: string; // 대분류명
    mgroup: string; // 중분류
    mgroupName: string; // 중분류명
    sgroup: string; // 소분류
    sgroupName: string; // 소분류명
    dgroup: string; // 세분류
    dgroupName: string; // 세분류명
}

export interface FileInfo {
    filesId: number; // 파일의 고유 ID (BIGSERIAL)
    representativeYn: boolean; // 대표사진여부
    fileType: string;
    filePath: string;
    fileName: string;
    goodsId: number;
}