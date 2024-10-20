import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './Header'; // Header 컴포넌트 불러오기
import LoginPage from './LoginPage'; // 추가할 페이지들 임시로 생성
import MainPage from './MainPage';
import RecordsPage from './RecordsPage';
import RegisterPage from './RegisterPage';

function App() {
  return (
    <Router>
      <div>
        <Header />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<MainPage />} />
          <Route path="/records" element={<RecordsPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
