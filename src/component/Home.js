import React, { use } from "react";
import { useNavigate } from "react-router-dom";
import Title from "./Title";
import introImg from "../img/exampleIMG.png";
import background from "../img/background.png";
import styles from "../style/Home.module.css";

function Home() {
    const navigate = useNavigate();

    return (
        <div className={styles.Home}>
            <Title />
            <img src={introImg} className={styles.introImg} />
            <div className={styles.loginBtn}>
                <button className={styles.login} onClick={() => navigate("/login")}>
                    로그인
                </button>
                <span>|</span>
                <button className={styles.register} onClick={() => navigate("/register")}>회원가입</button>
            </div>
        </div>
    );
}

export default Home;
