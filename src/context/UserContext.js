// src/context/UserContext.js

import React, { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext"; // AuthContext를 가져옵니다.
import { API_BASE } from "../config";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [userId, setUserId] = useState("");
    const [userName, setUserName] = useState("");
    const [userDistinctId, setUserDistinctId] = useState();
    const [userInterest, setUserInterest] = useState([]);
    const [userAddress, setUserAddress] = useState("");

    // AuthContext의 isLoggedIn 상태를 가져옵니다.
    const { isLoggedIn } = useContext(AuthContext);

    // isLoggedIn 상태가 true로 바뀌면(로그인 되면) 사용자 정보를 불러옵니다.
    useEffect(() => {
        if (isLoggedIn) {
            const token = localStorage.getItem("jwt");
            if (token) {
                fetch(`${API_BASE}/users/me`, { // 🚨 실제 내 정보 API 주소로 변경
                    headers: { Authorization: `Bearer ${token}` }
                })
                .then(res => {
                    if (!res.ok) throw new Error("사용자 정보 조회 실패");
                    return res.json();
                })
                .then(data => {
                    setUserId(data.username);
                    setUserName(data.nickname);
                    setUserInterest(data.interests);
                    setUserAddress(data.roadAddress);
                    // setUserDistinctId 등 필요한 정보 추가
                })
                .catch(err => {
                    console.error(err);
                    // 토큰이 유효하지 않을 경우 로그아웃 처리 등을 할 수 있습니다.
                });
            }
        }
    }, [isLoggedIn]); // isLoggedIn이 변경될 때마다 이 useEffect가 실행됩니다.


    return (
        <UserContext.Provider
            value={{
                userId, setUserId,
                userDistinctId, setUserDistinctId,
                userName, setUserName,
                userInterest, setUserInterest,
                userAddress, setUserAddress
            }}>
            {children}
        </UserContext.Provider>
    );
};