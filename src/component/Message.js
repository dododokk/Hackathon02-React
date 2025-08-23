import React from "react";
import styles from "../style/Message.module.css";
import InnerTitle from "./InnerTitle";
import folder from "../img/folder.png";

function Message() {
    return (
        <div className={styles.mainWrapper}>
            <InnerTitle />
            <div className={styles.folderContainer}>
                <img src={folder} className={styles.folder}></img>
            </div>
        </div>
    );
}

export default Message;