// 전역으로 로그인 상태 관리
import React, { createContext, useContext, useState, useEffect } from "react";
import { UserContext } from "./UserContext";
import { API_BASE } from "../config";
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("jwt"));
  const [ready, setReady] = useState(false);
  const { setUserId, setUserName, setUserDistinctId, setUserInterest, setUserAddress } = useContext(UserContext);

  useEffect(() => {
    //로컬 user 선복원: 새로고침 직후 화면 공백/깜빡임 방지
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const u = JSON.parse(raw);
        setUserDistinctId(u.userId ?? "");
        setUserId(u.username ?? "");
        setUserName(u.nickname ?? "");
        setUserInterest(u.interests ?? []);
        setUserAddress(u.roadAddress ?? "");
      }
    } catch { }
    const token = localStorage.getItem("jwt");
    if (token) {
      setIsLoggedIn(true);
      fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          if (!res.ok) throw res;
          return res.json();
        })
        .then(data => {
          setUserDistinctId(data.userId);
          setUserId(data.username);
          setUserName(data.nickname);
          setUserInterest(data.interests);
          setUserAddress(data.roadAddress);
          // 서버 최신값으로 로컬 업데이트(다음 새로고침 대비)
          localStorage.setItem("user", JSON.stringify({
            userId: data.userId ?? null,
            username: data.username ?? null,
            nickname: data.nickname ?? null,
            interests: data.interests ?? [],
            roadAddress: data.roadAddress ?? "",
          }));
        })
        .catch(async (err) => {
          // ❗오류 원인에 따라 분기
          // fetch.then에서 throw한 Response가 들어오면 status가 있음
          const status = err?.status ?? 0;
          if (status === 401 || status === 403) {
            // ▶️ 진짜 인증 만료/무효: 확실히 로그아웃
            localStorage.removeItem("jwt");
            localStorage.removeItem("user");
            setIsLoggedIn(false);
            setUserDistinctId();
            setUserId("");
            setUserName("");
            setUserInterest([]);
            setUserAddress("");
          } else {
            // ▶️ 네트워크 오류/5xx/CORS 등: "로그인 유지"만 하고 넘어감
            // (로컬 user 선복원 값으로 계속 화면 유지)
            setIsLoggedIn(!!localStorage.getItem("jwt"));
          }
        })
        .finally(() => setReady(true));
    } else {
      setReady(true);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, ready }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);