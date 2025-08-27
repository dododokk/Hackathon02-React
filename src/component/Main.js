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
  // 화면에 뿌릴 목록 (서버 결과만 사용)
  const [items, setItems] = useState([]);
  const [cursor, setCursor] = useState(null);     // lastId
  const [done, setDone] = useState(false);        // 더 이상 없음
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const limit = 20;
  const sentinelRef = useRef(null);
  const loadingRef = useRef(false);               // 중복 요청 방지

  const hasMoreRef = useRef(true);
  const loadingFlagRef = useRef(false);
  useEffect(() => { hasMoreRef.current = !done; }, [done]);
  
  // 서로 다른 응답 포맷 통일
  function normalizePage(data) {
    if (Array.isArray(data?.items)) return data.items;   // /posts/search
    if (Array.isArray(data?.content)) return data.content; // /posts
    if (Array.isArray(data)) return data;
    return [];
  }

  // 공용: 페이지 병합 & 커서/끝 처리
  function applyPage({ page, reset }) {
    setItems(prev => reset ? page:prev.concat(page));
    const last = page[page.length-1];
    setCursor(prevCursor => {
      const nextCursor = last ? last.id : null;
      if(!nextCursor || nextCursor === prevCursor) setDone(true);
      return nextCursor;
    })

    if (page.length < limit) setDone(true);
  }

  async function fetchList({ reset = false } = {}) {
    if (loadingRef.current) return;
    loadingRef.current = true;

    try{
      setLoading(true);
    const params = new URLSearchParams();
    params.set("status", "OPEN");
    params.set("limit", String(limit));
    if (category) params.set("category", category);
    if (!reset && cursor) params.set("lastId", String(cursor));

    const res = await fetch(`${API_BASE}/posts?${params.toString()}` , {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const page = normalizePage(data);

    applyPage({ page, reset });
  } catch(e){
    setError(e.message || "불러오기 실패");
  }finally {
    setLoading(false);
    loadingRef.current = false;
  }
  }

  async function fetchSearch({ reset = false } = {}) {
    if (loadingRef.current) return;
    loadingRef.current = true;

    try{
      setLoading(true);
    const params = new URLSearchParams();
    params.set("q", keyword.trim()); // 키워드 있을 때만 호출됨
    params.set("status", "OPEN");
    params.set("limit", String(limit));
    if (category) params.set("category", category);
    if (!reset && cursor) params.set("lastId", String(cursor));

    const res = await fetch(`${API_BASE}/posts/search?${params.toString()}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const page = normalizePage(data);

    applyPage({ page, reset });
  }catch(e){
    setError(e.message || "불러오기 실패");
  }finally{
    loadingRef.current = false;
  }
  }

  // 키워드/카테고리 변경 시 첫 페이지부터 재조회 (디바운스)
  useEffect(() => {
    let t = null;
    setDone(false);
    setCursor(null);
    setLoading(true);
    setError("");

    t = setTimeout(async () => {
      try {
        if (keyword.trim()) await fetchSearch({ reset: true });
        else await fetchList({ reset: true });
      } catch (e) {
        setError(e.message || "불러오기 실패");
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, category]);

  const cooldownRef = useRef(0);
  // 무한 스크롤: 현재 모드(검색/목록)에 맞게 다음 페이지 호출
  useEffect(() => {
    if (done) return;
    const el = sentinelRef.current;
    if (!el) return;

    const io = new IntersectionObserver(async (entries) => {
      const now = Date.now();
      if (!entries[0].isIntersecting) return;
      if (loadingRef.current) return;
      if(now-cooldownRef.current<300) return;
      cooldownRef.current = now;

      if(keyword.trim()) await fetchSearch({reset: false});
      else await fetchList({reset:false});
    }, {
      rootMargin: "0px",
      threshold: 0.1,
    });
    io.observe(el);
    return()=> io.disconnect();
  }, [cursor, done, keyword, category]);

  // 검색 버튼/Enter: 디바운스 없이 즉시 재조회
  const onClickSearch = async () => {
    setDone(false);
    setCursor(null);
    setLoading(true);
    setError("");
    try {
      if (keyword.trim()) await fetchSearch({ reset: true });
      else await fetchList({ reset: true });
    } catch (e) {
      setError(e.message || "불러오기 실패");
    } finally {
      setLoading(false);
    }
  };
  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onClickSearch();
    }
  };

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
          <section className={styles.list}>
            {items.map((item) => (
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
        )}

        {/* 무한 스크롤 센티넬 */}
        <div ref={sentinelRef} style={{ height: 40 }} />

        <button
          onClick={() => {
            navigate("/write");
          }}
          className={styles.sideBtn}
          aria-label="글쓰기"
        >
          ＋
        </button>
      </div>
    </div>
  );
}

export default Main;
