import { useState } from 'react';
import { useForm, FieldValues, FieldError } from 'react-hook-form';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../contexts/DarkModeContext';
import Navbar from '../components/Navbar';

export const GoodsRegisterRouter = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<FieldValues>();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const { isDarkMode } = useDarkMode();

    const onSubmit = async (data: any) => {
        const { goodsName, price, description } = data;
        const url = `/goods`; // 상품 등록 API 엔드포인트

        setIsLoading(true);
        try {
            const response = await axios.post(url,
                { goodsName, price, description }, // valueAsNumber: true 이므로 price는 이미 숫자 타입입니다.
                { withCredentials: true, headers: { "X-API-Request": "true" } }
            );
            
            if (response.data.success) {
                alert('상품이 성공적으로 등록되었습니다.');
                navigate('/goods/list'); // 등록 후 상품 목록 페이지로 이동
            } else {
                alert(response.data.message || '상품 등록에 실패했습니다. 다시 시도해주세요.');
            }
        } catch (error) {
            console.error('상품 등록 요청 중 에러 발생:', error);
            alert('상품 등록 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const getErrorMessage = (error: FieldError | undefined): string | null => {
        if (error && 'message' in error) {
            return error.message as string;
        }
        return null;
    };

    return (
        <div className={`p-8 rounded-lg shadow-lg max-w-3xl w-full mx-auto mt-10
            ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
            <Navbar isDarkMode={isDarkMode} />
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-4">
                    <input
                        {...register('goodsName', { required: '상품명을 입력해주세요' })}
                        type="text"
                        placeholder="상품명"
                        className={`w-full p-3 border rounded-md text-lg focus:outline-none
                            ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'}
                            ${errors.goodsName ? 'border-red-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500' : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500'}`}
                    />
                    {errors.goodsName && <span className="text-red-500 text-sm">{getErrorMessage(errors.goodsName as FieldError)}</span>}
                </div>

                <div className="mb-4">
                    <input
                        {...register('price', {
                            required: '가격을 입력해주세요',
                            valueAsNumber: true,
                            min: { value: 0, message: '가격은 0 이상이어야 합니다.' } // 👈 이 부분 수정
                        })}
                        type="number"
                        placeholder="가격"
                        className={`w-full p-3 border rounded-md text-lg focus:outline-none
                            ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'}
                            ${errors.price ? 'border-red-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500' : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500'}`}
                    />
                    {errors.price && <span className="text-red-500 text-sm">{getErrorMessage(errors.price as FieldError)}</span>}
                </div>

                <div className="mb-6">
                    <textarea
                        {...register('description')}
                        placeholder="상품 설명 (선택 사항)"
                        rows={6}
                        className={`w-full p-3 border rounded-md text-lg focus:outline-none
                            ${isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'}
                            focus:border-blue-500 focus:ring-2 focus:ring-blue-500`}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-3 text-lg font-semibold rounded-md text-white hover:bg-blue-600 focus:outline-none
                        ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500'}`}
                >
                    {isLoading ? '등록 중...' : '상품 등록하기'}
                </button>
            </form>
        </div>
    );
};