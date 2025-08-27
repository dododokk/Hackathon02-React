import React, { useMemo, useEffect } from "react";
import { useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import InnerTitle from "./InnerTitle";
import styles from "../style/Post.module.css";
import addressIcon from "../img/addressIcon.png";
import slash from "../img/slash.png";
import { perPersonKRW } from "../utils/price";
import profile from "../img/profile.png";
import { API_BASE } from "../config";
import { getDirectImageUrl, FALLBACK_IMG } from "../utils/image";

function Post() {
  const navigate = useNavigate();
  const location = useLocation();
  const { postId } = useParams();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // 신청 상태
  const [applying, setApplying] = useState(false);
  const [applyErr, setApplyErr] = useState(null);

  const getAuthHeaders = () => {
  const token = localStorage.getItem("jwt");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // 서버 count가 작성자를 포함하는지 모호하면 토글로 관리
  const COUNT_EXCLUDES_AUTHOR = true; // 서버 count가 '신청자 수'만 주면 true


  useEffect(() => {
    const controller =
      typeof AbortController !== "undefined" ? new AbortController() : null;

    setLoading(true);
    setErr(null);

    (async () => {
      try {
        const auth = getAuthHeaders();
        
        const res = await fetch(`${API_BASE}/posts/${postId}`, {
          credentials: "include",
          headers:auth,
          ...(controller ? { signal: controller.signal } : {}),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const baseData = await res.json();

        // 신청 인원수 보정: /applications/count 가 있으면 반영
        let applicantCount = 0;
        try {
          const r = await fetch(
            `${API_BASE}/posts/${postId}/applications/count`,
            {
              method: "GET",
              headers: auth,
              ...(controller ? { signal: controller.signal } : {}),
            }
          );
          if (r.ok) {
            const body = await r.json().catch(() => null);
            applicantCount =
              typeof body === "number"
                ? body
                : typeof body?.count === "number"
                ? body.count
                : Number(body?.count ?? 0) || 0;
          }
        } catch {
          // count 실패는 무시(작성자 1명만 표기)
        }

        const computed =
        typeof baseData.currentMemberCount === "number"
          ? baseData.currentMemberCount
          : (COUNT_EXCLUDES_AUTHOR ? 1 + applicantCount : applicantCount);


        setPost({ ...baseData, currentMemberCount: computed });
      } catch (e) {
        if (e.name !== "AbortError") setErr(e);
      } finally {
        setLoading(false);
      }
    })();

    return () => controller?.abort();
  }, [postId]);

  // ✅ 신청 API 호출
  const handleApply = async () => {
    if (applying) return;

    // 마감 여부 체크
    if (post?.desiredMemberCount && post?.currentMemberCount >= post.desiredMemberCount) {
    alert("모집이 마감되었습니다.");
    return;
  }

    const token = localStorage.getItem("jwt");
    if (!token) {
      // 로그인 필요 시 로그인 화면으로
      alert("로그인이 필요합니다.");
      navigate("/login", {
        replace: true,
        state: { from: location.pathname },
      });
      return;
    }

    setApplying(true);
    setApplyErr(null);

    try {
      const res = await fetch(`${API_BASE}/posts/${postId}/applications`, {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" }, // POST에만 Content-Type
        credentials: "include",
      });
      if (res.status === 401) throw new Error("로그인이 필요합니다.");
      if (res.status === 403) throw new Error("신청 권한이 없습니다.");
      if (res.status === 404) throw new Error("게시글을 찾을 수 없습니다.");
      if (res.status === 409) throw new Error("이미 신청했거나 모집이 마감되었습니다.");
      if (!res.ok) throw new Error(`신청 실패(HTTP ${res.status})`);

      let body = null;
      try { body = await res.json(); } catch {}
      if (body && typeof body.currentMemberCount === "number") {
        setPost((p) => (p ? { ...p, currentMemberCount: body.currentMemberCount } : p));
      } else {
        // 2) 없으면 count 재조회로 정확히 동기화
        const auth = getAuthHeaders();
        const r = await fetch(`${API_BASE}/posts/${postId}/applications/count`, {
          method: "GET",
          headers: auth,
        });
        let applicantCount = 0;
        if (r.ok) {
          const b = await r.json().catch(() => null);
          applicantCount =
            typeof b === "number" ? b :
            typeof b?.count === "number" ? b.count :
            Number(b?.count ?? 0) || 0;
        }
        
        setPost((p) =>
          p
            ? {
                ...p,
                currentMemberCount: COUNT_EXCLUDES_AUTHOR ? 1 + applicantCount : applicantCount,
              }
            : p
        );
      }
      alert("신청이 접수되었습니다!");
      navigate("/main");
    } catch (e) {
      setApplyErr(e);
      alert(e.message || "신청 중 오류가 발생했습니다.");
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <main className={styles.wrap}>
        <article className={styles.card}>불러오는 중…</article>
      </main>
    );
  }
  if (err) {
    return (
      <main className={styles.wrap}>
        <article className={styles.card}>
          불러오기 실패: {String(err.message)}
          <div style={{ marginTop: 8 }}>
            <button className={styles.btnGhost} onClick={() => navigate(-1)}>
              뒤로
            </button>
          </div>
        </article>
      </main>
    );
  }
  if (!post) {
    return (
      <main className={styles.wrap}>
        <article className={styles.card}>게시글이 없습니다.</article>
      </main>
    );
  }

  const isClosed =
    post?.desiredMemberCount &&
    post?.currentMemberCount >= post.desiredMemberCount;

  return (
    <main className={styles.wrap}>
      <InnerTitle />
      {post && (
        <article className={styles.card}>
          <header className={styles.top}>
            <img
              className={styles.thumb}
              src={getDirectImageUrl(post.mainImageUrl)}
              alt=""
              onError={(e) => {
                e.currentTarget.src = FALLBACK_IMG;
                e.currentTarget.onerror = null;
              }}
            />
            <div className={styles.topRight}>
              <div className={styles.titleRow}>
                <h1 className={styles.title}>{post.title}</h1>
                <span className={styles.pill}>
                  {post.currentMemberCount}/{post.desiredMemberCount}명
                </span>
              </div>
              <div className={styles.metaRow}>
                <div className={styles.author}>
                  <img className={styles.profile} src={profile} alt="" />
                  <span className={styles.nickname}>
                    {post.author?.nickname}
                  </span>
                </div>
                <time className={styles.date}>{post.createdAt}</time>
              </div>
              <div className={styles.hr} />
              <div className={styles.productRow}>
                <div className={styles.productLeft}>
                  <span className={styles.smallLabel}>제품명</span>
                  <div className={styles.productName}>{post.productName}</div>
                  <div className={styles.tag}>#{post.category}</div>
                </div>
                <aside className={styles.priceBox}>
                  <div className={styles.price}>
                    {perPersonKRW(post.productDesc, post.desiredMemberCount)}
                  </div>
                  <img className={styles.slash} src={slash} alt="/" />
                  <div className={styles.total}>total {post.productDesc}원</div>
                </aside>
              </div>
            </div>
          </header>

          <section className={styles.descCard}>
            <h2 className={styles.sectionTitle}>제품 소개</h2>
            <p className={styles.desc}>{post.content}</p>
          </section>

          <footer className={styles.footer}>
            <div className={styles.chips}>
              <span className={styles.addressChip}>
                <img className={styles.addrIcon} src={addressIcon} alt="" />
                <span className={styles.addrText}>
                  {post.author?.roadAddress}
                </span>
              </span>
              {post.productUrl && (
                <a
                  href={post.productUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.chipBtn}
                >
                  상품 URL 열기
                </a>
              )}
            </div>
            <div className={styles.cta}>
              <button
                className={styles.btnGhost}
                onClick={() => navigate(-1)}
                disabled={applying}
              >
                나가기
              </button>
              <button
                className={styles.btnPrimary}
                onClick={handleApply}
                disabled={applying || isClosed}
                aria-busy={applying ? "true" : "false"}
                title={
                  isClosed
                    ? "모집 마감"
                    : applying
                    ? "신청 처리 중…"
                    : "신청하기"
                }
              >
                {isClosed ? "마감" : applying ? "신청 중…" : "신청하기"}
              </button>
            </div>
            {applyErr && (
              <p className={styles.errorText} style={{ marginTop: 8 }}>
                {applyErr.message}
              </p>
            )}
          </footer>
        </article>
      )}
    </main>
  );
}

export default Post;
