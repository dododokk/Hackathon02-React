import React from "react";
import styles from "../style/InnerTitle.module.css";
import Nav from "./Nav";

function InnerTitle() {
    return (
        <header className={styles.header}>
            <div className={styles.headerdiv}>
            <h1 className={styles.title}>MOA</h1>
            <Nav />
            </div>
        </header>
    );
}

export default InnerTitle;