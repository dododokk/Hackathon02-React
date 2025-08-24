import React, { useState } from "react";
import styles from "../style/Notification.module.css";
import InnerTitle from "./InnerTitle";
import folder from "../img/folder.png";
import notification from "../img/notification.png";
import thumb from "../img/thumb.png";

function Notification() {

    const tempData = [
        {
            id: 1,
            content: "신청 중이던 게시물이 삭제되었습니다.",
            postTitle: "휴지 공구해서 반띵하실 분 구합니다!",
            people: "1/2명",
            price: "5,600원",
            img: thumb,
            isRead: false,
        },
        {
            id: 2,
            content: "신청 중이던 게시물의 인원 모집이 완료되었습니다!",
            postTitle: "휴지 공구해서 반띵하실 분 구합니다!",
            people: "1/2명",
            price: "5,600원",
            img: thumb,
            isRead: true,
        },
        {
            id: 3,
            content: "새로운 댓글이 달렸습니다.",
            postTitle: "탄산수 같이 구매하실 분",
            people: "2/3명",
            price: "3,200원",
            img: thumb,
            isRead: true,
        },
        {
            id: 4,
            content: "새로운 댓글이 달렸습니다.",
            postTitle: "탄산수 같이 구매하실 분",
            people: "2/3명",
            price: "3,200원",
            img: thumb,
            isRead: false,
        }
    ];

    const [readStates, setReadStates] = useState(
        tempData.reduce((acc, noti) => {
            acc[noti.id] = noti.isRead; // ✅ tempdata에서 준 isRead로 초기화
            return acc;
        }, {})
    );

    const markAsRead = (id) => {
        setReadStates((prev) => ({
            ...prev,
            [id]: true, // 강제로 읽음으로 설정
        }));
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
                    {tempData.map((noti) => (
                        <div key={noti.id} className={styles.notificationCard}>
                            {/* 빨간 점 (안읽음일 경우만) */}
                            {/* {!readStates[noti.id] && <span className={styles.unreadDot}></span>} */}

                            <div className={styles.notificationTop}>
                                <p className={styles.notificationContent}>{noti.content}</p>
                                <button
                                    className={styles.readButton}
                                    onClick={() => markAsRead(noti.id)}
                                    disabled={readStates[noti.id]} // 읽음이면 비활성화
                                >
                                    {readStates[noti.id] ? "읽음" : "안읽음"}
                                </button>
                            </div>

                            <div className={styles.postInfo}>
                                <img src={noti.img} alt="post" className={styles.postImg} />
                                <div className={styles.postDetail}>
                                    <span className={styles.postTitle}>{noti.postTitle}</span>
                                    <span className={styles.postPeople}>{noti.people}</span>
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