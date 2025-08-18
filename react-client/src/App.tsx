import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { LoggedOutRouter } from './routers/logged-out-router';
import { RegisterRouter } from './routers/register-router';
import { UserProvider } from './contexts/UserContext';
import { DarkModeProvider } from './contexts/DarkModeContext';
import NotFound from './components/NotFound';
import { GoodsRegisterRouter } from './routers/goods-register-router';
import { GoodsListRouter } from './routers/goods-list-router';
import AdminRoute from './components/AdminRoute';
import { GoodsDetailPage } from './routers/goods-detail-router';
import { ForbiddenWordsRouter } from './routers/forbidden-words-router';


const ProtectedRoutes = () => {
  return (
    <Routes>
      {/* 1. /goods/list는 로그인한 유저라면 누구나 접근 가능 */}
      <Route path="/goods/list" element={<GoodsListRouter />} />
      
      {/* 2. /goods/register는 AdminRoute의 검사를 통과해야만 접근 가능 */}
      <Route path="/goods/register" element={<AdminRoute>
                                              <GoodsRegisterRouter />
                                             </AdminRoute>}/>
      {/* 3. 상품 상세 페이지 라우트 (동적 ID 사용) */}
      <Route path="/goods/detail/:goodsId" element={<GoodsDetailPage />} />

      {/* 4. 금칙어 라우트 */}
      <Route path="/forbidden-words" element={<AdminRoute>
                                                <ForbiddenWordsRouter />
                                              </AdminRoute>} />

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
