import axios from "axios";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import secureLocalStorage from "react-secure-storage";
import { User } from "../types/user";


type UserContextType = {
  user: User | null;
  isLoading: boolean;
};

const UserContext = createContext<UserContextType>({ user: null, isLoading: true });

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const proxyUrl = "/api";

  useEffect(() => {
    const validateSession = async () => {
      setIsLoading(true); // 검증 시작 시 로딩 상태로 설정
      try {
        const rawUser = secureLocalStorage.getItem("user");
        if (!rawUser) throw new Error("No user data in storage");
        const storedUser = JSON.parse(String(rawUser)) as User;
        
        // 백엔드 API 검증
        const response = await axios.get(proxyUrl + "/member/auth", { withCredentials: true });

        if (!response.data?.success) {
          setUser(null);
        }

        if(response.data?.data?.loginId !== storedUser.loginId){
          setUser(null);
        }

        // 성공 시 사용자 정보 설정
        setUser(response.data.data);

      } catch (e) {
        // 실패 시 모든 로컬 정보 초기화
        console.error("Session validation failed:", e);
        secureLocalStorage.removeItem("user");
        setUser(null);
      } finally {
        setIsLoading(false); // 검증 완료 시 로딩 상태 해제
      }
    };

    validateSession(); // 최초 1회 실행

    // 5분마다 주기적으로 세션 검증
    const interval = setInterval(validateSession, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []); // 의존성 배열을 비워서 최초 마운트 시에만 실행되도록 함

  return (
    <UserContext.Provider value={{ user, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);