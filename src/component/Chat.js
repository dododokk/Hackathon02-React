import React, { useContext, useMemo, useRef, useEffect, useState } from "react";
import styles from "../style/Chat.module.css";
import InnerTitle from "./InnerTitle";
import thumb from "../img/thumb.png";
import profile from "../img/profile.png";
import slash from "../img/slash.png";
import exit from "../img/exit.png";
import { perPersonKRW } from "../utils/price";
import { useNavigate, useLocation } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import { API_BASE } from "../config";

function Chat() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const roomId = state?.roomId;
    const { userId } = useContext(UserContext);           // 내 userId

    const [room, setRoom] = useState(null);   // 서버에서 받아올 방 데이터
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState(null);

    const [text, setText] = useState("");
    const listRef = useRef(null);

    const getAuthHeaders = () => {
        const token = localStorage.getItem("jwt");
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    // hh:mm 표시
    const fmt = (iso) => {
        try { return new Date(iso).toTimeString().slice(0, 5); }
        catch { return ""; }
    };

    useEffect(() => {
        if (!roomId) return;
        const controller = new AbortController();

        (async () => {
            try {
                setLoading(true);
                setErr(null);

                // 1) 채팅방 정보
                const resRoom = await fetch(`${API_BASE}/chatrooms/${roomId}`, {
                    method: "GET",
                    headers: { ...getAuthHeaders() },
                    credentials: "include",
                    signal: controller.signal,
                });
                if (!resRoom.ok) throw new Error(`Room HTTP ${resRoom.status}`);
                const roomData = await resRoom.json();
                setRoom(roomData);

                // 2) 메시지 목록
                const resMsg = await fetch(`${API_BASE}/chatrooms/${roomId}/messages`, {
                    method: "GET",
                    headers: { ...getAuthHeaders() },
                    credentials: "include",
                    signal: controller.signal,
                });
                if (!resMsg.ok) throw new Error(`Messages HTTP ${resMsg.status}`);
                const msgs = await resMsg.json();
                setMessages(Array.isArray(msgs) ? msgs : []);
            } catch (e) {
                if (e.name !== "AbortError") setErr(e);
            } finally {
                setLoading(false);
            }
        })();

        return () => controller.abort();
    }, [roomId]);

    // 새 메시지가 생기면 스크롤 맨 아래로
    useEffect(() => {
        if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
    }, [messages.length]);

    const onSubmit = (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        // 여기서 실제 전송 로직 연결하면 됨
        setText("");
    };

    if (loading) {
        return (
            <div className={styles.mainWrapper}>
                <InnerTitle />
                <p>불러오는 중...</p>
            </div>
        );
    }

    if (err) {
        return (
            <div className={styles.mainWrapper}>
                <InnerTitle />
                <p>에러 발생: {String(err.message)}</p>
            </div>
        );
    }

    if (!room) {
        return (
            <div className={styles.mainWrapper}>
                <InnerTitle />
                <p>채팅방을 찾을 수 없습니다.</p>
            </div>
        );
    }

    return (
        <div className={styles.mainWrapper}>
            <InnerTitle />
            <div className={styles.chatWrapper}>
                <article className={styles.card}>
                    <img className={styles.thumb} src={thumb} alt="" />
                    <div className={styles.right}>
                        <header className={styles.cardHead}>
                            <h3 className={styles.title}>{room.postTitle}</h3>
                            <img className={styles.exit} src={exit} alt="exit"
                                onClick={() => { navigate('/message') }} />
                        </header>

                        <div className={styles.under}>
                            <div className={styles.cardBody}>
                                <img src={profile} className={styles.profile} alt="" />
                                <span className={styles.people}>{room.desiredMemberCount}</span>
                            </div>

                            <aside className={styles.priceBox}>
                                <div className={styles.price}>
                                    {perPersonKRW(room.productDesc, room.desiredMemberCount)}
                                </div>
                                <img className={styles.slash} src={slash} alt="" />
                                <div className={styles.totalPrice}>total {room.productDesc}</div>
                            </aside>
                        </div>
                    </div>
                </article>

                <hr className={styles.hr} />

                {/* ====== 채팅 본문 / 입력바 추가 시작 ====== */}
                <div className={styles.chatBody}>
                    <div className={styles.messageList} ref={listRef}>
                        {messages.map((m, i) => {
                            const mine = m.senderId === 5;
                            const prev = messages[i - 1];
                            const showHeader = !mine && (!prev || prev.senderId !== m.senderId); // 연속 첫 메시지?

                            return (
                                <div
                                    key={m.messageId}
                                    className={`${styles.msgGroup} ${mine ? styles.me : styles.other}`}
                                >
                                    {/* 상대 메시지에서만: 프로필+닉네임을 같은 줄에 */}
                                    {showHeader && (
                                        <div className={styles.msgHeader}>
                                            <img src={profile} className={styles.msgAvatar} alt="" />
                                            <span className={styles.senderName}>{m.senderNickName}</span>
                                        </div>
                                    )}

                                    {/* 말풍선 (상대는 헤더 유무와 관계없이 항상 같은 들여쓰기) */}
                                    <div className={styles.bubble}>
                                        <div className={styles.msgText}>{m.content}</div>
                                        <time className={styles.msgTime}>{fmt(m.createdAt)}</time>
                                    </div>
                                </div>
                            );
                        })}
                    </div>


                    <form className={styles.composer} onSubmit={onSubmit}>
                        <input
                            className={styles.input}
                            placeholder="메시지 입력…"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />
                        <button type="submit" className={styles.sendBtn}>전송</button>
                    </form>
                </div>
                {/* ====== 채팅 본문 / 입력바 추가 끝 ====== */}
            </div>
        </div>
    );
}

export default Chat;
