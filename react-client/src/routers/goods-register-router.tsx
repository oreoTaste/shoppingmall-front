import { useState, useEffect, ChangeEvent } from 'react';
import { useForm, FieldValues, FieldError } from 'react-hook-form';
import axios, { AxiosError } from 'axios';
import { useDarkMode } from '../contexts/DarkModeContext';
import Navbar from '../components/Navbar';
import DarkButton from '../components/DarkButton';
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { InspectIcon, UploadIcon } from '../components/Icons';
import { GoodsFormFields } from '../components/GoodsFormFields'; 

// --- 메인 페이지 컴포넌트 ---
export const GoodsRegisterRouter = () => {
    const { register, handleSubmit, watch, setValue, getValues, formState: { errors }, control } = useForm<FieldValues>({
        mode: 'onChange'
    });
    
    const [isInspecting, setIsInspecting] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [representativeImagePreview, setRepresentativeImagePreview] = useState<string | null>(null);

    const [detailContentType, setDetailContentType] = useState<'file' | 'html'>('file');

    const [inspectionResult, setInspectionResult] = useState<{approved: boolean, reason: string} | null>(null);

    const { isDarkMode } = useDarkMode();
    const { user } = useUser();
    const proxyUrl = "/api";
    const navigate = useNavigate();

    const representativeImageFile = watch('representativeImageFile');
    const imageFiles = watch('imageFile');

    // 대표사진 미리보기를 위한 useEffect
    useEffect(() => {
        if (representativeImageFile && representativeImageFile.length > 0) {
            const file = representativeImageFile[0];
            const newPreview = URL.createObjectURL(file as Blob);
            setRepresentativeImagePreview(newPreview);

            return () => URL.revokeObjectURL(newPreview);
        } else {
            setRepresentativeImagePreview(null);
        }
    }, [representativeImageFile]);

    // 상세사진 미리보기를 위한 useEffect
    useEffect(() => {
        if (imageFiles && imageFiles.length > 0) {
            const newPreviews = Array.from(imageFiles).map(file => URL.createObjectURL(file as Blob));
            setImagePreviews(newPreviews);
            
            return () => newPreviews.forEach(url => URL.revokeObjectURL(url));
        } else {
            setImagePreviews([]);
        }
    }, [imageFiles]);
    
    // 관리자 아니면 리스트 페이지로 리다이렉트
    if(user && user.adminYn !== "Y") {
        navigate("/goods/list");
        return null;
    }

    // AI 상품 검수 버튼 핸들러
    const onInspect = async () => {
        const data = getValues();
        // [수정 1] representativeImageFile을 함께 가져옵니다.
        const { goodsName, mobileGoodsName, salesPrice, buyPrice, origin, representativeImageFile, imageFile, imageHtml } = data;
        
        // [수정 2] 대표 이미지가 있는지 먼저 확인합니다.
        if (!representativeImageFile || representativeImageFile.length === 0) {
            alert('AI 검수를 위해 대표 이미지를 먼저 등록해주세요.');
            return;
        }

        if (detailContentType === 'html' && !imageHtml) {
            alert('AI 검수를 위해 HTML 태그를 입력해주세요.');
            return;
        }
        if (detailContentType === 'file' && (!imageFile || imageFile.length === 0)) {
            alert('AI 검수를 위해 상세 이미지 파일을 등록해주세요.');
            return;
        }

        const formData = new FormData();
        formData.append('goodsName', goodsName);
        formData.append('mobileGoodsName', mobileGoodsName);
        formData.append('salesPrice', String(salesPrice));
        formData.append('buyPrice', String(buyPrice));
        formData.append('origin', origin);
        formData.append('isFileNew', 'true');

        // [수정 3] FormData에 대표 이미지 파일을 추가합니다.
        // 백엔드에서 받을 이름('representativeFile')과 일치해야 합니다.
        formData.append('representativeFile', representativeImageFile[0]);

        if (detailContentType === 'html') {
            formData.append('imageHtml', imageHtml);
            formData.append('imageType', 'html');
        } else if (imageFile && imageFile.length > 0) {
            for (let i = 0; i < imageFile.length; i++) {
                formData.append('files', imageFile[i]);
            }
            formData.append('imageType', 'file');
        }

        setIsInspecting(true);
        setInspectionResult(null);

        try {
            const response = await axios.post(`${proxyUrl}/goods/inspect`, formData, { withCredentials: true });
            if (response.data.success) {
                const result = response.data.data;
                setInspectionResult(result);
                alert(`AI 검수 결과: ${result.approved ? '승인' : '반려'}\n사유: ${result.reason}`);
            } else {
                alert(response.data.message || '검수에 실패했습니다.');
            }
        } catch (error) {
            const axiosError = error as AxiosError<any>;
            const errorMessage = axiosError.response?.data?.message || '검수 중 알 수 없는 오류가 발생했습니다.';
            setInspectionResult({ approved: false, reason: errorMessage });
            alert(errorMessage);
        } finally {
            setIsInspecting(false);
        }
    };

    // 상품 등록 버튼 (form의 onSubmit) 핸들러
    const onRegister = async (data: FieldValues) => {
        if (!data.representativeImageFile || data.representativeImageFile.length === 0) {
            alert('상품 대표사진은 필수 항목입니다.');
            return;
        }

        if (inspectionResult === null) {
            if (!window.confirm('AI 상품 검수를 진행하지 않았습니다. 그대로 등록하시겠습니까?')) {
                return;
            }
        }

        const { goodsName, mobileGoodsName, salesPrice, buyPrice, origin, representativeImageFile, imageFile, imageHtml } = data;

        const formData = new FormData();
        formData.append('goodsName', goodsName);
        formData.append('mobileGoodsName', mobileGoodsName);
        formData.append('salesPrice', String(salesPrice));
        formData.append('buyPrice', String(buyPrice));
        formData.append('origin', origin);
        
        const aiCheckYn = inspectionResult ? 'Y' : 'N';
        formData.append('aiCheckYn', aiCheckYn);

        // 1. 대표사진 (필수)
        formData.append('representativeFile', representativeImageFile[0]);

        // 2. 상세사진 (선택) - [수정] 탭 상태에 따라 분기 처리
        if (detailContentType === 'html' && imageHtml) {
            formData.append('imageHtml', imageHtml);
            formData.append('imageType', 'html');
        } else if (detailContentType === 'file' && imageFile && imageFile.length > 0) {
            for (let i = 0; i < imageFile.length; i++) {
                formData.append('files', imageFile[i]);
            }
            formData.append('imageType', 'file');
        }

        setIsRegistering(true);
        try {
            const response = await axios.post(`${proxyUrl}/goods/register`, formData, {
                withCredentials: true,
            });

            if (response.data.success) {
                alert('상품이 성공적으로 등록되었습니다.');
                navigate('/goods/list');
            } else {
                alert(response.data.message || '등록에 실패했습니다.');
            }
        } catch (error) {
            const axiosError = error as AxiosError<any>;
            alert(axiosError.response?.data?.message || '등록 중 알 수 없는 오류가 발생했습니다.');
        } finally {
            setIsRegistering(false);
        }
    };

    return (
        <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center">
                    <Navbar isDarkMode={isDarkMode} />
                    <DarkButton />
                </div>

                <header className="text-center my-8">
                    <h1 className={`text-4xl font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>상품 등록</h1>
                    <p className={`mt-2 text-md ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>새로운 상품 정보를 입력하고, AI로 검수할 수 있습니다.</p>
                </header>

                <form onSubmit={handleSubmit(onRegister)} className={`max-w-4xl mx-auto p-8 rounded-2xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    
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
                    
                    {inspectionResult && (
                        <div className={`mt-6 p-4 rounded-lg flex items-start ${inspectionResult.approved ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50'}`}>
                            <div className={`flex-shrink-0 text-2xl ${inspectionResult.approved ? 'text-green-500' : 'text-red-500'}`}>{inspectionResult.approved ? '✅' : '❌'}</div>
                            <div className="ml-3">
                                <h4 className={`font-semibold ${inspectionResult.approved ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>AI 검수 결과 (상세사진)</h4>
                                <p className={`mt-1 text-sm ${inspectionResult.approved ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>{inspectionResult.reason}</p>
                            </div>
                        </div>
                    )}

                    <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6 flex justify-end items-center gap-4">
                        <button
                            type="button"
                            onClick={onInspect}
                            disabled={isInspecting || isRegistering}
                            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors
                                        text-gray-700 bg-gray-100 hover:bg-gray-200 
                                        dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600
                                        disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            <InspectIcon />
                            {isInspecting ? '검수 중...' : 'AI 검수'}
                        </button>
                        <button
                            type="submit"
                            disabled={isInspecting || isRegistering}
                            className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors
                                        text-white bg-blue-600 hover:bg-blue-700
                                        dark:bg-blue-500 dark:hover:bg-blue-600
                                        disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {isRegistering ? '저장 중...' : '상품 등록하기'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
