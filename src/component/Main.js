import React, { useState, useEffect, useRef, useContext } from "react";
import InnerTitle from "./InnerTitle";
import styles from "../style/Main.module.css";
import searchIcon from "../img/search.png";
import addressIcon from "../img/addressIcon.png";
import slash from "../img/slash.png";
import { perPersonKRW } from "../utils/price";
import { useNavigate, useLocation } from "react-router-dom";
import { getDirectImageUrl, FALLBACK_IMG } from "../utils/image";
import { API_BASE } from "../config";
import { UserContext } from "../context/UserContext";
import { useUnread } from "../context/UnreadContext";

function Main() {
  const navigate = useNavigate();
  const location = useLocation();

  const initialCategory = location.state?.category || "";
  const { userAddress } = useContext(UserContext);

  // 검색/필터 상태
  const [keyword, setKeyword] = useState("");     // 검색어
  const [category, setCategory] = useState(initialCategory);   // "", "식품", "생활용품" ...

  // 풀패칭: 전체 데이터는 메모리에 보관
  const [fullItems, setFullItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 화면에 노출할 개수 (슬라이스)
  const PAGE_SIZE = 20;           // 한 번에 더 보여줄 개수
  const [viewCount, setViewCount] = useState(PAGE_SIZE);

  // 디바운스 타이머
  const debounceRef = useRef(null);

  const [notifications, setNotifications] = useState([]);
  const [readStates, setReadStates] = useState({});
  const { setUnreadNotis } = useUnread();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("jwt"); // 로그인 시 저장한 토큰
        const res = await fetch(`${API_BASE}/notifications`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setNotifications(data.items || []);
          setReadStates(
            (data.items || []).reduce((acc, noti) => {
              acc[noti.id] = noti.isRead;
              return acc;
            }, {})
          );
          const totalUnread = data.items.filter(noti => !noti.isRead).length;
          setUnreadNotis(totalUnread);
        } else {
          console.error("알림 불러오기 실패:", res.status);
        }
      } catch (error) {
        console.error("알림 조회 에러:", error);
      }
    };

    fetchNotifications();
  }, []);

  const [chatrooms, setChatrooms] = useState([]);
  const [err, setErr] = useState(null);
  const { setUnreadMessages } = useUnread();

  const getAuthHeaders = () => {
    const token = localStorage.getItem("jwt");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setErr(null);

        const res = await fetch(`${API_BASE}/me/chatrooms`, {
          method: "GET",
          headers: {
            ...getAuthHeaders(),
          },
          credentials: "include",
          signal: controller.signal,
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        setChatrooms(Array.isArray(data) ? data : []);
        const totalUnread = data.reduce((sum, room) => sum + (room.unreadCount || 0), 0);
        setUnreadMessages(totalUnread);
      } catch (e) {
        if (e.name !== "AbortError") setErr(e);
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, []);

  // 응답 포맷 통일
  function normalizePage(data) {
    if (Array.isArray(data?.items)) return data.items;     // /posts/search 에서 items일 수 있음
    if (Array.isArray(data?.content)) return data.content; // /posts 에서 content일 수 있음
    if (Array.isArray(data)) return data;                  // 그냥 배열
    return [];
  }

  const { totalUnread } = useUnread();
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    if (totalUnread > 0) {
      setNotice("📩 새로운 알림/메시지가 있습니다.");
      // 5초 후 자동으로 사라지게
      const timer = setTimeout(() => setNotice(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [totalUnread]);

  // Main.js

  // 한 번만(조건 바뀔 때만) 전체 패칭
  async function fetchAll({ reset = false } = {}) {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      params.set("status", "OPEN");
      if (category) params.append("category", category);

      const baseUrl = keyword.trim()
        ? `${API_BASE}/posts/search`
        : category
          ? `${API_BASE}/posts/search/category`
          : `${API_BASE}/posts`;
      if (keyword.trim()) params.set("q", keyword.trim());

      const token = localStorage.getItem("jwt"); // 실제 사용하는 토큰 키로 변경
      const headers = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      // 1. 기본 게시글 목록 가져오기
      const res = await fetch(`${baseUrl}?${params.toString()}`, {
        method: "GET",
        headers,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      let all = normalizePage(data);

      // 자신과 같은 주소 필터링
      if (userAddress && userAddress.trim()) {
        all = all.filter(
          (post) =>
            (post.roadAddress || post.author?.roadAddress || "").includes(userAddress)
        );
      }

      // 2. 각 게시글의 정확한 신청 인원수 가져오기 (Post.js와 동일한 로직)
      async function getCount(id) {
        const r = await fetch(`${API_BASE}/posts/${id}/applications/count`, {
          method: "GET",
          headers,
        });
        if (!r.ok) return 0; // 실패 시 0 처리
        const body = await r.json().catch(() => null);
        if (typeof body === "number") return body;
        if (body && typeof body.count === "number") return body.count;
        return Number(body?.count ?? 0) || 0;
      }

      // 병렬 요청으로 성능 최적화
      const concurrency = 8;
      const out = [];
      for (let i = 0; i < all.length; i += concurrency) {
        const chunk = all.slice(i, i + concurrency);
        const counted = await Promise.all(
          chunk.map(async (it) => {
            const applicantCount = await getCount(it.id);
            // Post.js와 동일하게 '작성자(1) + 신청자 수'로 최종 인원 계산
            const fixedCount = applicantCount;
            return {
              ...it,
              currentMemberCount: fixedCount,
            };
          })
        );
        out.push(...counted);
      }
      const filtered = out.filter(
        (item) => item.currentMemberCount < item.desiredMemberCount
      );


      // 3. 재계산된 데이터로 state 업데이트
      setFullItems(filtered);

      if (reset) setViewCount(PAGE_SIZE);

    } catch (e) {
      setError(e.message || "불러오기 실패");
      setFullItems([]);
    } finally {
      setLoading(false);
    }
  }

  // 검색/카테고리 변경 시 디바운스로 풀패칭
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setLoading(true);
    setError("");

    debounceRef.current = setTimeout(() => {
      fetchAll({ reset: true });
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, category]);

  // 최초 로드
  useEffect(() => {
    fetchAll({ reset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 즉시 검색(버튼/Enter): 디바운스 없이 재조회
  const onClickSearch = async () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    await fetchAll({ reset: true });
  };
  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onClickSearch();
    }
  };

  // 화면에 보여줄 슬라이스
  const visibleItems = fullItems.slice(0, viewCount);
  const hasMoreToShow = viewCount < fullItems.length;

  return (
    <div className={styles.mainWrapper}>
      {notice && (
        <div className={styles.toast}>
          {notice}
        </div>
      )}
      <InnerTitle />
      <div className={styles.main}>
        <section className={styles.searchWrap}>
          <div className={styles.searchInner}>
            <select
              className={styles.categorySelect}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">전체</option>
              <option value="식품">#식품</option>
              <option value="생활용품">#생활용품</option>
              <option value="사무용품">#사무용품</option>
              <option value="반려용품">#반려용품</option>
              <option value="기타">#기타</option>
            </select>

            <input
              className={styles.searchInput}
              placeholder="검색어를 입력하세요"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={onKeyDown}
            />
            <button
              className={styles.searchIcon}
              aria-label="검색"
              onClick={onClickSearch}
            >
              <img className={styles.searchimg} src={searchIcon} alt="검색" />
            </button>
          </div>
        </section>

        {loading && <div className={styles.loading}>불러오는 중...</div>}
        {error && !loading && (
          <div className={styles.error}>목록을 불러오지 못했어요: {error}</div>
        )}

        {!loading && !error && (
          <>
            <section className={styles.list}>
              {visibleItems.map((item) => (
                <article key={item.id} className={styles.card}>
                  <img
                    className={styles.thumb}
                    src={getDirectImageUrl(item.mainImageUrl || item.imageUrl)}
                    alt={item.title || "thumbnail"}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_IMG;
                      e.currentTarget.onerror = null;
                    }}
                  />
                  <div className={styles.right}>
                    <header className={styles.cardHead}>
                      <div
                        className={styles.title}
                        onClick={() => navigate(`/post/${item.id}`)}
                      >
                        {item.title}
                      </div>
                      <span className={styles.pill}>
                        {item.currentMemberCount}/{item.desiredMemberCount}명
                      </span>
                    </header>

                    <div className={styles.under}>
                      <div className={styles.cardBody}>
                        <div className={styles.icon}>
                          <p className={styles.category}>#{item.category}</p>
                          <div className={styles.address}>
                            <img
                              className={styles.addressIcon}
                              src={addressIcon}
                              alt="주소"
                            />
                            <div className={styles.roadaddress}>
                              {item.roadAddress !== undefined && item.roadAddress !== null
                                ? item.roadAddress
                                : item.author?.roadAddress || "주소 미등록"}
                            </div>
                          </div>
                        </div>
                        <div className={styles.content}>{item.content}</div>
                      </div>

                      <aside className={styles.priceBox}>
                        <div className={styles.price}>
                          {perPersonKRW(
                            item.productDesc,
                            item.desiredMemberCount
                          )}
                        </div>
                        <img className={styles.slash} src={slash} alt="/" />
                        <div className={styles.totalPrice}>
                          total {item.productDesc}
                        </div>
                      </aside>
                    </div>
                  </div>
                </article>
              ))}
            </section>

            {/* 더보기 버튼: 클라이언트 슬라이스만 증가 */}
            {hasMoreToShow && (
              <div style={{ display: "flex", justifyContent: "center", padding: "16px" }}>
                <button
                  className={styles.moreBtn}
                  onClick={() => setViewCount((v) => v + PAGE_SIZE)}
                >
                  더보기
                </button>
              </div>
            )}

            {/* 글쓰기 플로팅 버튼 */}
            <button
              onClick={() => {
                navigate("/write");
              }}
              className={styles.sideBtn}
              aria-label="글쓰기"
            >
              ＋
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default Main;
