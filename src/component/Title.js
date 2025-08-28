import React from "react";
import styles from "../style/Title.module.css";

function Title() {
    return (
        <header className={styles.header}>
            <div className={styles.topbar}></div>
            <div className={styles.headerdiv}>
                <h1 className={styles.title}>MOA</h1>
                <p className={styles.subtitle}>혼자사는 사람들을 위한 공동구매 사이트</p>
            </div>
        </header>
    );
}

export default Title;