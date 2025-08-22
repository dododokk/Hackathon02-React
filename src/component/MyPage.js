import React from "react";
import styles from "../style/MyPage.module.css";
import InnerTitle from "./InnerTitle";
import profile from "../img/profile.png";

function MyPage(){
    return(
        <div className={styles.mainWrapper}>
            <InnerTitle/>
            <div className={styles.myInfo}>
                <img src={profile} className={styles.profile} />
                <p>ID</p>
            </div>
        </div>
    );
}

export default MyPage;