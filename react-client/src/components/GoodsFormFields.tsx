import { FieldError, FieldValues, UseFormRegister, UseFormSetValue } from "react-hook-form";
import { UploadIcon } from "./Icons";

// --- [신규] 재사용 가능한 상품 폼 필드 컴포넌트 ---
interface GoodsFormFieldsProps {
    register: UseFormRegister<FieldValues>;
    errors: { [x: string]: any; };
    isDarkMode: boolean;
    imagePreviews: string[];
    setValue: UseFormSetValue<FieldValues>;
}

export const GoodsFormFields = ({ register, errors, isDarkMode, imagePreviews, setValue }: GoodsFormFieldsProps) => {

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

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-1">
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>상품 이미지</label>
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
                            <div className="grid grid-cols-2 gap-2">
                                {imagePreviews.map((preview, index) => (
                                    <img key={index} src={preview} alt={`미리보기 ${index+1}`} className="w-full h-28 object-cover rounded-md" />
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
            </div>
            <div className="space-y-6 md:col-span-1">
                <FormInput name="goodsName" placeholder="상품명" validationRules={{ required: '상품명을 입력해주세요' }} />
                <FormInput name="mobileGoodsName" placeholder="모바일 상품명" validationRules={{ required: '모바일 상품명을 입력해주세요' }} />
                <FormInput name="origin" placeholder="원산지" validationRules={{ required: '원산지를 입력해주세요' }} />
                <FormInput name="salesPrice" placeholder="판매 가격" type="number" validationRules={{ required: '판매 가격을 입력해주세요', valueAsNumber: true, validate: (v:number) => !isNaN(v) && v >= 0 || '가격은 0 이상이어야 합니다.'}} />
                <FormInput name="buyPrice" placeholder="구매 가격" type="number" validationRules={{ required: '구매 가격을 입력해주세요', valueAsNumber: true, validate: (v:number) => !isNaN(v) && v >= 0 || '가격은 0 이상이어야 합니다.'}} />
            </div>
        </div>
    );
};
