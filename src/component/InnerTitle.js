import React from "react";
import styles from "../style/InnerTitle.module.css";
import Nav from "./Nav";
import { useNavigate } from "react-router-dom";
import { readAllFromStorage } from "../utils/readAllQuick"; // ✅ 추가

function InnerTitle() {
    const navigate = useNavigate();

    const goHome = () => {
        // ✅ 현재 채팅방 있으면 unread=0 처리
        readAllFromStorage();
        // ✅ 메인 이동
        navigate('/main', { state: { category: "" } });
    };

    return (
        <header className={styles.header}>
            <div className={styles.headerdiv}>
                <h1 className={styles.title} onClick={goHome}>
                    MOA
                </h1>
                <Nav />
            </div>
        </header>
    );
}

export default InnerTitle;