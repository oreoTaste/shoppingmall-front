// react-client/src/routers/forbidden-words-router.tsx

import { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { useForm, FieldValues } from 'react-hook-form';
import { useDarkMode } from '../contexts/DarkModeContext';
import Navbar from '../components/Navbar';
import DarkButton from '../components/DarkButton';
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { DeleteIcon } from '../components/Icons';
import { ForbiddenWord } from '../types/forbiddenWord';

export const ForbiddenWordsRouter = () => {
    // Update the form to handle all fields of the ForbiddenWord entity
    const { register, handleSubmit, reset } = useForm<ForbiddenWord>();
    // Update state to hold an array of ForbiddenWord objects
    const [forbiddenWords, setForbiddenWords] = useState<ForbiddenWord[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const { isDarkMode } = useDarkMode();
    const { user } = useUser();
    const proxyUrl = "/api";
    const navigate = useNavigate();

    const fetchForbiddenWords = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${proxyUrl}/forbidden-words`, { withCredentials: true });
            if (response.data.success) {
                setForbiddenWords(response.data.data);
            } else {
                alert(response.data.message || '금칙어 목록을 불러오는데 실패했습니다.');
            }
        } catch (error) {
            const axiosError = error as AxiosError<any>;
            alert(axiosError.response?.data?.message || '금칙어 목록을 불러오는 중 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const onAddWord = async (data: ForbiddenWord) => {
        if (!data.word || data.word.trim() === '') {
            alert('금칙어는 필수 항목입니다.');
            return;
        }

        try {
            // Send the entire form data object
            const response = await axios.post(`${proxyUrl}/forbidden-words`, data, { withCredentials: true });
            if (response.data.success) {
                alert('금칙어가 성공적으로 등록되었습니다.');
                fetchForbiddenWords(); // Refresh list
                reset(); // Clear form
            } else {
                alert(response.data.message || '등록에 실패했습니다.');
            }
        } catch (error) {
            const axiosError = error as AxiosError<any>;
            alert(axiosError.response?.data?.message || '등록 중 알 수 없는 오류가 발생했습니다.');
        }
    };

    const onDeleteWord = async ({word, forbiddenWordId}: ForbiddenWord) => {
        if (!window.confirm(`'${word}' 단어를 정말로 삭제하시겠습니까? (id: ${forbiddenWordId})`)) {
            return;
        }

        try {
            // API 엔드포인트를 ID로 호출하도록 수정합니다.
            const response = await axios.delete(`${proxyUrl}/forbidden-words`, { params: {forbiddenWordId}, withCredentials: true });
            
            if (response.data.success) {
                alert('금칙어가 성공적으로 삭제되었습니다.');
                fetchForbiddenWords(); // 목록 새로고침
            } else {
                alert(response.data.message || '삭제에 실패했습니다.');
            }
        } catch (error) {
            const axiosError = error as AxiosError<any>;
            alert(axiosError.response?.data?.message || '삭제 중 알 수 없는 오류가 발생했습니다.');
        }
    };

    useEffect(() => {
        if (user && user.adminYn === "Y") {
            fetchForbiddenWords();
        }
    }, [user]);

    if (user && user.adminYn !== "Y") {
        navigate("/goods/list");
        return null;
    }

    if (!user) {
        return null;
    }

    // Common input styling
    const inputStyle = `w-full px-4 py-2 border rounded-md transition-colors ${isDarkMode
        ? 'bg-gray-700 text-white border-gray-600 focus:ring-blue-500 focus:border-blue-500'
        : 'bg-white text-gray-900 border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`;

    return (
        <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center">
                    <Navbar isDarkMode={isDarkMode} />
                    <DarkButton />
                </div>

                <header className="text-center my-8">
                    <h1 className={`text-4xl font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>금칙어 관리</h1>
                    <p className={`mt-2 text-md ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>상품 이름에 포함될 수 없는 단어를 관리합니다.</p>
                </header>

                <div className="max-w-4xl mx-auto">
                    {/* Updated Form with all fields */}
                    <form onSubmit={handleSubmit(onAddWord)} className={`p-8 rounded-2xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>새 금칙어 추가</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input {...register('lgroup')} placeholder="대분류" className={inputStyle} />
                            <input {...register('mgroup')} placeholder="중분류" className={inputStyle} />
                            <input {...register('sgroup')} placeholder="소분류" className={inputStyle} />
                            <input {...register('dgroup')} placeholder="세분류" className={inputStyle} />
                            <input {...register('word', { required: true })} placeholder="금칙어 (필수)" className={`${inputStyle} md:col-span-2`} />
                            <input {...register('reason')} placeholder="사유" className={`${inputStyle} md:col-span-2`} />
                        </div>
                        <div className="mt-6 text-right">
                            <button type="submit" className="px-6 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
                                추가
                            </button>
                        </div>
                    </form>

                    {/* Updated List to Table */}
                    <div className={`mt-8 rounded-2xl shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} overflow-hidden`}>
                        <h2 className={`text-2xl font-bold p-8 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>등록된 금칙어 목록</h2>
                        {isLoading ? (
                            <p className={`px-8 pb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>목록을 불러오는 중...</p>
                        ) : forbiddenWords.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}>
                                        <tr>
                                            {['단어', '대', '중', '소', '세', '사유', '관리'].map(header => (
                                                <th key={header} className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{header}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className={isDarkMode ? 'divide-y divide-gray-700' : 'divide-y divide-gray-200'}>
                                        {forbiddenWords.map((item) => (
                                            <tr key={item.forbiddenWordId}>
                                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.word}</td>
                                                <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>{item.lgroup}</td>
                                                <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>{item.mgroup}</td>
                                                <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>{item.sgroup}</td>
                                                <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>{item.dgroup}</td>
                                                <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>{item.reason}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <button onClick={() => onDeleteWord(item)} className="text-red-500 hover:text-red-700 dark:hover:text-red-400" title="삭제">
                                                        <DeleteIcon />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className={`px-8 pb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>등록된 금칙어가 없습니다.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};