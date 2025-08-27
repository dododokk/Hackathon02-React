import React, { useState, useEffect, useRef } from "react";
import InnerTitle from "./InnerTitle";
import styles from "../style/Main.module.css";
import searchIcon from "../img/search.png";
import addressIcon from "../img/addressIcon.png";
import slash from "../img/slash.png";
import { perPersonKRW } from "../utils/price";
import { useNavigate } from "react-router-dom";
import { getDirectImageUrl, FALLBACK_IMG } from "../utils/image";
import { API_BASE } from "../config";

function Main() {
  const navigate = useNavigate();

  // 검색/필터 상태
  const [keyword, setKeyword] = useState("");     // 검색어
  const [category, setCategory] = useState("");   // "", "식품", "생활용품" ...

  // 풀패칭: 전체 데이터는 메모리에 보관
  const [fullItems, setFullItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 화면에 노출할 개수 (슬라이스)
  const PAGE_SIZE = 20;           // 한 번에 더 보여줄 개수
  const [viewCount, setViewCount] = useState(PAGE_SIZE);

  // 디바운스 타이머
  const debounceRef = useRef(null);

  // 응답 포맷 통일
  function normalizePage(data) {
    if (Array.isArray(data?.items)) return data.items;     // /posts/search 에서 items일 수 있음
    if (Array.isArray(data?.content)) return data.content; // /posts 에서 content일 수 있음
    if (Array.isArray(data)) return data;                  // 그냥 배열
    return [];
  }

  // 한 번만(조건 바뀔 때만) 전체 패칭
  async function fetchAll({ reset = false } = {}) {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      params.set("status", "OPEN");
      // 풀패칭이므로 서버는 limit/lastId 없이 “전부” 내려줘야 함
      if (category) params.set("category", category);
      const baseUrl = keyword.trim()
        ? `${API_BASE}/posts/search`
        : `https://hackathon02-api-production.up.railway.app/api/posts`;

      if (keyword.trim()) params.set("q", keyword.trim());

      const res = await fetch(`${baseUrl}?${params.toString()}`, {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}` 
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const all = normalizePage(data);

      // 전체를 메모리에 보관
      setFullItems(all);
      // 검색/필터가 바뀌어서 재조회하는 경우, 화면 노출 개수 초기화
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
                              {item.author?.roadAddress}
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
