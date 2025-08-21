import React, { useState } from "react";
import styles from "../style/Login.module.css";
import Title from "./Title";
import { useNavigate } from "react-router-dom";

function Input(props) {
    return (
        <div className={styles.loginElement}>
            <div className={styles.inputRow}>
                <span className={styles.loginTitle}>{props.title}</span>
                <input className={styles.loginInput} type={props.type} value={props.value} onChange={props.onChange}
                    placeholder={props.placeholder} />
            </div>
        </div>
    )
}

function Login() {
    const navigate = useNavigate();
    const [inputId, setInputId] = useState("");
    const [inputPw, setInputPw] = useState("");

    const handleIdChange = (e) => setInputId(e.target.value);
    const handlePwChange = (e) => {
        setInputPw(e.target.value);
    };

    return (
        <div className={styles.loginContain}>
            <Title />
            <div className={styles.login}>
                <div className={styles.loginT}>Login</div>
                <Input title="ID" type="text" value={inputId} onChange={handleIdChange}
                    placeholder="아이디를 입력해주세요..." />
                <Input title="PW" type="password" value={inputPw} onChange={handlePwChange}
                    placeholder="비밀번호를 입력해주세요..." />
                <div className={styles.bottomBar}>
                    <div className={styles.centerGroup}>
                        <span className={styles.notMember}>회원가입이 아직이신가요?</span>
                        <span className={styles.moveRegis} onClick={() => navigate('/register')}>회원가입</span>
                    </div>
                    <button className={styles.next} onClick={() => navigate('/home')}>Login &gt;</button>
                </div>
            </div>

        </div>
    );
}

export default Login;