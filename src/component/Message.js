import React from "react";
import styles from "../style/Message.module.css";
import InnerTitle from "./InnerTitle";
import folder from "../img/folder.png";
import message from "../img/message.png";
import profile from "../img/profile.png";

function Message() {
    //나중에 서버에서 받기
    const tempMessages = [
        {
            id: 1,
            title: "휴지 공구해서 반띵하실 분 구합니다!",
            people: 2,
            latestMessage: "반갑습니다~!",
            time: "오전 8:41",
            unread: 2
        },
        {
            id: 2,
            title: "탄산수 같이 구매하실 분",
            people: 3,
            latestMessage: "저요! 같이 사요 🙌",
            time: "오전 9:15",
            unread: 5
        },
        {
            id: 3,
            title: "치킨 공구 하실 분?",
            people: 4,
            latestMessage: "주문 완료했어요 🍗",
            time: "어제",
            unread: 0
        },
        {
            id: 4,
            title: "치킨 공구 하실 분?",
            people: 4,
            latestMessage: "주문 완료했어요 🍗",
            time: "어제",
            unread: 0
        },
        {
            id: 5,
            title: "치킨 공구 하실 분?",
            people: 4,
            latestMessage: "주문 완료했어요 🍗",
            time: "어제",
            unread: 0
        },
        {
            id: 6,
            title: "그만할래ㅐㅐ",
            people: 4,
            latestMessage: "언제잘수있을까",
            time: "어제",
            unread: 0
        },
        {
            id: 7,
            title: "스크롤 잘 되는지 확인",
            people: 4,
            latestMessage: "언제잘수있을까",
            time: "어제",
            unread: 0
        }
    ];

    return (
        <div className={styles.mainWrapper}>
            <InnerTitle />
            <div className={styles.folderContainer} style={{ backgroundImage: `url(${folder})` }}>
                <div className={styles.messageHeader}>
                    <img src={message} className={styles.messageImg} />
                    <h2 className={styles.messageTitle}>채팅창</h2>
                </div>
                <hr className={styles.headerHr} />

                <div className={styles.messageList}>
                    {tempMessages.map(msg => (
                        <div key={msg.id} className={styles.messageCard}>
                            <img src={profile} className={styles.profileImg} alt="profile" />
                            <div className={styles.messageContent}>
                                <div className={styles.messageTop}>
                                    <span className={styles.messageTitleText}>{msg.title}</span>
                                    <span className={styles.messagePeople}>{msg.people}</span>
                                    <span className={styles.messageTime}>{msg.time}</span>
                                </div>
                                <div className={styles.messageBottom}>
                                    <span className={styles.latestMessage}>{msg.latestMessage}</span>
                                    {msg.unread > 0 && (
                                        <span className={styles.unreadBadge}>{msg.unread}</span>
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