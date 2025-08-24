import React, { useContext, useEffect, useRef, useState } from "react";
import styles from "../style/MyPage.module.css";
import InnerTitle from "./InnerTitle";
import profile from "../img/profile.png";
import modify from "../img/modify.png";
import location from "../img/location.png";
import addressIcon from "../img/addressIcon.png";
import thumb from "../img/thumb.png";
import slash from "../img/slash.png";
import trash from "../img/trash.png";
import { UserContext } from "../context/UserContext";
import { AuthContext } from "../context/AuthContext";
import { perPersonKRW } from "../utils/price";
import { useNavigate } from "react-router-dom";

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
    const tempData = [
        {
            id: 1,
            author: {
                id: 101,
                nickname: "정화진",
                roadAddress: "용인시 수지구"
            },
            title: "카라멜 소금빵 공구해서 나누실 분 구합니다!",
            category: "식품",
            productDesc: "11,200",
            desiredMemberCount: 4,
            currentMembercount: 2,
            content: "10개 다 먹기에는 너무 많아서 같이 사실 분 구합니다..ㅎㅎ 제가 구매할테니 시간 조율 해보아요sdfld길게써볼게요 말줄여지는지 봐볼게요 졸려요 화지니졸려요 프론트좀열받아요 이거너무귀찮고눈아프고 하깃맇어요",
            mainImageUrl: "../img/thumb.png",//img id쓸건지
            status: "OPEN",
            createdAt: "2025-08-19",
        },
        {
            id: 1,
            author: {
                id: 101,
                nickname: "정화진",
                roadAddress: "용인시 수지구"
            },
            title: "카라멜 소금빵 공구해서 나누실 분 구합니다!",
            category: "식품",
            productDesc: "11,200",
            desiredMemberCount: 3,
            currentMembercount: 2,
            content: "10개 다 먹기에는 너무 많아서 같이 사실 분 구합니다..ㅎㅎ 제가 구매할테니 시간 조율 해보아요sdfld길게써볼게요 말줄여지는지 봐볼게요 졸려요 화지니졸려요 프론트좀열받아요 이거너무귀찮고눈아프고 하깃맇어요",
            mainImageUrl: "../img/thumb.png",//img id쓸건지
            status: "OPEN",
            createdAt: "2025-08-19",
        },
        {
            id: 1,
            author: {
                id: 101,
                nickname: "정화진",
                roadAddress: "용인시 수지구"
            },
            title: "카라멜 소금빵 공구해서 나누실 분 구합니다제목길게해볼게요 자고시퍼요 언제잘수있을까 언제잘수있을까 언제잘수있을까!",
            category: "식품",
            productDesc: "11,200",
            desiredMemberCount: 3,
            currentMembercount: 2,
            content: "10개 다 먹기에는 너무 많아서 같이 사실 분 구합니다..ㅎㅎ 제가 구매할테니 시간 조율 해보아요sdfld길게써볼게요 말줄여지는지 봐볼게요 졸려요 화지니졸려요 프론트좀열받아요 이거너무귀찮고눈아프고 하깃맇어요",
            mainImageUrl: "../img/thumb.png",//img id쓸건지
            status: "OPEN",
            createdAt: "2025-08-19",
        },
        {
            id: 1,
            author: {
                id: 101,
                nickname: "정화진",
                roadAddress: "용인시 수지구"
            },
            title: "카라멜 소금빵 공구해서 나누실 분 구합니다!",
            category: "식품",
            productDesc: "11,200",
            desiredMemberCount: 3,
            currentMembercount: 2,
            content: "10개 다 먹기에는 너무 많아서 같이 사실 분 구합니다..ㅎㅎ 제가 구매할테니 시간 조율 해보아요sdfld길게써볼게요 말줄여지는지 봐볼게요 졸려요 화지니졸려요 프론트좀열받아요 이거너무귀찮고눈아프고 하깃맇어요",
            mainImageUrl: "../img/thumb.png",//img id쓸건지
            status: "OPEN",
            createdAt: "2025-08-19",
        }
    ];

    const handleDelete = async (postId) => {
        // 서버 연결 후.현재는 board delete 그대로 가져옴.
        // if (!window.confirm("정말 삭제할까요?")) return;

        // try {
        //     const res = await fetch(
        //         `https://miraculous-sparkle-production.up.railway.app/api/posts/${postId}?userId=${encodeURIComponent(userDistinctId)}`,
        //         {
        //             method: "DELETE",
        //             headers: {
        //                 ...(token && { Authorization: `Bearer ${token}` }),
        //             },
        //         }
        //     );

        //     if (res.status !== 204) {
        //         const msg = await res.text().catch(() => "");
        //         throw new Error(msg || `삭제 실패 (status ${res.status})`);
        //     }

        //     // ✅ 삭제 후 최신 데이터 다시 불러오기
        //     fetchPosts();
        // } catch (err) {
        //     console.error("삭제 에러:", err);
        //     alert(err.message || "삭제 중 오류가 발생했습니다.");
        // }
    };

    if (props.title === "menu1") {
        content = (
            <div>
                <section className={styles.list}>
                    {tempData.map(item => (
                        <article key={item.id} className={styles.card}>
                            <img className={styles.thumb} src={thumb} alt="" />
                            <div className={styles.right}>
                                <header className={styles.cardHead}>
                                    <h3 className={styles.title}>{item.title}</h3>
                                    <span className={styles.pill}>{item.currentMembercount}/{item.desiredMemberCount}명</span>
                                </header>
                                <div className={styles.under}>
                                    <div className={styles.cardBody}>
                                        <div className={styles.icon}>
                                            <p className={styles.category}>#{item.category}</p>
                                            <div className={styles.address}>
                                                <img className={styles.addressIcon} src={addressIcon}></img>
                                                <div className={styles.roadaddress}>{item.author.roadAddress}</div>
                                            </div>
                                        </div>
                                        <div className={styles.content}>{item.content}</div>
                                    </div>

                                    <aside className={styles.priceBox}>
                                        <div className={styles.price}>
                                            {perPersonKRW(item.productDesc, item.desiredMemberCount)}
                                        </div>
                                        <img className={styles.slash} src={slash}></img>
                                        <div className={styles.totalPrice}>total {item.productDesc}</div>
                                    </aside>
                                </div>
                            </div>
                        </article>
                    ))}
                </section>
            </div>
        );
    }
    else if (props.title === "menu2") {
        content = (
            <section className={styles.list}>
                {tempData.map(item => (
                    <article key={item.id} className={`${styles.card} ${styles.closed}`}>
                        <img className={styles.thumb} src={thumb} alt="" />
                        <div className={styles.right}>
                            <header className={styles.cardHead}>
                                <h3 className={`${styles.title} ${styles.titleClosed}`}>{item.title}</h3>
                                <span className={styles.pill}>{item.currentMembercount}/{item.desiredMemberCount}명</span>
                            </header>

                            <div className={styles.under}>
                                <div className={styles.cardBody}>
                                    <div className={styles.icon}>
                                        <p className={styles.category}>#{item.category}</p>
                                        <div className={styles.address}>
                                            <img className={styles.addressIcon} src={addressIcon} />
                                            <div className={styles.roadaddress}>{item.author.roadAddress}</div>
                                        </div>
                                    </div>
                                    {/* 개행 살리고 3줄 클램프 유지 */}
                                    <div className={styles.content}>{item.content}</div>
                                </div>

                                {/* 가격 대신 종료 버튼 */}
                                <aside className={styles.closedBox}>
                                    <button className={styles.closedBtn} disabled>모집 종료</button>
                                </aside>
                            </div>
                        </div>
                    </article>
                ))}
            </section>
        );
    }
    else {
        content = (
            <div>
                <section className={styles.list}>
                    {tempData.map(item => (
                        <article key={item.id} className={styles.card}>
                            <img className={styles.thumb} src={thumb} alt="" />
                            <div className={styles.right}>
                                <header className={styles.cardHead}>
                                    <h3 className={styles.title}>{item.title}</h3>
                                    <span className={styles.pill}>{item.currentMembercount}/{item.desiredMemberCount}명</span>
                                    <button className={styles.delete} onClick={handleDelete}><img src={trash} className={styles.trashImg}/></button>
                                </header>
                                <div className={styles.under}>
                                    <div className={styles.cardBody}>
                                        <div className={styles.icon}>
                                            <p className={styles.category}>#{item.category}</p>
                                            <div className={styles.address}>
                                                <img className={styles.addressIcon} src={addressIcon}></img>
                                                <div className={styles.roadaddress}>{item.author.roadAddress}</div>
                                            </div>
                                        </div>
                                        <div className={styles.content}>{item.content}</div>
                                    </div>

                                    <aside className={styles.priceBox}>
                                        <div className={styles.price}>
                                            {perPersonKRW(item.productDesc, item.desiredMemberCount)}
                                        </div>
                                        <img className={styles.slash} src={slash}></img>
                                        <div className={styles.totalPrice}>total {item.productDesc}</div>
                                    </aside>
                                </div>
                            </div>
                        </article>
                    ))}
                </section>
            </div>
        );
    }

    return (
        <div id={styles.content}>
            {content}
        </div>
    )
}

function MyPage() {
    const { userId, userName } = useContext(UserContext);
    const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext);
    const { setUserId, setUserPw } = useContext(UserContext);
    const mapRef = useRef(null);
    const navigate = useNavigate();
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

    const handleLogout = () => {
        // localStorage.removeItem("token"); 나중에 토큰 삭제
        setIsLoggedIn(false);
        setUserId("");
        setUserPw("");
        navigate('/');
    };

    return (
        <div className={styles.mainWrapper}>
            <InnerTitle />
            <div className={styles.myInfo}>
                <div className={styles.userInfo}>
                    <img src={profile} className={styles.profile} />
                    <div className={styles.infoText}>
                        <div className={styles.userIdRow}>
                            <p className={styles.userId}>{userId}</p>
                            <button className={styles.logoutBtn} onClick={handleLogout}>Logout</button>
                        </div>
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