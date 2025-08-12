import { FieldError, FieldValues, UseFormRegister, UseFormSetValue, Control, useWatch } from "react-hook-form";
import { UploadIcon } from "./Icons";

// --- GoodsFormFields 컴포넌트 ---
interface GoodsFormFieldsProps {
    register: UseFormRegister<FieldValues>;
    errors: { [x: string]: any; };
    isDarkMode: boolean;
    imagePreviews: string[];
    representativeImagePreview: string | null;
    setValue: UseFormSetValue<FieldValues>;
    control: Control<FieldValues>;
    detailContentType: 'file' | 'html'; 
    setDetailContentType: (type: 'file' | 'html') => void;
}

export const GoodsFormFields = ({
    register,
    errors,
    isDarkMode,
    imagePreviews,
    representativeImagePreview,
    setValue,
    control,
    detailContentType,
    setDetailContentType,
}: GoodsFormFieldsProps) => {

    const imageHtmlValue = useWatch({
        control,
        name: 'imageHtml',
    });

    const getErrorMessage = (name: keyof FieldValues) => {
        const error = errors[name] as FieldError | undefined;
        return error ? <span className="mt-1 text-sm text-red-500">{error.message}</span> : null;
    };

    const FormInput = ({ name, placeholder, type = "text", validationRules }: any) => (
        <div>
            <label htmlFor={name} className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{placeholder}</label>
            <input
                id={name}
                {...register(name, validationRules)}
                type={type}
                placeholder={`${placeholder}을(를) 입력하세요`}
                className={`w-full p-3 border rounded-lg transition-colors duration-200 focus:ring-2 focus:outline-none ${
                    isDarkMode 
                    ? 'bg-gray-700 text-white border-gray-600 focus:ring-blue-500 focus:border-blue-500' 
                    : 'bg-white text-gray-800 border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                } ${errors[name] ? 'border-red-500' : ''}`}
            />
            {getErrorMessage(name)}
        </div>
    );
    
    // --- [수정된 부분] ---
    // 탭 전환 시 다른 쪽의 입력 값을 초기화하는 로직을 개선합니다.
    const handleDetailMethodChange = (method: 'file' | 'html') => {
        if (method === 'html') {
            // 'HTML로 등록' 탭을 누르면, 파일 선택은 초기화합니다.
            setValue('imageFile', null);
        }
        // '파일로 등록' 탭을 눌러도 HTML 입력 내용은 지우지 않도록 변경하여
        // 사용자가 탭을 다시 돌아왔을 때 입력 내용을 유지하도록 합니다.
        setDetailContentType(method);
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput name="goodsName" placeholder="상품명" validationRules={{ required: '상품명을 입력해주세요' }} />
                <FormInput name="mobileGoodsName" placeholder="모바일 상품명" validationRules={{ required: '모바일 상품명을 입력해주세요' }} />
                <FormInput name="salesPrice" placeholder="판매 가격" type="number" validationRules={{ required: '판매 가격을 입력해주세요', valueAsNumber: true, min: { value: 0, message: '가격은 0 이상이어야 합니다.'} }} />
                <FormInput name="buyPrice" placeholder="구매 가격" type="number" validationRules={{ required: '구매 가격을 입력해주세요', valueAsNumber: true, min: { value: 0, message: '가격은 0 이상이어야 합니다.'} }} />
                <FormInput name="origin" placeholder="원산지" validationRules={{ required: '원산지를 입력해주세요' }} />
            </div>

            <hr className={isDarkMode ? 'border-gray-700' : 'border-gray-200'}/>

            <div>
                <h3 className={`text-lg font-semibold leading-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    상품 대표사진 <span className="text-red-500">*</span>
                </h3>
                <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>상품 목록에 표시될 대표 이미지 1장을 등록해주세요.</p>
                <div className="mt-4">
                    <label 
                        htmlFor="representativeImageFile"
                        className={`relative flex justify-center items-center w-full h-56 rounded-lg border-2 border-dashed transition-colors duration-200 cursor-pointer ${isDarkMode ? 'border-gray-600 hover:border-gray-500 bg-gray-800/50' : 'border-gray-300 hover:border-gray-400 bg-gray-50'}`}
                    >
                        <input
                            id="representativeImageFile"
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            {...register('representativeImageFile')}
                        />
                        {representativeImagePreview ? (
                            <img src={representativeImagePreview} alt="대표사진 미리보기" className="h-full w-full object-contain rounded-lg p-2" />
                        ) : (
                            <div className="text-center">
                                <UploadIcon />
                                <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}><span className="font-semibold">클릭하거나</span> 파일을 드래그하세요</p>
                            </div>
                        )}
                    </label>
                    {getErrorMessage('representativeImageFile')}
                </div>
            </div>
            
            <hr className={isDarkMode ? 'border-gray-700' : 'border-gray-200'}/>

            <div>
                <h3 className={`text-lg font-semibold leading-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    상품 상세 정보 <span className="text-sm font-normal text-gray-500">(선택)</span>
                </h3>
                <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>상품의 상세 정보를 파일 또는 HTML로 등록합니다.</p>
                
                <div className="mt-4 border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        <button type="button" onClick={() => handleDetailMethodChange('file')} className={`${detailContentType === 'file' ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}>
                            파일로 등록
                        </button>
                        <button type="button" onClick={() => handleDetailMethodChange('html')} className={`${detailContentType === 'html' ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}>
                            HTML로 등록
                        </button>
                    </nav>
                </div>

                <div className="mt-4">
                    {detailContentType === 'file' && (
                        <div className={`mt-2 flex justify-center items-center w-full min-h-[16rem] rounded-lg border-2 border-dashed transition-colors ${isDarkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'}`}>
                            <div className="text-center relative w-full h-full p-4">
                                <input
                                    id="imageFile"
                                    {...register('imageFile')}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                {imagePreviews.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                        {imagePreviews.map((preview, index) => (
                                            <img key={index} src={preview} alt={`상세 미리보기 ${index+1}`} className="w-full h-28 object-cover rounded-md" />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full">
                                        <UploadIcon />
                                        <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}><span className="font-semibold">클릭하거나</span> 파일을 드래그하세요</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    
                    {detailContentType === 'html' && (
                        <div className="space-y-2">
                            <textarea
                                id="imageHtml"
                                {...register('imageHtml', { required: detailContentType === 'html' ? 'HTML 태그를 입력해주세요.' : false })}
                                placeholder="<img src='...'/> 와 같은 태그를 입력하세요."
                                rows={8}
                                className={`w-full p-3 border rounded-lg transition-colors duration-200 focus:ring-2 focus:outline-none ${
                                    isDarkMode 
                                    ? 'bg-gray-700 text-white border-gray-600 focus:ring-blue-500 focus:border-blue-500' 
                                    : 'bg-white text-gray-800 border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                } ${errors.imageHtml ? 'border-red-500' : ''}`}
                            />
                            {getErrorMessage('imageHtml')}
                            
                            {imageHtmlValue && !errors.imageHtml && (
                                <div className="mt-2">
                                    <p className={`text-sm mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>미리보기</p>
                                    <div 
                                        className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800"
                                        dangerouslySetInnerHTML={{ __html: imageHtmlValue }} 
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};