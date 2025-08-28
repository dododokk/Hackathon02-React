// App.js 예시

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// 컴포넌트 import
import Home from './component/Home';
import Login from './component/Login';
import Register from './component/Register';
import Main from './component/Main';
import MyPage from './component/MyPage';
import Notification from './component/Notification';
import Message from './component/Message';
import Chat from './component/Chat';
import Post from './component/Post';
import Write from './component/Write';

// 1. 방금 만든 ProtectedRoute를 import 합니다.
import ProtectedRoute from './component/ProtectedRoute';

function App() {
  return (
      <Routes>
        {/* 로그인이 필요 없는 페이지 */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ▼▼▼ 로그인이 필요한 페이지들을 ProtectedRoute로 감싸줍니다 ▼▼▼ */}
        <Route
          path="/main"
          element={<ProtectedRoute><Main /></ProtectedRoute>}
        />
        <Route
          path="/mypage"
          element={<ProtectedRoute><MyPage /></ProtectedRoute>}
        />
        <Route
          path="/notification"
          element={<ProtectedRoute><Notification /></ProtectedRoute>}
        />
        <Route
          path="/message"
          element={<ProtectedRoute><Message /></ProtectedRoute>}
        />
        <Route
          path="/chat"
          element={<ProtectedRoute><Chat /></ProtectedRoute>}
        />
         <Route
          path="/post/:postId"
          element={<ProtectedRoute><Post /></ProtectedRoute>}
        />
         <Route
          path="/write"
          element={<ProtectedRoute><Write /></ProtectedRoute>}
        />
        {/* ▲▲▲ 여기까지 ▲▲▲ */}

      </Routes>
  );
}

export default App;