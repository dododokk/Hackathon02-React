// src/component/PrivateRoute.js
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext"; // 경로는 프로젝트 구조에 맞게

export default function PrivateRoute({ children }) {
  const { isLoggedIn, ready } = useContext(AuthContext);
  if (!ready) return null;               // 초기 복원이 끝날 때까지 렌더 보류
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}
