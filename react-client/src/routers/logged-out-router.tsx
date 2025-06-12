import { useState } from 'react';
import { useForm, FieldValues, FieldError } from 'react-hook-form';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../contexts/DarkModeContext';
import secureLocalStorage from "react-secure-storage";
import DarkButton from '../components/DarkButton';

export const LoggedOutRouter = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<FieldValues>();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const proxyUrl = "/api";
  secureLocalStorage.removeItem("user");

  const onSubmit = async (data: FieldValues) => {
    const { loginId, password } = data;
    const url = `/member/login`;

    const params = new URLSearchParams();
    params.append('loginId', loginId); 
    params.append('password', password);

    setIsLoading(true);
    try {
      const response = await axios.post(
        proxyUrl + url,
        params,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      if (response.data.success) {
        secureLocalStorage.setItem("user", JSON.stringify({ loginId, adminYn: response.data.adminYn }));
        navigate('/goods/list');
      } else {
        alert(response.data.message || '로그인 정보가 잘못되었습니다. 다시 시도해 주세요.');
      }
    } catch (error) {
      console.error('로그인 요청 중 에러 발생:', error);
      alert('로그인 실패. 다시 시도해 주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorMessage = (error: FieldError | undefined): string | null => {
    if (error && typeof error.message === 'string') {
      return error.message;
    }
    return null;
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-800'}`}>
      <DarkButton />
      <h1 className={`text-4xl font-semibold mb-6 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-800'}`}>쇼핑몰 관리자용 로그인</h1>
      
      <form
        className={`p-8 rounded-lg shadow-lg max-w-md w-full ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-800'}`}
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="mb-4">
          <input
            {...register('loginId', {
              required: '아이디를 입력해주세요',
              pattern: {
                value: /^(admin|[a-zA-Z0-9_]{5,20})$/,
                message: '아이디는 5~20자의 영문자, 숫자, 밑줄만 사용할 수 있습니다',
              }
            })}
            type="text"
            placeholder="아이디"
            autoComplete="username"
            className={`w-full p-3 border rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 
              ${isDarkMode ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'} 
              ${errors.loginId ? 'border-red-500' : ''}`}
          />
          {errors.loginId && (
            <span className="text-red-500 text-sm">
              {getErrorMessage(errors.loginId as FieldError)}
            </span>
          )}
        </div>

        <div className="mb-6">
          <input
            {...register('password', {
              required: '비밀번호를 입력해주세요',
              minLength: { value: 6, message: '비밀번호는 최소 6자 이상이어야 합니다' }
            })}
            type="password"
            placeholder="비밀번호"
            autoComplete="current-password"
            className={`w-full p-3 border rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 
              ${isDarkMode ? 'bg-gray-800 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'} 
              ${errors.password ? 'border-red-500' : ''}`}
          />
          {errors.password && (
            <span className="text-red-500 text-sm">
              {getErrorMessage(errors.password as FieldError)}
            </span>
          )}
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 ${isLoading ? 'bg-gray-400' : 'bg-blue-500'} text-white text-lg font-semibold rounded-md hover:bg-blue-600 focus:outline-none`}
        >
          {isLoading ? '로그인 중...' : '로그인'}
        </button>
      </form>
      <button
        onClick={() => navigate('/register')}
        className="mt-4 text-blue-500 hover:underline"
      >
        회원가입
      </button>
    </div>
  );
};