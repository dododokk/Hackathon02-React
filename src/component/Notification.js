import React, { useState, useEffect } from "react";
import styles from "../style/Notification.module.css";
import InnerTitle from "./InnerTitle";
import folder from "../img/folder.png";
import notification from "../img/notification.png";
import thumb from "../img/thumb.png";
import { API_BASE } from "../config";

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
        // setReadStates((prev) => ({
        //     ...prev,
        //     [id]: true, // 강제로 읽음으로 설정
        // }));
        try {
            const token = localStorage.getItem("jwt");
            const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.ok) {
                // 서버 성공 응답이면 로컬 상태 업데이트
                setReadStates((prev) => ({
                    ...prev,
                    [id]: true,
                }));
            } else {
                console.error("읽음 처리 실패:", res.status);
            }
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
                <hr className={styles.headerHr} />

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