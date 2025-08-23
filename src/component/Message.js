import React from "react";
import styles from "../style/Message.module.css";
import InnerTitle from "./InnerTitle";
import folder from "../img/folder.png";
import message from "../img/message.png";

function Message() {
    return (
        <div className={styles.mainWrapper}>
            <InnerTitle />
            <div className={styles.folderContainer} style={{ backgroundImage: `url(${folder})` }}>
                <div className={styles.messageHeader}>
                    <img src={message} className={styles.messageImg} />
                    <h2 className={styles.messageTitle}>채팅창</h2>
                </div>
                <hr className={styles.headerHr}/>
            </div>
        </div>
    );
}

export default Message;