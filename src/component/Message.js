import React from "react";
import styles from "../style/Message.module.css";
import InnerTitle from "./InnerTitle";

function Message() {
    return (
        <div className={styles.mainWrapper}>
            <InnerTitle />
            <div className={styles.messageList}>
                
            </div>
        </div>
    );
}

export default Message;