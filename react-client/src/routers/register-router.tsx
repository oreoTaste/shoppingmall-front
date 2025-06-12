import { useState } from 'react';
import { useForm, FieldValues, FieldError } from 'react-hook-form';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../contexts/DarkModeContext';
import DarkButton from '../components/DarkButton';

export const RegisterRouter = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<FieldValues>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { isDarkMode } = useDarkMode();
  const proxyUrl = "/api";

  const onSubmit = async (data: any) => {
    const { loginId, name, password } = data;
    const url = `/member/sign-up`; // 회원가입 API 경로

    setIsLoading(true);
    try {
      const response = await axios.post(proxyUrl + url
            , { loginId, name, password }
            , { withCredentials: true }
        );
      if (response.data.success) {
        alert('회원가입 성공!');
        navigate('/'); // 회원가입 후 로그인 화면으로 이동
      } else {
        alert('회원가입 실패. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('회원가입 요청 중 에러 발생:', error);
      alert('회원가입 중 오류가 발생했습니다.');
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
    <div className={`flex flex-col items-center justify-center min-h-screen 
          ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-800'}`}>
      {/* 다크 모드 버튼 */}
      <DarkButton />
      <h1 className="text-4xl font-semibold mb-6">회원가입</h1>
      <form className={`p-8 rounded-lg shadow-lg max-w-md w-full 
              ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}
            onSubmit={handleSubmit(onSubmit)}
      >
        <div className="mb-4">
          <input
            {...register('loginId', {
              required: '아이디를 입력해주세요',
              pattern: {
                value: /^([a-zA-Z0-9_]{5,20})$/,
                message: '아이디는 5~20자의 영문자, 숫자, 밑줄만 가능합니다.',
              },
            })}
            type="text"
            placeholder="아이디"
            className={`w-full p-3 border rounded-md text-lg focus:outline-none 
              ${isDarkMode 
                ? 'bg-gray-800 text-white border-gray-600' 
                : 'bg-white text-gray-800 border-gray-300'}
              ${errors.loginId 
                ? 'border-red-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500' 
                : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500'}`}
          />
          {errors.loginId && <span className="text-red-500 text-sm">{getErrorMessage(errors.loginId as FieldError)}</span>}
        </div>

        <div className="mb-4">
          <input
            {...register('name', {
              required: '이름을 입력해주세요',
              minLength: { value: 2, message: '이름은 최소 2자 이상이어야 합니다.' },
            })}
            type="text"
            placeholder="이름"
            className={`w-full p-3 border rounded-md text-lg focus:outline-none 
              ${isDarkMode 
                ? 'bg-gray-800 text-white border-gray-600' 
                : 'bg-white text-gray-800 border-gray-300'}
              ${errors.name 
                ? 'border-red-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500' 
                : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500'}`}
          />
          {errors.name && <span className="text-red-500 text-sm">{getErrorMessage(errors.name as FieldError)}</span>}
        </div>

        <div className="mb-6">
          <input
            {...register('password', {
              required: '비밀번호를 입력해주세요',
              minLength: { value: 6, message: '비밀번호는 최소 6자 이상이어야 합니다.' },
            })}
            type="password"
            placeholder="비밀번호"
            className={`w-full p-3 border rounded-md text-lg focus:outline-none 
              ${isDarkMode 
                ? 'bg-gray-800 text-white border-gray-600' 
                : 'bg-white text-gray-800 border-gray-300'}
              ${errors.password
                ? 'border-red-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500' 
                : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500'}`}
          />
          {errors.password && <span className="text-red-500 text-sm">{getErrorMessage(errors.password as FieldError)}</span>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 text-lg font-semibold rounded-md text-white hover:bg-blue-600 focus:outline-none
            ${isLoading ? 'bg-gray-400' : 'bg-blue-500'}`}
        >
          {isLoading ? '회원가입 중...' : '회원가입'}
        </button>
      </form>

      <button
        onClick={() => navigate('/')}
        className="mt-4 text-blue-500 hover:underline"
      >
        로그인 화면으로 돌아가기
      </button>
    </div>
  );
};
