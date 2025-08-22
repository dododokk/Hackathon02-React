// 전역으로 로그인 상태 관리
import React, { createContext, useContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider=({children})=>{
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    //나중에 서버에서 로그인 여부 받아올 예정.
    return(
        <AuthContext.Provider value={{isLoggedIn, setIsLoggedIn}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);