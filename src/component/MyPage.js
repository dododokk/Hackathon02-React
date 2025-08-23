import React, { useContext, useEffect, useRef, useState } from "react";
import styles from "../style/MyPage.module.css";
import InnerTitle from "./InnerTitle";
import profile from "../img/profile.png";
import modify from "../img/modify.png";
import location from "../img/location.png";
import { UserContext } from "../context/UserContext";

function Label(props) {
    return (
        <label className={`${styles.menuItem} ${props.selected === props.menu ? styles.active : ""}`}
            onClick={() => props.onSelect(props.menu)}>
            {props.title}
        </label>
    )
}

function Content(props) {
    let content;

    if (props.title === "menu1") {
        content = (
            <div>
                menu1
            </div>
        );
    }
    else if (props.title === "menu2") {
        content = (
            <div>
                menu2
            </div>
        );
    }
    else{
        content = (
            <div>
                menu3
            </div>
        );
    }

    return(
        <div id={styles.content}>
            {content}
        </div>
    )
}

function MyPage() {
    const { userId, userName } = useContext(UserContext);
    const mapRef = useRef(null);
    const [selectedMenu, setSelectedMenu] = useState("menu1");

    useEffect(() => {
        if (window.naver && mapRef.current) {
            const map = new window.naver.maps.Map(mapRef.current, {
                center: new window.naver.maps.LatLng(37.5408, 127.0790), // 예시: 건대 근처
                zoom: 15,
            });

            // 마커 찍기
            new window.naver.maps.Marker({
                position: new window.naver.maps.LatLng(37.5408, 127.0790),
                map,
            });
        }
    }, []);

    return (
        <div className={styles.mainWrapper}>
            <InnerTitle />
            <div className={styles.myInfo}>
                <div className={styles.userInfo}>
                    <img src={profile} className={styles.profile} />
                    <div className={styles.infoText}>
                        <p className={styles.userId}>{userId}</p>
                        <p className={styles.userName}>{userName}<img src={modify} className={styles.modifyImg}></img></p>
                    </div>
                </div>
                <div className={styles.mapInfo}>
                    <span className={styles.label}>| 거주지 </span>
                    <div className={styles.addressBox}>
                        <img src={location} className={styles.locationIcon} />
                        <span className={styles.addressText}>address</span>
                    </div>
                </div>
                <div ref={mapRef} className={styles.map}></div>
            </div>
            <div className={styles.mywriteContent}>
                <div className={styles.mywrite}>
                    <Label selected={selectedMenu} menu="menu1" onSelect={setSelectedMenu} title="신청중" />
                    <Label selected={selectedMenu} menu="menu2" onSelect={setSelectedMenu} title="완료됨" />
                    <Label selected={selectedMenu} menu="menu3" onSelect={setSelectedMenu} title="내가 쓴 글" />
                </div>
                <article>
                    {selectedMenu === "menu1" && <Content title="menu1" />}
                    {selectedMenu === "menu2" && <Content title="menu2" />}
                    {selectedMenu === "menu3" && <Content title="menu3" />}
                </article>
            </div>
        </div>
    );
}

export default MyPage;