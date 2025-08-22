import React, { use, useRef, useEffect, useState, useContext } from "react";
import styles from "../style/Register.module.css";
import Title from "./Title";
import { useNavigate } from "react-router-dom";
import searchIcon from "../img/search.png";
import firework from "../img/firework.png";
import { UserContext } from "../context/UserContext";

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
    const { setUserName } = useContext(UserContext); //서버 연결전 임시 데이터(원래 로그인에서 받아와야함.)

    const [step, setStep] = useState(1);
    const [inputId, setInputId] = useState("");
    const [inputPw, setInputPw] = useState("");
    const [confirmPw, setConfirmPw] = useState("");
    const [inputName, setInputName] = useState("");
    const [checkPw, setCheckPw] = useState(false);
    const [gender, setGender] = useState("");
    const [age, setAge] = useState("");
    const [interests, setInterests] = useState([]);

    //지도 찍기 관련 변수
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);
    const [address, setAddress] = useState("");

    useEffect(() => {
        if (step === 3 && mapRef.current) {
            const mapOptions = {
                center: new window.naver.maps.LatLng(37.5408, 127.0790), //건대 중심
                zoom: 14,
            };
            const mapInstance = new window.naver.maps.Map(mapRef.current, mapOptions);
            setMap(mapInstance);
        }
    }, [step]);

    const handleSearch = () => {
        if (!address || !map) return;
        window.naver.maps.Service.geocode({ query: address }, function (status, response) {
            if (status !== window.naver.maps.Service.Status.OK) {
                alert("주소를 찾을 수 없습니다.");
                return;
            }

            const result = response.v2.addresses[0];
            if (!result) {
                alert("주소를 찾을 수 없습니다.");
                return;
            }

            const coord = new window.naver.maps.LatLng(result.y, result.x);

            // 지도 이동
            map.setCenter(coord);

            // 마커 표시
            new window.naver.maps.Marker({
                position: coord,
                map: map,
            });
        });
    }


    const handleIdChange = (e) => setInputId(e.target.value);
    const handlePwChange = (e) => {
        setInputPw(e.target.value);
        setCheckPw(confirmPw !== "" && confirmPw !== e.target.value);
    };
    const handlePwCheck = (e) => {
        setConfirmPw(e.target.value);
        setCheckPw(inputPw !== e.target.value);
    }
    const handleNameChange = (e) => {
        const value = e.target.value;
        setInputName(value);
        setUserName(value);
    };

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
                        <div className={styles.inputR}>
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
                        <div className={styles.inputR}>
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
                {step === 3 && (
                    <div>
                        <div className={styles.signup}><span className={styles.big}>Sign up</span><span className={styles.small}>| STEP 3</span></div>
                        {/* 지도 */}
                        <div ref={mapRef} className={styles.map} />

                        {/* 주소 입력 */}
                        <div className={styles.inputAddress}>
                            <input
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="거주지를 입력해주세요..."
                                className={styles.address}
                            />
                            <button onClick={handleSearch} className={styles.searchBtn}>
                                <img src={searchIcon}></img>
                            </button>
                        </div>
                    </div>
                )}
                {step === 4 && (
                    <div className={styles.step4}>
                        <img src={firework} className={styles.firework} />
                        <div className={styles.congratulation}>
                            <p>축하합니다!</p>
                            <p>회원가입이 완료되었습니다!</p>
                        </div>
                    </div>
                )}
                <div className={styles.bottomBar}>
                    {step > 1 && step < 4 && (
                        <button className={styles.prev} onClick={handlePrev}>&lt; PREV</button>
                    )}
                    {step < 4 && (
                        <div className={styles.centerGroup}>
                            <span className={styles.alreadyRegis}>이미 회원이라면?</span>
                            <span className={styles.moveLogin} onClick={() => navigate('/login')}>로그인</span>
                        </div>
                    )}
                    {step === 4 && (
                        <div className={styles.centerGroup}>
                            <span className={styles.moveLogin} onClick={() => navigate('/login')}>로그인</span>
                            <span className={styles.alreadyRegis}>으로 이동</span>
                        </div>
                    )}
                    {step < 4 && (
                        <button className={styles.next} onClick={handleNext}>NEXT &gt;</button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Register;