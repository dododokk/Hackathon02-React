import React from "react";
import styles from "../style/Login.module.css";
import Title from "./Title";

function Register(){
    return(
        <div>
            <Title></Title>
            <div className={styles.login}></div>
        </div>
    );
}

export default Register;