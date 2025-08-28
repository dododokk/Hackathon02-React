import React, { useState, useEffect } from "react";
import styles from "../style/Message.module.css";
import InnerTitle from "./InnerTitle";
import folder from "../img/folder.png";
import message from "../img/message.png";
import profile from "../img/profile.png";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../config";

function Message() {
    const navigate = useNavigate();

    const [chatrooms, setChatrooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState(null);

    // JWT 가져오기
    const getAuthHeaders = () => {
        const token = localStorage.getItem("jwt");
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    const fmt = (iso) => {
        try { return new Date(iso).toTimeString().slice(0, 5); }
        catch { return ""; }
    };

    // 채팅방 목록 불러오기
    useEffect(() => {
        const controller = new AbortController();

        (async () => {
            try {
                setLoading(true);
                setErr(null);

                const res = await fetch(`${API_BASE}/me/chatrooms`, {
                    method: "GET",
                    headers: {
                        ...getAuthHeaders(),
                    },
                    credentials: "include",
                    signal: controller.signal,
                });

                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();

                setChatrooms(Array.isArray(data) ? data : []);
            } catch (e) {
                if (e.name !== "AbortError") setErr(e);
            } finally {
                setLoading(false);
            }
        })();

        return () => controller.abort();
    }, []);

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
    //나중에 서버에서 받기
    // const tempMessages = [
    //     {
    //         id: 1,
    //         title: "휴지 공구해서 반띵하실 분 구합니다!",
    //         people: 2,
    //         latestMessage: "반갑습니다~!",
    //         time: "오전 8:41",
    //         unread: 2
    //     },
    //     {
    //         id: 2,
    //         title: "탄산수 같이 구매하실 분",
    //         people: 3,
    //         latestMessage: "저요! 같이 사요 🙌",
    //         time: "오전 9:15",
    //         unread: 5
    //     },
    //     {
    //         id: 3,
    //         title: "치킨 공구 하실 분?",
    //         people: 4,
    //         latestMessage: "주문 완료했어요 🍗",
    //         time: "어제",
    //         unread: 0
    //     },
    //     {
    //         id: 4,
    //         title: "치킨 공구 하실 분?",
    //         people: 4,
    //         latestMessage: "주문 완료했어요 🍗",
    //         time: "어제",
    //         unread: 0
    //     },
    //     {
    //         id: 5,
    //         title: "치킨 공구 하실 분?",
    //         people: 4,
    //         latestMessage: "주문 완료했어요 🍗",
    //         time: "어제",
    //         unread: 0
    //     },
    //     {
    //         id: 6,
    //         title: "그만할래ㅐㅐ",
    //         people: 4,
    //         latestMessage: "언제잘수있을까",
    //         time: "어제",
    //         unread: 0
    //     },
    //     {
    //         id: 7,
    //         title: "스크롤 잘 되는지 확인",
    //         people: 4,
    //         latestMessage: "언제잘수있을까",
    //         time: "어제",
    //         unread: 0
    //     }
    // ];

    return (
        <div className={styles.mainWrapper}>
            <InnerTitle />
            <div
                className={styles.folderContainer}
                style={{ backgroundImage: `url(${folder})` }}
            >
                <div className={styles.messageHeader}>
                    <img src={message} className={styles.messageImg} alt="msg" />
                    <h2 className={styles.messageTitle}>채팅창</h2>
                </div>
                <hr className={styles.headerHr} />

                <div className={styles.messageList}>
                    {chatrooms.length === 0 && (
                        <p style={{ padding: "1rem" }}>참여 중인 채팅방이 없습니다.</p>
                    )}

                    {chatrooms.map((room) => (
                        <div
                            key={room.roomId}
                            className={styles.messageCard}
                            onClick={() =>
                                navigate("/chat", { state: { roomId: room.roomId } })
                            }
                        >
                            <img
                                src={room.postMainImageUrl || profile}
                                className={styles.profileImg}
                                alt="profile"
                            />
                            <div className={styles.messageContent}>
                                <div className={styles.messageTop}>
                                    <span className={styles.messageTitleText}>
                                        {room.postTitle ?? "제목 없음"}
                                    </span>
                                    <span className={styles.messagePeople}>
                                        {room.desiredMemberCount ?? 0}
                                    </span>
                                    <span className={styles.messageTime}>
                                        {fmt(room.lastMessage?.createdAt) ?? ""}
                                    </span>
                                </div>
                                <div className={styles.messageBottom}>
                                    <span className={styles.latestMessage}>
                                        {room.lastMessage?.content ?? ""}
                                    </span>
                                    {room.unreadCount > 0 && (
                                        <span className={styles.unreadBadge}>
                                            {room.unreadCount}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Message;