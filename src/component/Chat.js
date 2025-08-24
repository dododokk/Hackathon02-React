import React from "react";
import styles from "../style/Chat.module.css";
import InnerTitle from "./InnerTitle";
import { useNavigate } from "react-router-dom";

function Chat() {
    const navigate = useNavigate();

    return (
        <div className={styles.mainWrapper}>
            <InnerTitle/>
            <div className={styles.chatWrapper}>

            </div>
        </div>
    );
}

export default Chat;