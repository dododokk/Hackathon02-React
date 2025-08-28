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
import { API_BASE, WS_BASE } from "../config";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

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
    const stompClientRef = useRef(null);

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

    useEffect(() => {
        if (!roomId) return;
        const token = localStorage.getItem("jwt");
        if (!token) return;

        const client = new Client({
            // SockJS 엔드포인트: 반드시 /api 미포함
            webSocketFactory: () => new SockJS(`${WS_BASE}/ws`, null, { transports: ['websocket', 'xhr-streaming', 'xhr-polling'] }),
            connectHeaders: { Authorization: `Bearer ${token}` },
            // 안정성 옵션
            reconnectDelay: 3000,               // 재연결 간격(ms)
            heartbeatIncoming: 10000,           // 서버->클라이언트 하트비트
            heartbeatOutgoing: 10000,           // 클라이언트->서버 하트비트
            debug: (str) => console.log("[STOMP]", str),
            onConnect: () => {
                console.log("✅ STOMP Connected");
                client.subscribe(`/sub/chatrooms/${roomId}`, (msg) => {
                    try {
                        const body = JSON.parse(msg.body);
                        console.log("📩 incoming:", body);

                        // messageId 기준 중복 제거
                        setMessages((prev) => {
                            const id = body.messageId ?? `${body.senderId}-${body.createdAt}-${body.content}`;
                            if (prev.some(m => (m.messageId ?? `${m.senderId}-${m.createdAt}-${m.content}`) === id)) {
                                return prev;
                            }
                            return [...prev, body];
                        });
                    } catch (e) {
                        console.error("parse error:", e, msg.body);
                    }
                    
                });
            },
            onWebSocketClose: (evt) => {
                console.warn("🔌 WS closed:", evt?.code, evt?.reason);
            },
            onStompError: (frame) => {
                console.error("❌ STOMP Error:", frame);
            },
        });

        client.activate();
        stompClientRef.current = client;

        // 탭 비활성화 시 하트비트 중단을 피하기 위한 가벼운 처리 (선택)
        const onVisibility = () => {
            if (document.visibilityState === "visible" && client && !client.connected) {
                client.activate();
            }
        };
        document.addEventListener("visibilitychange", onVisibility);

        return () => {
            document.removeEventListener("visibilitychange", onVisibility);
            client.deactivate(); // 연결 정리
        };
    }, [roomId, WS_BASE]);


    // 메시지 전송
    const onSubmit = (e) => {
        e.preventDefault();
        if (!text.trim() || !stompClientRef.current) return;

        const client = stompClientRef.current;

        if (!client.connected) {
            console.warn("STOMP 연결이 아직 준비되지 않았습니다.");
            return;
        }

        // 1) 낙관적 메시지 - 화면에 즉시 추가
        const tmpId = `tmp-${Date.now()}`;
        const optimistic = {
            messageId: tmpId,
            senderId: userId,
            senderNickName: "나",
            content: text,
            createdAt: new Date().toISOString(),
            _optimistic: true,
        };
        setMessages(prev => [...prev, optimistic]);


        client.publish({
            destination: `/pub/chatrooms/${roomId}/send`,
            body: JSON.stringify({
                senderId: userId,
                content: text,
            }),
            headers: {
                Authorization: `Bearer ${localStorage.getItem("jwt")}`,
                // 2) 서버까지 도달했는지 확인하고 싶으면 receipt 사용 (선택)+    
                receipt: tmpId,
            },
        });

        // 3) receipt 수신 시(선택): 성공만 로깅 (실패 시 서버에서 ERROR frame)
        client.onReceipt = (frame) => {
            if (frame?.headers?.["receipt-id"] === tmpId) {
                console.log("✅ delivered:", tmpId);
            }
        };

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
                            const mine = m.senderId === userId;
                            const prev = messages[i - 1];
                            const showHeader = !mine && (!prev || prev.senderId !== m.senderId);

                            return (
                                <div
                                    key={m.messageId || `${m.senderId}-${m.createdAt || i}`}
                                    className={`${styles.msgGroup} ${mine ? styles.me : styles.other}`}
                                >
                                    {showHeader && (
                                        <div className={styles.msgHeader}>
                                            <img src={profile} className={styles.msgAvatar} alt="" />
                                            <span className={styles.senderName}>{m.senderNickName}</span>
                                        </div>
                                    )}
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
