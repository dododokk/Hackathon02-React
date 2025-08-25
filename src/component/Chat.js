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

function Chat() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const msgId = state?.msgId;
    const { userId } = useContext(UserContext);           // 내 userId

    const [text, setText] = useState("");
    const listRef = useRef(null);

    const tempData = {
        "roomId": 12,
        "postId": 3,
        "roomTitle": "한강 피크닉 같이 가실 분 구해요",   // 게시글 제목과 동일
        "memberCapacity": 5,                               // 게시글 모집 인원과 동일
        "currentMemberCount": 3,
        "role": "MEMBER",                                  // HOST | MEMBER
        "hostId": 7,
        "productDesc": "11,200",

        "members": [
            { "userId": 7, "nickname": "호스트", "profileImageUrl": null },
            { "userId": 2, "nickname": "민석", "profileImageUrl": null },
            { "userId": 3, "nickname": "상훈", "profileImageUrl": null }
        ],

        "lastMessageAt": "2025-08-24T01:55:12+09:00",
        "lastMessageId": 1042,

        "ws": {
            "endpoint": "ws://{host}/ws",
            "subscribe": "/sub/chatrooms/12",
            "publish": "/pub/chatrooms/12/send"
        },

        "messages": [
            {
                "messageId": 1040,
                "senderId": 2,
                "senderName": "도동",
                "content": "아 지짜 언제 끝나요",
                "createdAt": "2025-08-24T01:50:00+09:00",
                "mine": false
            },
            {
                "messageId": 1040,
                "senderId": 2,
                "senderName": "도동",
                "content": "집갈래",
                "createdAt": "2025-08-24T01:50:00+09:00",
                "mine": false
            },
            {
                "messageId": 1042,
                "senderId": 9,
                "senderName": "야이수호",
                "content": "일해라",
                "createdAt": "2025-08-24T01:55:12+09:00",
                "mine": false
            },
            {
                "messageId": 1042,
                "senderId": 9,
                "senderName": "야이수호",
                "content": "일해라",
                "createdAt": "2025-08-24T01:55:12+09:00",
                "mine": false
            },
            {
                "messageId": 1042,
                "senderId": 9,
                "senderName": "야이수호",
                "content": "일해라",
                "createdAt": "2025-08-24T01:55:12+09:00",
                "mine": false
            },
            {
                "messageId": 1042,
                "senderId": 9,
                "senderName": "야이수호",
                "content": "일해라",
                "createdAt": "2025-08-24T01:55:12+09:00",
                "mine": false
            },
            {
                "messageId": 1042,
                "senderId": 9,
                "senderName": "야이수호",
                "content": "일해라",
                "createdAt": "2025-08-24T01:55:12+09:00",
                "mine": false
            },
            {
                "messageId": 1042,
                "senderId": 9,
                "senderName": "야이수호",
                "content": "일해라",
                "createdAt": "2025-08-24T01:55:12+09:00",
                "mine": false
            },
            {
                "messageId": 1042,
                "senderId": 9,
                "senderName": "야이수호",
                "content": "일해라",
                "createdAt": "2025-08-24T01:55:12+09:00",
                "mine": false
            },
            {
                "messageId": 1042,
                "senderId": 9,
                "senderName": "야이수호",
                "content": "일해라",
                "createdAt": "2025-08-24T01:55:12+09:00",
                "mine": false
            },
            {
                "messageId": 1042,
                "senderId": 9,
                "senderName": "야이수호",
                "content": "일해라",
                "createdAt": "2025-08-24T01:55:12+09:00",
                "mine": false
            },
            {
                "messageId": 1042,
                "senderId": 9,
                "senderName": "야이수호",
                "content": "일해라",
                "createdAt": "2025-08-24T01:55:12+09:00",
                "mine": false
            },
            {
                "messageId": 1042,
                "senderId": 9,
                "senderName": "야이수호",
                "content": "일해라",
                "createdAt": "2025-08-24T01:55:12+09:00",
                "mine": false
            },
            {
                "messageId": 1042,
                "senderId": 9,
                "senderName": "야이수호",
                "content": "일해라",
                "createdAt": "2025-08-24T01:55:12+09:00",
                "mine": false
            },
            {
                "messageId": 1042,
                "senderId": 9,
                "senderName": "야이수호",
                "content": "일해라",
                "createdAt": "2025-08-24T01:55:12+09:00",
                "mine": false
            },
            {
                "messageId": 1042,
                "senderId": 5,
                "senderName": "정정화진",
                "content": "이수호 바부",
                "createdAt": "2025-08-24T01:55:12+09:00",
                "mine": false
            }
        ]
    }

    // hh:mm 표시
    const fmt = (iso) => {
        try { return new Date(iso).toTimeString().slice(0, 5); }
        catch { return ""; }
    };

    // 새 메시지가 생기면 스크롤 맨 아래로
    useEffect(() => {
        if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
    }, [tempData.messages?.length]);

    const onSubmit = (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        // 여기서 실제 전송 로직 연결하면 됨
        setText("");
    };


    return (
        <div className={styles.mainWrapper}>
            <InnerTitle />
            <div className={styles.chatWrapper}>
                <article className={styles.card}>
                    <img className={styles.thumb} src={thumb} alt="" />
                    <div className={styles.right}>
                        <header className={styles.cardHead}>
                            <h3 className={styles.title}>{tempData.roomTitle}</h3>
                            <img className={styles.exit} src={exit} alt="exit"
                            onClick={()=>{navigate('/message')}} />
                        </header>

                        <div className={styles.under}>
                            <div className={styles.cardBody}>
                                <img src={profile} className={styles.profile} alt="" />
                                <span className={styles.people}>{tempData.memberCapacity}</span>
                            </div>

                            <aside className={styles.priceBox}>
                                <div className={styles.price}>
                                    {perPersonKRW(tempData.productDesc, tempData.memberCapacity)}
                                </div>
                                <img className={styles.slash} src={slash} alt="" />
                                <div className={styles.totalPrice}>total {tempData.productDesc}</div>
                            </aside>
                        </div>
                    </div>
                </article>

                <hr className={styles.hr} />

                {/* ====== 채팅 본문 / 입력바 추가 시작 ====== */}
                <div className={styles.chatBody}>
                    <div className={styles.messageList} ref={listRef}>
                        {tempData.messages.map((m, i) => {
                            const mine = m.senderId === 5;
                            const prev = tempData.messages[i - 1];
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
                                            <span className={styles.senderName}>{m.senderName}</span>
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
