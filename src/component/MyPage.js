import React from "react";
import styles from "../style/MyPage.module.css";
import InnerTitle from "./InnerTitle";

function MyPage(){
    return(
        <div className={styles.mainWrapper}>
            <InnerTitle/>
        </div>
    );
}

export default MyPage;