import React from "react";
import styles from "../style/InnerTitle.module.css";
import Nav from "./Nav";
import { useNavigate } from "react-router-dom";
import { readAllFromStorage } from "../utils/readAllQuick";
import cart from "../img/cart.png";

function InnerTitle() {
    const navigate = useNavigate();

    const goHome = () => {
        readAllFromStorage();
        navigate('/main', { state: { category: "" } });
    };

    return (
        <header className={styles.header}>
            <div className={styles.topbar}></div>
            <div className={styles.headerdiv}>
                <div className={styles.headerR}>
                    <img src={cart} className={styles.cart}></img>
                    <h1 className={styles.title} onClick={goHome}>
                        MOA
                    </h1>
                </div>
                <Nav />
            </div>
        </header>
    );
}

export default InnerTitle;