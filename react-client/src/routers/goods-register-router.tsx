import { useState, useEffect, ChangeEvent } from 'react';
import { useForm, FieldValues, FieldError } from 'react-hook-form';
import axios, { AxiosError } from 'axios';
import { useDarkMode } from '../contexts/DarkModeContext';
import Navbar from '../components/Navbar';
import DarkButton from '../components/DarkButton';
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { InspectIcon, UploadIcon } from '../components/Icons';
// [핵심] 분리된 폼 필드 컴포넌트를 import합니다.
import { GoodsFormFields } from '../components/GoodsFormFields'; 

// --- 메인 페이지 컴포넌트 ---
export const GoodsRegisterRouter = () => {
    // [수정] FormInput과 getErrorMessage 로직이 GoodsFormFields로 이동했으므로, 관련 없는 getValues를 제거합니다.
    const { register, handleSubmit, watch, setValue, getValues, formState: { errors } } = useForm<FieldValues>();
    const [isInspecting, setIsInspecting] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [inspectionResult, setInspectionResult] = useState<{approved: boolean, reason: string} | null>(null);

    const { isDarkMode } = useDarkMode();
    const { user } = useUser();
    const proxyUrl = "/api";
    const navigate = useNavigate();

    const imageFiles = watch('imageFile');

    useEffect(() => {
        if (imageFiles && imageFiles.length > 0) {
            const newPreviews = Array.from(imageFiles).map(file => URL.createObjectURL(file as Blob));
            setImagePreviews(newPreviews);
            
            return () => newPreviews.forEach(url => URL.revokeObjectURL(url));
        } else {
            setImagePreviews([]);
        }
    }, [imageFiles]);

    if(user && user.adminYn !== "Y") {
        navigate("/goods/list");
        return null;
    }

    // AI 상품 검수 버튼 핸들러
    const onInspect = async () => {
        const data = getValues();
        const { goodsName, mobileGoodsName, salesPrice, buyPrice, origin, imageFile } = data;
        
        const formData = new FormData();
        formData.append('goodsName', goodsName);
        formData.append('mobileGoodsName', mobileGoodsName);
        formData.append('salesPrice', salesPrice);
        formData.append('buyPrice', buyPrice);
        formData.append('origin', origin);
        formData.append('isFileNew', 'true');

        if (imageFile && imageFile.length > 0) {
            for (let i = 0; i < imageFile.length; i++) {
                formData.append('files', imageFile[i]);
            }
        }
        
        setIsInspecting(true);
        setInspectionResult(null);

        try {
            const response = await axios.post(`${proxyUrl}/goods/inspect`, formData, {
                withCredentials: true,
            });
            
            if (response.data.success) {
                const result = response.data.data;
                setInspectionResult(result);
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

    // 상품 등록 버튼 (form의 onSubmit) 핸들러
    const onRegister = async (data: FieldValues) => {
        if (inspectionResult === null) {
            if (!window.confirm('AI 상품 검수를 진행하지 않았습니다. 그대로 등록하시겠습니까?')) {
                return; 
            }
        }

        const { goodsName, mobileGoodsName, salesPrice, buyPrice, origin, imageFile } = data;
        
        const formData = new FormData();
        formData.append('goodsName', goodsName);
        formData.append('mobileGoodsName', mobileGoodsName);
        formData.append('salesPrice', salesPrice);
        formData.append('buyPrice', buyPrice);
        formData.append('origin', origin);

        if (imageFile && imageFile.length > 0) {
            for (let i = 0; i < imageFile.length; i++) {
                formData.append('files', imageFile[i]);
            }
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
            if (axiosError.response?.data?.message) {
                 alert(`오류: ${axiosError.response.data.message}`);
            } else {
                console.error('등록 중 에러 발생:', error);
                alert('등록 중 알 수 없는 오류가 발생했습니다.');
            }
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
                    
                    {/* [핵심] 분리된 GoodsFormFields 컴포넌트를 사용합니다. */}
                    <GoodsFormFields 
                        register={register}
                        errors={errors}
                        isDarkMode={isDarkMode}
                        imagePreviews={imagePreviews}
                        setValue={setValue}
                    />
                    
                    {inspectionResult && (
                        <div className={`mt-6 p-4 rounded-lg flex items-start ${inspectionResult.approved ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50'}`}>
                            <div className={`flex-shrink-0 text-2xl ${inspectionResult.approved ? 'text-green-500' : 'text-red-500'}`}>{inspectionResult.approved ? '✅' : '❌'}</div>
                            <div className="ml-3">
                                <h4 className={`font-semibold ${inspectionResult.approved ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>AI 검수 결과</h4>
                                <p className={`mt-1 text-sm ${inspectionResult.approved ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>{inspectionResult.reason}</p>
                            </div>
                        </div>
                    )}

                    <div className="mt-8 border-t pt-6 flex flex-col sm:flex-row justify-end items-center gap-4">
                        <button type="button" onClick={onInspect} disabled={isInspecting || isRegistering} className={`inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 border text-base font-medium rounded-lg shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${ isDarkMode ? 'border-indigo-400 text-indigo-300 hover:bg-indigo-400 hover:text-white focus:ring-indigo-300' : 'border-indigo-500 text-indigo-600 bg-white hover:bg-indigo-50 focus:ring-indigo-500' } ${(isInspecting || isRegistering) ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            <InspectIcon />
                            {isInspecting ? '검수 중...' : 'AI 상품 검수'}
                        </button>
                        <button type="submit" disabled={isInspecting || isRegistering} className={`inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${ (isInspecting || isRegistering) ? 'bg-gray-400 cursor-not-allowed' : `bg-blue-600 hover:bg-blue-700 focus:ring-blue-500`}`}>
                            {isRegistering ? '저장 중...' : '상품 등록하기'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
