import React from "react";
import styles from "../style/Notification.module.css";
import InnerTitle from "./InnerTitle";
import folder from "../img/folder.png";
import notification from "../img/notification.png";

function Message() {
    return (
        <div className={styles.mainWrapper}>
            <InnerTitle />
            <div className={styles.folderContainer} style={{ backgroundImage: `url(${folder})` }}>
                <div className={styles.notificationHeader}>
                    <img src={notification} className={styles.notificationImg} />
                    <h2 className={styles.notificationTitle}>알림</h2>
                </div>
                <hr className={styles.headerHr} />

            </div>
        </div>
    );
}

export default Message;