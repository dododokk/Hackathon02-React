import React from "react";
import InnerTitle from "./InnerTitle";
import styles from "../style/Main.module.css";

function Main() {
    return (
        <div className={styles.mainWrapper}>
            <InnerTitle/>
        </div>
    );
}

export default Main;