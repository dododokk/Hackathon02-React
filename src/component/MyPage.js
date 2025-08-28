import React, { useContext, useEffect, useRef, useState, useMemo } from "react";
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
import { useMap } from "../context/MapContext";
import { API_BASE } from "../config";
import ba from "../img/ba.png";
import Swal from "sweetalert2";

/** 탭 라벨 */
function Label({ selected, menu, onSelect, title }) {
  return (
    <label
      className={`${styles.menuItem} ${selected === menu ? styles.active : ""}`}
      onClick={() => onSelect(menu)}
    >
      {title}
    </label>
  );
}

/** 서버 데이터 카드 공통 렌더링 */
function PostCard({ item, variant = "default", onDelete }) {
  const isClosed = variant === "closed";
  const imgSrc = item.mainImageUrl || thumb;
  const navigate = useNavigate();

  return (
    <article
      className={`${styles.card} ${isClosed ? styles.closed : ""}`}
      key={item.id}
    >
      <img className={styles.thumb} src={imgSrc} alt="" />
      <div className={styles.right}>
        <header className={styles.cardHead}>
          <h3 className={`${styles.title} ${isClosed ? styles.titleClosed : ""}`}
          onClick={() => navigate(`/post/${item.id}`)}>
            {item.title}
          </h3>
          <span className={styles.pill}>
            {item.currentMemberCount}/{item.desiredMemberCount}명
          </span>

          {/* 내가 쓴 글 탭만 삭제 버튼 노출 (선택) */}
          {onDelete && (
            <button className={styles.delete} onClick={() => onDelete(item.id)}>
              <img src={trash} className={styles.trashImg} alt="delete" />
            </button>
          )}
        </header>

        <div className={styles.under}>
          <div className={styles.cardBody}>
            <div className={styles.icon}>
              <p className={styles.category}>#{item.category}</p>
              <div className={styles.address}>
                <img className={styles.addressIcon} src={addressIcon} alt="" />
                <div className={styles.roadaddress}>
                  {item.author?.roadAddress || "지역 미기재"}
                </div>
              </div>
            </div>
            <div className={styles.content}>{item.content}</div>
          </div>

          {isClosed ? (
            <aside className={styles.closedBox}>
              <button className={styles.closedBtn} disabled>
                모집 종료
              </button>
            </aside>
          ) : (
            <aside className={styles.priceBox}>
              <div className={styles.price}>
                {perPersonKRW(item.productDesc, item.desiredMemberCount)}
              </div>
              <img className={styles.slash} src={slash} alt="" />
              <div className={styles.totalPrice}>total {item.productDesc}</div>
            </aside>
          )}
        </div>
      </div>
    </article>
  );
}

/** 서버 연결 + 렌더링 */
function Content({ which }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const token = useMemo(() => localStorage.getItem("jwt"), []);

  // 메뉴별 엔드포인트 매핑
  const endpoint = useMemo(() => {
    if (which === "menu1") return `${API_BASE}/mypage/applied/ongoing`;   // 신청중(approved|open)
    if (which === "menu2") return `${API_BASE}/mypage/applied/completed`; // 완료됨(approved|full)
    if (which === "menu3") return `${API_BASE}/mypage/my-posts`;                                 // 내가 쓴 글
  }, [which]);

  // 데이터 가져오기
  useEffect(() => {
    let ignore = false;

    const fetchList = async () => {
      setLoading(true);
      setErr("");
      try {
        if (!token) {
          throw new Error("로그인이 필요합니다. (토큰 없음)");
        }

        const res = await fetch(endpoint, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(text || `요청 실패 (${res.status})`);
        }

        const data = await res.json();

        // 서버가 배열을 준다는 전제. 아닐 경우 방어.
        const list = Array.isArray(data) ? data : (data?.content ?? []);
        if (!ignore) setItems(list);
      } catch (e) {
        if (!ignore) setErr(e.message || "알 수 없는 오류");
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchList();
    return () => {
      ignore = true;
    };
  }, [endpoint, token]);

  // (선택) 내가 쓴 글 삭제 예시 – 실제 API 경로/파라미터에 맞춰 수정해 사용
  const handleDelete = async (postId) => {
    const result = await Swal.fire({
    title: "정말 삭제하시겠습니까?",
    text: "삭제된 글은 복구할 수 없습니다.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "삭제하기",
    cancelButtonText: "취소"
  });
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`${API_BASE}/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.status !== 204) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || `삭제 실패 (status ${res.status})`);
      }
      // 삭제 후 목록 갱신
      setItems((prev) => prev.filter((p) => p.id !== postId));
    } catch (e) {
      alert(e.message || "삭제 중 오류가 발생했습니다.");
    }
  };

  if (loading) {
    return (
      <div id={styles.content}>
        <div className={styles.list}>불러오는 중…</div>
      </div>
    );
  }

  if (err) {
    return (
      <div id={styles.content}>
        <div className={styles.list}>
          <p style={{ color: "crimson" }}>오류: {err}</p>
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div id={styles.content}>
        <div>
          <p className={styles.list}>표시할 게시글이 없습니다.</p>
        </div>
      </div>
    );
  }

  const variant = which === "menu2" ? "closed" : "default";
  const showDelete = which === "menu3";

  return (
    <div id={styles.content}>
      <section className={styles.list}>
        {items.map((item) => (
          <PostCard
            key={item.id}
            item={item}
            variant={variant}
            onDelete={showDelete ? handleDelete : undefined}
          />
        ))}
      </section>
    </div>
  );
}

function MyPage() {
  const { userId, userName, userInterest, userAddress, setUserId, setUserPw } =
    useContext(UserContext);
  const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext);
  const mapRef = useRef(null);
  const navigate = useNavigate();
  const [selectedMenu, setSelectedMenu] = useState("menu1");
  const { initMap, addMarker, clearMarkers, setCenter, place, addressText, geocode } = useMap();

  const backgroundStyle = {
    backgroundImage: `url(${ba})`, // 👉 public/img/background.png 에 넣어두세요
    backgroundSize: "cover",
    backgroundPosition: "center top",
    backgroundRepeat: "no-repeat",
    minHeight: "100vh",
    width: "100%",
  }

  // 지도 초기화
  useEffect(() => {
    if (mapRef.current) {
      initMap(mapRef.current, {
        center: new window.naver.maps.LatLng(37.5408, 127.079),
        zoom: 14,
        zoomControl: false,   // 줌 버튼 비활성화
        scrollWheel: false,   // 마우스 휠 줌 금지
        pinchZoom: false,     // 터치 핀치 줌 금지
        keyboardShortcuts: false // 키보드 +/- 줌 금지
      });
    }
  }, [initMap]);

  // 주소 → 좌표
  useEffect(() => {
    if (userAddress && userAddress.trim()) {
      geocode(userAddress).catch(() => { });
    } else if (!place && addressText && addressText.trim()) {
      geocode(addressText).catch(() => { });
    }
  }, [userAddress, addressText]);

  // 마커 표시
  useEffect(() => {
    if (!place) return;

    addMarker({ lat: place.lat, lng: place.lng });
    setCenter(place.lat, place.lng, 16);
  }, [place, clearMarkers, addMarker, setCenter]);

  const handleLogout = () => {
    // 나중에 실제 토큰 키 사용
    // localStorage.removeItem("token");
    localStorage.removeItem("jwt");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUserId("");
    setUserPw("");
    navigate("/");
  };

  const displayAddress =
    (place?.regionText && place.regionText.trim()) ||
    (place?.roadAddress && place.roadAddress.trim()) ||
    (place?.jibunAddress && place.jibunAddress.trim()) ||
    (addressText && addressText.trim()) ||
    "미설정";

  return (
    <div className={styles.mainWrapper} style={backgroundStyle}>
      <InnerTitle />

      {/* 상단 내 정보 */}
      <div className={styles.myInfo}>
        <div className={styles.userInfo}>
          <img src={profile} className={styles.profile} alt="" />
          <div className={styles.infoText}>
            <div className={styles.userIdRow}>
              <p className={styles.userId}>{userId}</p>
              <div className={styles.interests}>
                {userInterest && userInterest.length > 0 ? (
                  userInterest.map((item, idx) => (
                    <span key={idx}
                      className={styles.interestTag}
                      onClick={() => navigate('/main', { state: { category: item } })}>
                      #{item}
                    </span>
                  ))
                ) : (
                  <span className={styles.noInterest}>관심사 없음</span>
                )}
              </div>
              <button className={styles.logoutBtn} onClick={handleLogout}>
                Logout
              </button>
            </div>
            <p className={styles.userName}>
              {userName}
            </p>
          </div>
        </div>

        <div className={styles.mapInfo}>
          <span className={styles.label}>| 거주지 </span>
          <div className={styles.addressBox}>
            <img src={location} className={styles.locationIcon} alt="" />
            <span className={styles.addressText}>{userAddress}</span>
          </div>
        </div>
        <div ref={mapRef} className={styles.map}></div>
      </div>

      {/* 하단 탭 & 콘텐츠 */}
      <div className={styles.mywriteContent}>
        <div className={styles.mywrite}>
          <Label selected={selectedMenu} menu="menu1" onSelect={setSelectedMenu} title="신청중" />
          <Label selected={selectedMenu} menu="menu2" onSelect={setSelectedMenu} title="완료됨" />
          <Label selected={selectedMenu} menu="menu3" onSelect={setSelectedMenu} title="내가 쓴 글" />
        </div>

        <article>
          {selectedMenu === "menu1" && <Content which="menu1" />}
          {selectedMenu === "menu2" && <Content which="menu2" />}
          {selectedMenu === "menu3" && <Content which="menu3" />}
        </article>
      </div>
    </div>
  );
}

export default MyPage;