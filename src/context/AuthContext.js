// src/context/AuthContext.js

import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // AuthProvider는 오직 'isLoggedIn' 상태만 관리합니다.
  useEffect(() => {
    // 앱이 처음 로드될 때 localStorage에서 토큰을 확인합니다.
    const token = localStorage.getItem("jwt");
    if (token) {
      // 토큰이 있으면 로그인 상태로 설정합니다.
      setIsLoggedIn(true);
    }
  }, []); // 최초 1회만 실행

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};