import React, { useContext, useState } from "react";
import styles from "../style/Login.module.css";
import Title from "./Title";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { UserContext } from "../context/UserContext";
import Swal from "sweetalert2";
import { API_BASE } from "../config";
console.log("API_BASE =", API_BASE); // ✅ 여기서 undefined 아니어야 함

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

    const { setUserId, setUserDistinctId, setUserName, setUserInterest, setUserAddress } = useContext(UserContext);
    const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext);

    const handleIdChange = (e) => setInputId(e.target.value);
    const handlePwChange = (e) => setInputPw(e.target.value);

    const handleLogin = async () => {
        if (!inputId || !inputPw) {
            Swal.fire({
                icon: "warning",
                text: "아이디와 비밀번호를 모두 입력해주세요.",
                confirmButtonText: "확인",
                confirmButtonColor: "#1f8954ff"
            });
            return; // 로그인 진행 중단
        }

        // 서버 전송
        // 주석 처리 안하면 main으로 넘어갈 수가 없어서 나중에 아래 navigate 주석처리 후 아래 서버 주석 풀면 테스트 가능해여
        // navigate("/main");
        try {
            const res = await fetch(`https://hackathon02-api-production.up.railway.app/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: inputId,
                    password: inputPw,
                }),
            });

            if (res.status === 200) {
                const data = await res.json();

                // JWT 토큰
                const token = data.token || data; // 서버에서 {"token":"..."} 또는 그냥 문자열 반환할 수 있음
                localStorage.setItem("jwt", token);

                // 유저 정보 (예: userId, username, nickname) -> 나중에 변수명 확정되면 수정
                if (data.userId) setUserDistinctId(data.userId);
                if (data.username) setUserId(data.username);
                if (data.nickname) setUserName(data.nickname);
                if (data.interests) setUserInterest(data.interests);
                if (data.roadAddress) setUserAddress(data.roadAddress);

                //새로고침 대비
                //프로필도 로컬에 저장
                const userForPersist = {
                    username: data.username ?? null,
                    nickname: data.nickname ?? null,
                    interests: data.interests ?? [],
                    roadAddress: data.roadAddress ?? "",
                };
                localStorage.setItem("user", JSON.stringify(userForPersist));

                setIsLoggedIn(true);
                navigate("/main");
            } else if (res.status === 400) {
                console.error("400: Bad Request");
            } else if (res.status === 500) {
                console.error("500: 아이디/비번 불일치");
                Swal.fire({
                    icon: "error",
                    text: "아이디 또는 비밀번호가 잘못되었습니다.",
                    confirmButtonText: "확인",
                    confirmButtonColor: "#1f8954ff"
                });
            } else {
                console.error("로그인 실패");
            }
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className={styles.loginContain}>
            <Title />
            <div className={styles.login}>
                <div className={styles.loginT}>Login</div>
                <div>
                    <Input title="ID" type="text" value={inputId} onChange={handleIdChange}
                        placeholder="아이디를 입력해주세요..." />
                    <Input title="PW" type="password" value={inputPw} onChange={handlePwChange}
                        placeholder="비밀번호를 입력해주세요..." />
                </div>
                <div className={styles.bottomBar}>
                    <div className={styles.centerGroup}>
                        <span className={styles.notMember}>회원가입이 아직이신가요?</span>
                        <span className={styles.moveRegis} onClick={() => navigate('/register')}>회원가입</span>
                    </div>
                    <button className={styles.next} onClick={handleLogin}>Login &gt;</button>
                </div>
            </div>

        </div>
    );
}

export default Login;