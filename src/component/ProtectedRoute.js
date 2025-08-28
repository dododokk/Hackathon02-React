// src/component/ProtectedRoute.js (새 파일)

import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Swal from 'sweetalert2';

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useContext(AuthContext);
  const location = useLocation();

  // 만약 로그인 상태가 아니라면,
  if (!isLoggedIn) {
    // 사용자가 원래 가려던 경로를 state에 저장해두면,
    // 로그인 성공 후 그 페이지로 다시 보내줄 수 있습니다. (선택사항)
    Swal.fire({
        icon: "warning",
        text: "로그인이 필요한 서비스입니다.",
        confirmButtonText: "확인",
        confirmButtonColor: "#1f8954ff"
    });
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // 로그인 상태라면, 요청한 페이지를 그대로 보여줍니다.
  return children;
};

export default ProtectedRoute;