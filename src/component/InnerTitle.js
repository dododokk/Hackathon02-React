import React from "react";
import styles from "../style/InnerTitle.module.css";
import Nav from "./Nav";
import { useNavigate } from "react-router-dom";

function InnerTitle() {
    const navigate = useNavigate();

    return (
        <header className={styles.header}>
            <div className={styles.headerdiv}>
            <h1 className={styles.title} 
            onClick={()=>navigate('/main', {state: {category: ""}})}>MOA</h1>
            <Nav />
            </div>
        </header>
    );
}

export default InnerTitle;