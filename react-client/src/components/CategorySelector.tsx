import { useState, useEffect } from 'react';
import axios from 'axios';
import { UseFormSetValue } from 'react-hook-form';

interface Category {
  code: string;
  name: string;
}

// 👇 1. 초기값을 받을 props 추가
interface CategorySelectorProps {
  setValue: UseFormSetValue<any>;
  isDarkMode: boolean;
  initialLgroup?: string;
  initialMgroup?: string;
  initialSgroup?: string;
  initialDgroup?: string;
}

export const CategorySelector = ({ 
    setValue, 
    isDarkMode, 
    initialLgroup = '', // 기본값 설정
    initialMgroup = '', 
    initialSgroup = '', 
    initialDgroup = '' 
}: CategorySelectorProps) => {

  const [lCategories, setLCategories] = useState<Category[]>([]);
  const [mCategories, setMCategories] = useState<Category[]>([]);
  const [sCategories, setSCategories] = useState<Category[]>([]);
  const [dCategories, setDCategories] = useState<Category[]>([]);

  // 👇 2. 내부 상태의 초기값을 props로 받은 값으로 설정
  const [selectedL, setSelectedL] = useState(initialLgroup);
  const [selectedM, setSelectedM] = useState(initialMgroup);
  const [selectedS, setSelectedS] = useState(initialSgroup);
  const [selectedD, setSelectedD] = useState(initialDgroup);
  
  const proxyUrl = "/api";

  const fetchCategories = async (level: number | null, parentCode: string | null) => {
    try {
      const params = new URLSearchParams();
      if (level) params.append('level', String(level));
      if (parentCode) params.append('parentCode', parentCode);
      const response = await axios.get(`${proxyUrl}/categories?${params.toString()}`);
      return response.data.data || [];
    } catch (error) {
      console.error("카테고리 조회 실패:", error);
      return [];
    }
  };

  // 1. 대분류 목록은 항상 불러옵니다.
  useEffect(() => {
    const loadLCategories = async () => {
      const data = await fetchCategories(1, null);
      setLCategories(data);
    };
    loadLCategories();
  }, []);

  // 2. 대분류가 선택되면(또는 초기값이 있으면) 중분류 목록을 불러옵니다.
  useEffect(() => {
    // 선택이 바뀔 때만 하위 목록 초기화
    if (selectedL !== initialLgroup) {
        setMCategories([]);
        setSCategories([]);
        setDCategories([]);
        setSelectedM('');
        setSelectedS('');
        setSelectedD('');
        setValue('mgroup', '');
        setValue('sgroup', '');
        setValue('dgroup', '');
    }
    
    if (selectedL) {
      const loadMCategories = async () => {
        const data = await fetchCategories(2, selectedL);
        setMCategories(data);
      };
      loadMCategories();
    }
  }, [selectedL]);

  // 3. 중분류가 선택되면(또는 초기값이 있으면) 소분류 목록을 불러옵니다.
  useEffect(() => {
    if (selectedM !== initialMgroup) {
        setSCategories([]);
        setDCategories([]);
        setSelectedS('');
        setSelectedD('');
        setValue('sgroup', '');
        setValue('dgroup', '');
    }
    
    if (selectedM) {
      const parentCode = selectedL + selectedM;
      const loadSCategories = async () => {
        const data = await fetchCategories(3, parentCode);
        setSCategories(data);
      };
      loadSCategories();
    }
  }, [selectedM]);
  
  // 4. 소분류가 선택되면(또는 초기값이 있으면) 세분류 목록을 불러옵니다.
  useEffect(() => {
    if (selectedS !== initialSgroup) {
        setDCategories([]);
        setSelectedD('');
        setValue('dgroup', '');
    }

    if (selectedS) {
      const parentCode = selectedL + selectedM + selectedS;
      const loadDCategories = async () => {
        const data = await fetchCategories(4, parentCode);
        setDCategories(data);
      };
      loadDCategories();
    }
  }, [selectedS]);
  
 const selectStyle = `w-full px-3 py-2 border rounded-md transition-colors ${
    isDarkMode 
      ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500' 
      : 'bg-white border-gray-300 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500'
  }`;
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* 각 select 태그의 value와 onChange는 그대로 유지 */}
        <div>
            <label htmlFor="lgroup-select" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>대분류</label>
            <select
            id="lgroup-select"
            value={selectedL}
            onChange={(e) => {
                const code = e.target.value;
                setSelectedL(code);
                setValue('lgroup', code);
            }}
            className={selectStyle}
            >
            <option value="">선택하세요</option>
            {lCategories.map((cat) => (
                <option key={cat.code} value={cat.code}>{cat.name}</option>
            ))}
            </select>
        </div>
        <div>
            <label htmlFor="mgroup-select" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>중분류</label>
            <select
            id="mgroup-select"
            value={selectedM}
            onChange={(e) => {
                const code = e.target.value;
                setSelectedM(code);
                setValue('mgroup', code);
            }}
            disabled={!selectedL || mCategories.length === 0}
            className={selectStyle}
            >
            <option value="">선택하세요</option>
            {mCategories.map((cat) => (
                <option key={cat.code} value={cat.code}>{cat.name}</option>
            ))}
            </select>
        </div>
        <div>
            <label htmlFor="sgroup-select" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>소분류</label>
            <select
            id="sgroup-select"
            value={selectedS}
            onChange={(e) => {
                const code = e.target.value;
                setSelectedS(code);
                setValue('sgroup', code);
            }}
            disabled={!selectedM || sCategories.length === 0}
            className={selectStyle}
            >
            <option value="">선택하세요</option>
            {sCategories.map((cat) => (
                <option key={cat.code} value={cat.code}>{cat.name}</option>
            ))}
            </select>
        </div>
        <div>
            <label htmlFor="dgroup-select" className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>세분류</label>
            <select
            id="dgroup-select"
            value={selectedD}
            onChange={(e) => {
                const code = e.target.value;
                setSelectedD(code);
                setValue('dgroup', code);
            }}
            disabled={!selectedS || dCategories.length === 0}
            className={selectStyle}
            >
            <option value="">선택하세요</option>
            {dCategories.map((cat) => (
                <option key={cat.code} value={cat.code}>{cat.name}</option>
            ))}
            </select>
        </div>
    </div>
  );
};