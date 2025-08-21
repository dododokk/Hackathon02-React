import React, { use, useState } from "react";
import styles from "../style/Register.module.css";
import Title from "./Title";
import { useNavigate } from "react-router-dom";

function Input(props) {
    return (
        <div className={styles.regisElement}>
            <div className={styles.inputRow}>
                <span className={styles.regisTitle}>{props.title}</span>
                <input className={styles.regisInput} type={props.type} value={props.value} onChange={props.onChange}
                    placeholder={props.placeholder} />
            </div>
            {props.warning && (
                <p id={props.check ? styles.warning : styles.safe}>
                    {props.warning}
                </p>
            )}
        </div>
    )
}

function Register() {
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [inputId, setInputId] = useState("");
    const [inputPw, setInputPw] = useState("");
    const [confirmPw, setConfirmPw] = useState("");
    const [inputName, setInputName] = useState("");
    const [checkPw, setCheckPw] = useState(false);
    const [gender, setGender] = useState("");
    const [age, setAge] = useState("");
    const [interests, setInterests] = useState([]);

    const handleIdChange = (e) => setInputId(e.target.value);
    const handlePwChange = (e) => {
        setInputPw(e.target.value);
        setCheckPw(confirmPw !== "" && confirmPw !== e.target.value);
    };
    const handlePwCheck = (e) => {
        setConfirmPw(e.target.value);
        setCheckPw(inputPw !== e.target.value);
    }
    const handleNameChange = (e) => setInputName(e.target.value);

    const handleNext = () => {
        if (step < 4) setStep(step + 1);
    };

    const handlePrev = () => {
        if (step > 1) setStep(step - 1);
    };

    return (
        <div className={styles.regisContain}>
            <Title />
            <div className={styles.register}>
                {step === 1 && (
                    <div>
                        <div className={styles.signup}><span className={styles.big}>Sign up</span><span className={styles.small}>| STEP 1</span></div>
                        <Input title="ID" type="text" value={inputId} onChange={handleIdChange}
                            placeholder="아이디를 입력해주세요..." />
                        <Input title="PW" type="password" value={inputPw} onChange={handlePwChange}
                            placeholder="비밀번호를 입력해주세요..." />
                        <Input title="Check PW" type="password" value={confirmPw} onChange={handlePwCheck} check={checkPw}
                            warning={confirmPw === "" ? "" : checkPw ? "※ 비밀번호가 일치하지 않습니다." : "일치합니다!"}
                            placeholder="비밀번호를 다시 입력해주세요..." />
                    </div>
                )}
                {step === 2 && (
                    <div>
                        <div className={styles.signup}><span className={styles.big}>Sign up</span><span className={styles.small}>| STEP 2</span></div>
                        <Input title="닉네임" type="text" value={inputName} onChange={handleNameChange}
                            placeholder="닉네임을 입력해주세요..." />
                        <div className={styles.inputRow}>
                            <span className={styles.regisTitle}>성별</span>
                            <div className={styles.genderGroup}>
                                <label>
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="male"
                                        checked={gender === "male"}
                                        onChange={(e) => setGender(e.target.value)}
                                    />
                                    남자
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="gender"
                                        value="female"
                                        checked={gender === "female"}
                                        onChange={(e) => setGender(e.target.value)}
                                    />
                                    여자
                                </label>
                            </div>

                            <span className={styles.regisTitle}>연령</span>
                            <select
                                className={styles.ageSelect}
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                            >
                                <option value="10">10대</option>
                                <option value="20">20대</option>
                                <option value="30">30대</option>
                                <option value="40">40대</option>
                                <option value="50">50대</option>
                                <option value="60">60대 이상</option>
                            </select>
                        </div>
                        <div className={styles.inputRow}>
                            <span className={styles.regisTitle}>관심사</span>
                            <div className={styles.interestGroup}>
                                {["식품", "생활용품", "사무용품", "반려용품"].map((item) => (
                                    <button
                                        key={item}
                                        type="button"
                                        className={`${styles.interestBtn} ${interests.includes(item) ? styles.selected : ""
                                            }`}
                                        onClick={() => {
                                            if (interests.includes(item)) {
                                                setInterests(interests.filter((i) => i !== item));
                                            } else {
                                                setInterests([...interests, item]);
                                            }
                                        }}
                                    >
                                        #{item}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                <div className={styles.bottomBar}>
                    {step > 1 && step < 4 && (
                        <button className={styles.prev} onClick={handlePrev}>&lt; PREV</button>
                    )}
                    <div className={styles.centerGroup}>
                        <span className={styles.alreadyRegis}>이미 회원이라면?</span>
                        <span className={styles.moveLogin} onClick={() => navigate('/login')}>로그인</span>
                    </div>
                    {step < 4 && (
                        <button className={styles.next} onClick={handleNext}>NEXT &gt;</button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Register;