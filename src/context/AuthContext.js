// 전역으로 로그인 상태 관리
import React, { createContext, useContext, useState, useEffect } from "react";
import { UserContext } from "./UserContext";
import { API_BASE } from "../config";
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const {setUserId, setUserName, setUserInterest, setUserAddress } = useContext(UserContext);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (token) {
      setIsLoggedIn(true);
      fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          setUserId(data.username);
          setUserName(data.nickname);
          setUserInterest(data.interests);
          setUserAddress(data.roadAddress);
        });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);