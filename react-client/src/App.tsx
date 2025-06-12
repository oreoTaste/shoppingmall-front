import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { LoggedOutRouter } from './routers/logged-out-router';
import { RegisterRouter } from './routers/register-router';
import { UserProvider } from './contexts/UserContext';
import { DarkModeProvider } from './contexts/DarkModeContext';
import NotFound from './components/NotFound';
import { GoodsRegisterRouter } from './routers/goods-register-router';
import { GoodsListRouter } from './routers/goods-list-router';

const ProtectedRoutes = () => {
  return (
    <Routes>
        {/* 로그인 화면이 /user/login 경로로 매핑됨 */}
        <Route path="/goods/list" element={<GoodsListRouter/>}/>
        <Route path="/goods/register" element={<GoodsRegisterRouter/>}/>
        <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <DarkModeProvider>
      <Router>
        <Routes>
          {/* 메인화면 */}
          <Route path="/" element={<LoggedOutRouter />} />
          {/* 회원가입화면 */}
          <Route path="/register" element={<RegisterRouter />} />
          {/* 기타화면 */}
          <Route path="/*" element={<UserProvider>
                                      <ProtectedRoutes />
                                    </UserProvider>}/>
        </Routes>
      </Router>
    </DarkModeProvider>
  );
};


export default App;
