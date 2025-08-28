import { API_BASE } from "../config";

// NOTE: 서버 라우팅이 '/api/chatrooms'라면 아래 URL에 '/api' 포함.
// 당신 프로젝트에 맞게 한 줄만 맞추면 됨.
const urlOf = (rid) => `${API_BASE}/chatrooms/${rid}/read-all`;

export function readAllFromStorage() {
  const rid = localStorage.getItem("currentChatRoomId");
  if (!rid) return;
  try {
    // 기다리지 않고 그냥 쏘고 화면 전환 (fire-and-forget)
    fetch(urlOf(rid), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("jwt")}`,
      },
      credentials: "include",
      body: "{}", // 서버가 바디 안 써도 OK
    }).catch((e) => console.warn("read-all nav failed:", e));
  } catch (e) {
    console.warn("read-all nav failed:", e);
  }
}