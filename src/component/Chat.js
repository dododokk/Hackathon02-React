import React from "react";
import styles from "../style/Chat.module.css";
import InnerTitle from "./InnerTitle";
import { useNavigate, useLocation} from "react-router-dom";

function Chat() {
    const navigate = useNavigate();
    const {state} = useLocation();
    const msgId = state?.msgId;

    return (
        <div className={styles.mainWrapper}>
            <InnerTitle/>
            <div className={styles.chatWrapper}>

            </div>
        </div>
    );
}

export default Chat;