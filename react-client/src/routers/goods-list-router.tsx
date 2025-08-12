import { useState, useEffect } from 'react';
import { useForm, FieldValues, UseFormRegister, FormState, UseFormSetValue, Control } from 'react-hook-form';
import axios, { AxiosError } from 'axios';
import { useDarkMode } from '../contexts/DarkModeContext';
import Navbar from '../components/Navbar';
import DarkButton from '../components/DarkButton';
import { GoodsFormFields } from '../components/GoodsFormFields';
import { CloseIcon, InspectIcon } from '../components/Icons';
import { Goods } from '../types/goods';
import { GoodsCard } from '../components/GoodsCards';
import { SkeletonCard } from '../components/SkeletonCard';
import { useNavigate } from 'react-router-dom';



// --- 상품 수정 모달 컴포넌트 ---
const GoodsEditModal = ({ goods, isOpen, onClose, onUpdateSuccess }: { goods: Goods | null, isOpen: boolean, onClose: () => void, onUpdateSuccess: () => void }) => {
    const { register, handleSubmit, watch, setValue, getValues, reset, formState: { errors }, control } = useForm<FieldValues>();
    const [isInspecting, setIsInspecting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    
    const [representativeImagePreview, setRepresentativeImagePreview] = useState<string | null>(null);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    
    const [detailContentType, setDetailContentType] = useState<'file' | 'html'>('file');
    
    const [inspectionResult, setInspectionResult] = useState<{ approved: boolean, reason: string } | null>(null);
    const navigate = useNavigate();

    const { isDarkMode } = useDarkMode();
    const proxyUrl = "/api";

    useEffect(() => {
        if (goods && isOpen) {
            const allFiles = goods.files || [];
            const repImage = allFiles.find(file => file.representativeYn === true);
            const detailItems = allFiles.filter(file => file.representativeYn !== true);
            const htmlItem = detailItems.find(file => file.fileType === '2');

            reset({
                goodsName: goods.goodsName,
                mobileGoodsName: goods.mobileGoodsName,
                origin: goods.origin,
                salesPrice: goods.salesPrice,
                buyPrice: goods.buyPrice,
                representativeImageFile: null,
                imageFile: null,
                imageHtml: htmlItem ? htmlItem.fileName || '' : '',
            });

            setRepresentativeImagePreview(repImage && repImage.filePath ? `${proxyUrl}${repImage.filePath}` : null);

            if (htmlItem) {
                setDetailContentType('html');
                setImagePreviews([]); 
            } else {
                setDetailContentType('file');
                const detailImageFiles = detailItems.filter(file => file.filePath && file.filePath.trim() !== '');
                setImagePreviews(detailImageFiles.map(file => `${proxyUrl}${file.filePath}`));
            }

        } else {
            reset({});
            setRepresentativeImagePreview(null);
            setImagePreviews([]);
            setInspectionResult(null);
            setDetailContentType('file');
        }
    }, [goods, isOpen, reset, proxyUrl]);
    
    const representativeImageFile = watch('representativeImageFile');
    const imageFile = watch('imageFile');

    useEffect(() => {
        if (representativeImageFile && representativeImageFile.length > 0) {
            const newPreview = URL.createObjectURL(representativeImageFile[0] as Blob);
            setRepresentativeImagePreview(newPreview);
            return () => URL.revokeObjectURL(newPreview);
        }
    }, [representativeImageFile]);

    useEffect(() => {
        if (imageFile && imageFile.length > 0) {
            const newPreviews = Array.from(imageFile).map(file => URL.createObjectURL(file as Blob));
            setImagePreviews(newPreviews);
            setDetailContentType('file');
            return () => newPreviews.forEach(url => URL.revokeObjectURL(url));
        }
    }, [imageFile]);

    const onUpdate = async (data: FieldValues) => {
        if (!goods) return;
        
        if (inspectionResult === null) {
            if (!window.confirm('AI 상품 검수를 진행하지 않았습니다. 그대로 수정하시겠습니까?')) {
                return;
            }
        }
        
        const { goodsName, mobileGoodsName, salesPrice, buyPrice, origin, representativeImageFile, imageFile, imageHtml } = data;

        const formData = new FormData();
        formData.append('goodsId', String(goods.goodsId));
        formData.append('goodsName', goodsName);
        formData.append('mobileGoodsName', mobileGoodsName);
        formData.append('salesPrice', String(salesPrice));
        formData.append('buyPrice', String(buyPrice));
        formData.append('origin', origin);

        if (representativeImageFile && representativeImageFile.length > 0) {
            formData.append('representativeFile', representativeImageFile[0]);
        }

        // 상세 이미지 타입에 따라 데이터와 imageType을 명확하게 설정
        if (detailContentType === 'file' && imageFile && imageFile.length > 0) {
            for (let i = 0; i < imageFile.length; i++) {
                formData.append('files', imageFile[i]); // 서버와 통신하는 필드명 통일 (예: imageFiles)
            }
            formData.append('imageType', 'file'); // 파일일 경우
        } else {
            formData.append('imageHtml', imageHtml);
            formData.append('imageType', 'html'); // HTML일 경우
        }

        setIsUpdating(true);
        try {
            const response = await axios.put(`${proxyUrl}/goods/update`, formData, { withCredentials: true });
            if (response.data.success) {
                alert('상품이 성공적으로 수정되었습니다.');
                onUpdateSuccess();
                onClose();
            } else {
                alert(response.data.message || '수정에 실패했습니다.');
            }
        } catch (error) {
            console.error(error);
            const axiosError = error as AxiosError<any>;
            alert(axiosError.response?.data?.message || "수정 중 오류가 발생했습니다.");
        } finally {
            setIsUpdating(false);
        }
    };
    
    const handleDelete = async () => {
        if (!goods) return;
        if (window.confirm(`정말로 이 상품(ID: ${goods.goodsId})을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
            setIsDeleting(true);
            try {
                const response = await axios.delete(`${proxyUrl}/goods/${goods.goodsId}`, { withCredentials: true });
                if (response.status === 200 || response.status === 204) {
                    alert('상품이 성공적으로 삭제되었습니다.');
                    onUpdateSuccess();
                    onClose();
                } else {
                    alert('삭제에 실패했습니다.');
                }
            } catch (error) {
                console.error("삭제 중 오류 발생:", error);
                const axiosError = error as AxiosError<any>;
                alert(axiosError.response?.data?.message || "삭제 중 오류가 발생했습니다.");
            } finally {
                setIsDeleting(false);
            }
        }
    };

    const onInspect = async () => {
        if (!goods) return;
        const data = getValues();
        const { goodsName, mobileGoodsName, salesPrice, buyPrice, origin, representativeImageFile,imageFile, imageHtml } = data;
        
        // if (!imageFile || imageFile.length === 0) {
        //     alert('AI 검수를 위해 이미지를 먼저 등록해주세요.');
        //     return;
        // }

        const formData = new FormData();
        formData.append('goodsId', String(goods.goodsId));
        formData.append('goodsName', goodsName);
        formData.append('mobileGoodsName', mobileGoodsName);
        formData.append('salesPrice', salesPrice);
        formData.append('buyPrice', buyPrice);
        formData.append('origin', origin);
        formData.append('isFileNew', 'false');

        if (representativeImageFile && representativeImageFile.length > 0) {
            formData.append('representativeFile', representativeImageFile[0]);
        }

        // 새로운 상세 이미지 파일이 업로드 되었을 경우
        if (imageFile && imageFile.length > 0) {
            formData.append('imageType', 'file');
            for (let i = 0; i < imageFile.length; i++) {
                formData.append('files', imageFile[i]);
            }
        } else {
            formData.append('imageType', 'html');
            formData.append('imageHtml', imageHtml || ''); // imageHtml 값을 추가
        }
        
        setIsInspecting(true);
        setInspectionResult(null);

        try {
            const response = await axios.post(`${proxyUrl}/goods/inspect`, formData, { withCredentials: true });
            if (response.data.success) {
                const result = response.data.data; // [추가] 결과를 변수에 저장
                setInspectionResult(result);
                // [추가] 상품 등록 페이지와 동일하게 alert으로 검수 결과 표시
                alert(`AI 검수 결과: ${result.approved ? '승인' : '반려'}\n사유: ${result.reason}`);
            } else {
                alert(response.data.message || '검수에 실패했습니다.');
            }
        } catch (error) {
            const axiosError = error as AxiosError<any>;
            if (axiosError.response?.data?.message) {
                const errorMessage = `오류: ${axiosError.response.data.message}`;
                setInspectionResult({ approved: false, reason: axiosError.response.data.message });
                alert(errorMessage);
            } else {
                console.error('검수 중 에러 발생:', error);
                alert('검수 중 알 수 없는 오류가 발생했습니다.');
            }
        } finally {
            setIsInspecting(false);
        }
    };

    const handleNavigateToDetail = () => {
        if (goods) {
            navigate(`/goods/detail/${goods.goodsId}`);
            onClose(); // 상세 페이지로 이동 후 모달은 닫기
        }
    };

    if (!isOpen) {
        return null;
    }

    // 로딩 및 비활성화 상태를 나타내는 변수
    const isProcessing = isInspecting || isUpdating || isDeleting;    

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center p-4 overflow-y-auto" onClick={onClose}>
            <div 
                className={`w-full max-w-4xl rounded-2xl shadow-xl grid grid-rows-[auto_1fr_auto] overflow-hidden max-h-[90vh] ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <header className="px-8 py-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h3 className={`text-2xl font-bold leading-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        상품 수정 (ID: {goods?.goodsId})
                    </h3>
                    <button onClick={onClose} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'}`}>
                        <CloseIcon />
                    </button>
                </header>
                
                <main className="overflow-y-auto p-8" style={{ maxHeight: 'calc(90vh - 192px)' }}>
                    <form id="goods-edit-form" onSubmit={handleSubmit(onUpdate)}>
                        <GoodsFormFields 
                            register={register}
                            errors={errors}
                            isDarkMode={isDarkMode}
                            imagePreviews={imagePreviews}
                            representativeImagePreview={representativeImagePreview}
                            setValue={setValue}
                            control={control}
                            detailContentType={detailContentType}
                            setDetailContentType={setDetailContentType}
                        />
                    </form>
                    {inspectionResult && (
                        <div className={`mt-6 p-4 rounded-lg flex items-start ${inspectionResult.approved ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50'}`}>
                            <div className={`flex-shrink-0 text-2xl ${inspectionResult.approved ? 'text-green-500' : 'text-red-500'}`}>{inspectionResult.approved ? '✅' : '❌'}</div>
                            <div className="ml-3">
                                <h4 className={`font-semibold ${inspectionResult.approved ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>AI 검수 결과</h4>
                                <p className={`mt-1 text-sm ${inspectionResult.approved ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>{inspectionResult.reason}</p>
                            </div>
                        </div>
                    )}
                </main>

                <footer className="px-8 py-6 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center gap-4">
                    {/* 왼쪽: 삭제 버튼 */}
                    <div>
                        <button 
                            type="button" 
                            onClick={handleDelete}
                            disabled={isProcessing}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors
                                        text-red-600 bg-red-100 hover:bg-red-200 
                                        dark:text-red-400 dark:bg-red-900/50 dark:hover:bg-red-900
                                        disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {isDeleting ? '삭제 중...' : '삭제'}
                        </button>
                    </div>

                    {/* 오른쪽: 나머지 버튼 그룹 */}
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={handleNavigateToDetail}
                            disabled={isProcessing}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors
                                        text-gray-700 bg-gray-100 hover:bg-gray-200 
                                        dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600
                                        disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            상품 상세
                        </button>
                        <button
                            type="button"
                            onClick={onInspect}
                            disabled={isProcessing}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors
                                        text-gray-700 bg-gray-100 hover:bg-gray-200 
                                        dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600
                                        disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {isInspecting ? '검수 중...' : 'AI 검수'}
                        </button>
                        <button
                            type="submit"
                            form="goods-edit-form"
                            disabled={isProcessing}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors
                                        text-white bg-blue-600 hover:bg-blue-700
                                        dark:bg-blue-500 dark:hover:bg-blue-600
                                        disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {isUpdating ? '수정 중...' : '수정하기'}
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};

// --- 상품 목록 페이지 컴포넌트 ---
export const GoodsListRouter = () => {
    const [goodsList, setGoodsList] = useState<Goods[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedGoods, setSelectedGoods] = useState<Goods | null>(null);
    const { isDarkMode } = useDarkMode();

    const fetchGoods = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get("/api/goods/list", { withCredentials: true });
            if (response.data.success) {
                setGoodsList(response.data.data);
            } else {
                setGoodsList([]);
            }
        } catch (error) {
            console.error('상품 목록 요청 중 에러 발생:', error);
            setGoodsList([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchGoods();
    }, []);

    const handleEditClick = (goods: Goods) => {
        setSelectedGoods(goods);
        setIsModalOpen(true);
    };
    
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedGoods(null);
    };

    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isModalOpen]);

    return (
        <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-gray-300' : 'bg-gray-50 text-gray-800'}`}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center">
                    <Navbar isDarkMode={isDarkMode} />
                    <DarkButton />
                </div>
                <header className="text-center my-8">
                    <h1 className={`text-4xl font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>상품 목록</h1>
                    <p className={`mt-2 text-md ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>등록된 전체 상품을 확인하세요.</p>
                </header>
                <main>
                    {isLoading ? (
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                             {Array.from({ length: 8 }).map((_, index) => (
                                 <SkeletonCard key={index} isDarkMode />
                             ))}
                         </div>
                    ) : goodsList.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {goodsList.map((goods) => (
                                <GoodsCard key={goods.goodsId} goods={goods} onEdit={() => handleEditClick(goods)} isDarkMode={isDarkMode} />
                            ))}
                        </div>
                    ) : (
                         <div className={`text-center py-24 rounded-2xl shadow-sm border border-dashed ${isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-300'}`}>
                             <svg className="mx-auto h-16 w-16 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                 <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c.51 0 .962-.343 1.087-.835l1.838-6.837a1.875 1.875 0 00-1.087-2.162H5.25l-.321-1.203a.75.75 0 00-.75-.621H2.25M16.5 18.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM8.25 18.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                             </svg>
                             <h3 className={`mt-4 text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>등록된 상품이 없습니다</h3>
                             <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>첫 상품을 등록하여 판매를 시작해보세요.</p>
                         </div>
                    )}
                </main>
            </div>
            
            <GoodsEditModal 
                isOpen={isModalOpen}
                onClose={closeModal}
                goods={selectedGoods}
                onUpdateSuccess={fetchGoods}
            />
        </div>
    );
};
