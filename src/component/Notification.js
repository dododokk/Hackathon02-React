import React, { useState, useEffect } from "react";
import styles from "../style/Notification.module.css";
import InnerTitle from "./InnerTitle";
import folder from "../img/fold.png";
import notification from "../img/notification.png";
import thumb from "../img/thumb.png";
import { API_BASE } from "../config";
import { useUnread } from "../context/UnreadContext";

function Notification() {

    // const tempData = [
    //     {
    //         "id": 987,                                  // 알림 PK (커서/읽음 처리용)
    //         "type": "POST_APPLIED",
    //         "title": "새로운 신청이 도착했어요",
    //         "message": "민석님이 게시글에 신청했습니다.",
    //         "refPostId": 55,                             // 관련 게시글 PK
    //         "postTitle": "한강 피크닉 같이 가실 분 구해요",   // 게시글 제목
    //         "currentMemberCount": 3,                    // 신청 인원(작성자 1 + 승인 인원)
    //         "desiredMemberCount": 5,                    // 모집 인원
    //         "price": 15900,                             // 가격(숫자, KRW)
    //         "imageUrl": "https://cdn.example.com/pic.jpg", // 대표 이미지 1개
    //         "isRead": false,
    //         "createdAt": "2025-08-24T04:30:12Z"
    //     }
    // ];

    //서버 연결
    const [notifications, setNotifications] = useState([]);
    const [readStates, setReadStates] = useState({});
    const { setUnreadNotis } = useUnread();

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const token = localStorage.getItem("jwt"); // 로그인 시 저장한 토큰
                const res = await fetch(`${API_BASE}/notifications`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                });

                if (res.ok) {
                    const data = await res.json();
                    setNotifications(data.items || []);
                    setReadStates(
                        (data.items || []).reduce((acc, noti) => {
                            acc[noti.id] = noti.isRead;
                            return acc;
                        }, {})
                    );
                    const totalUnread = data.items.filter(noti => !noti.isRead).length;
                    setUnreadNotis(totalUnread);
                } else {
                    console.error("알림 불러오기 실패:", res.status);
                }
            } catch (error) {
                console.error("알림 조회 에러:", error);
            }
        };

        fetchNotifications();
    }, []);

    const markAsRead = async (id) => {
        try {
            const token = localStorage.getItem("jwt");
            const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                console.error("읽음 처리 실패:", res.status);
                return;
            }

            // 204 No Content 대비
            if (res.status === 204 || res.headers.get("Content-Length") === "0") {
                // 서버가 바디를 안 주면, 우리가 이미 가진 id로 로컬 상태만 갱신
                setReadStates((prev) => ({ ...prev, [id]: true }));
                setNotifications((prev) =>
                    prev.map((n) => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
                );
                return;
            }

            // 바디가 있는 경우에만 안전 파싱
            const text = await res.text(); // 바디가 빈 문자열일 수도 있음
            if (!text) {
                setReadStates((prev) => ({ ...prev, [id]: true }));
                setNotifications((prev) =>
                    prev.map((n) => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
                );
                return;
            }

            const json = JSON.parse(text);
            // 백엔드 응답 형태: { data: {...} } 또는 바로 {...}
            const updated = json?.data ?? json;

            if (!updated || updated.id == null) {
                // 그래도 안전하게 로컬 갱신
                setReadStates((prev) => ({ ...prev, [id]: true }));
                setNotifications((prev) =>
                    prev.map((n) => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
                );
                return;
            }

            // 정상적으로 내려온 경우 서버 값 반영
            setReadStates((prev) => ({ ...prev, [updated.id]: !!updated.isRead }));
            setNotifications((prev) =>
                prev.map((n) =>
                    n.id === updated.id ? { ...n, isRead: !!updated.isRead, readAt: updated.readAt ?? n.readAt } : n
                )
            );
        } catch (error) {
            console.error("읽음 처리 에러:", error);
        }
    };

    return (
        <div className={styles.mainWrapper}>
            <InnerTitle />
            <div className={styles.folderContainer} style={{ backgroundImage: `url(${folder})` }}>
                <div className={styles.notificationHeader}>
                    <img src={notification} className={styles.notificationImg} />
                    <h2 className={styles.notificationTitle}>알림</h2>
                </div>

                <div className={styles.notificationList}>
                    {notifications.map((noti) => (
                        <div key={noti.id} className={styles.notificationCard}>
                            {/* 빨간 점 (안읽음일 경우만) */}
                            {/* {!readStates[noti.id] && <span className={styles.unreadDot}></span>} */}

                            <div className={styles.notificationTop}>
                                <p className={styles.notificationContent}>{noti.title}</p>
                                <button
                                    className={styles.readButton}
                                    onClick={() => markAsRead(noti.id)}
                                    disabled={readStates[noti.id]} // 읽음이면 비활성화
                                >
                                    {readStates[noti.id] ? "읽음" : "안읽음"}
                                </button>
                            </div>

                            <div className={styles.postInfo}>
                                <img src={noti.imageUrl} alt="post" className={styles.postImg} />
                                <div className={styles.postDetail}>
                                    <span className={styles.postTitle}>{noti.postTitle}</span>
                                    <span className={styles.postPeople}>{noti.currentMemberCount}/{noti.desiredMemberCount}</span>
                                    <span className={styles.postPrice}>{noti.price}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Notification;