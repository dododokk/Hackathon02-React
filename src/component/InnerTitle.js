import React from "react";
import styles from "../style/InnerTitle.module.css";
import Nav from "./Nav";

function InnerTitle() {
    return (
        <header className={styles.header}>
            <h1 className={styles.title}>MOA</h1>
            <Nav />
        </header>
    );
}

export default InnerTitle;