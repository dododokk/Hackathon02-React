import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import InnerTitle from "./InnerTitle";
import styles from "../style/Post.module.css";
import addressIcon from "../img/addressIcon.png";
import slash from "../img/slash.png";
import { perPersonKRW } from "../utils/price";
import profile from "../img/profile.png";
import { API_BASE } from "../config";
import { getDirectImageUrl, FALLBACK_IMG } from "../utils/image";
import Swal from "sweetalert2";

function Post() {
  const navigate = useNavigate();
  const location = useLocation();
  const { postId } = useParams();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // 신청/버튼 상태
  const [applying, setApplying] = useState(false);
  const [applyErr, setApplyErr] = useState(null);

  // ✅ 이미 신청 여부 / 작성자 여부
  const [hasApplied, setHasApplied] = useState(false);
  const [isAuthor, setIsAuthor] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("jwt");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // 서버 count가 작성자를 포함하는지 모호하면 토글로 관리 (현재 로직에서는 미사용)
  const COUNT_EXCLUDES_AUTHOR = true;

  const getUserFromToken = () => {
    const token = localStorage.getItem("jwt");
    if (!token) return null;
    try {
      const base64Url = token.split(".")[1];
      // base64url -> base64
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const json = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(json);
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const controller =
      typeof AbortController !== "undefined" ? new AbortController() : null;

    setLoading(true);
    setErr(null);

    (async () => {
      try {
        const auth = getAuthHeaders();

        // 게시글 기본 정보
        const res = await fetch(`${API_BASE}/posts/${postId}`, {
          credentials: "include",
          headers: auth,
          ...(controller ? { signal: controller.signal } : {}),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const baseData = await res.json();

        // 신청 인원수 보정
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
          // count 실패는 무시
        }

        setPost({ ...baseData, currentMemberCount: applicantCount });

        const me = getUserFromToken();
        if (me) {
          // ⚠️ 백엔드가 무엇을 author에 담는지에 따라 비교 키를 선택하세요.
          const myId = me.userId || me.sub || me.id;
          const authorId = baseData?.author?.id || baseData?.authorId;
          if (myId && authorId) {
            setIsAuthor(String(myId) === String(authorId));
          } else if (me.nickname && baseData?.author?.nickname) {
            setIsAuthor(me.nickname === baseData.author.nickname);
          }
        }

        // ✅ 내 신청 여부 조회 (APPROVED만 "이미 신청함"으로 간주)
        try {
          const aRes = await fetch(`${API_BASE}/posts/${postId}/applications`, {
            method: "GET",
            headers: auth,
            ...(controller ? { signal: controller.signal } : {}),
          });
          if (aRes.ok) {
            const raw = await aRes.json().catch(() => null);
            const list = Array.isArray(raw)
              ? raw
              : Array.isArray(raw?.data)
              ? raw.data
              : raw
              ? [raw]
              : [];
            const me = getUserFromToken();
            const myId = me?.userId ?? me?.sub ?? me?.id;

            // 🔒 정책: 서버 기준으로 APPROVED 상태만 신청 중으로 판단
            const applied =
              myId != null &&
              list.some(
                (a) => String(a.applicantId) === String(myId) && a.status === "APPROVED"
              );

            setHasApplied(Boolean(applied));
          } else if (aRes.status === 404) {
            setHasApplied(false);
          }
        } catch {
          // 엔드포인트 없거나 실패해도 치명적이지 않음 (아래 409로도 방어)
        }
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

    // 이미 신청/작성자/마감이면 버튼 자체가 disabled지만, 이중 가드
    if (hasApplied) {
      Swal.fire({
        icon: "info",
        text: "이미 신청한 글입니다.",
        confirmButtonText: "확인",
        confirmButtonColor: "#1f8954ff",
      });
      return;
    }
    if (isAuthor) {
      Swal.fire({
        icon: "warning",
        text: "본인이 작성한 글에는 신청할 수 없습니다.",
        confirmButtonText: "확인",
        confirmButtonColor: "#1f8954ff",
      });
      return;
    }
    if (
      post?.desiredMemberCount &&
      post?.currentMemberCount >= post.desiredMemberCount
    ) {
      Swal.fire({
        icon: "info",
        text: "모집이 마감되었습니다.",
        confirmButtonText: "확인",
        confirmButtonColor: "#1f8954ff",
      });
      return;
    }

    const token = localStorage.getItem("jwt");
    if (!token) {
      Swal.fire({
        icon: "warning",
        text: "로그인이 필요합니다.",
        confirmButtonText: "확인",
        confirmButtonColor: "#1f8954ff",
      });
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
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        credentials: "include",
      });

      if (res.status === 401) {
        Swal.fire({
          icon: "warning",
          text: "로그인이 필요합니다.",
          confirmButtonText: "확인",
          confirmButtonColor: "#1f8954ff",
        });
        navigate("/login", {
          replace: true,
          state: { from: location.pathname },
        });
        return;
      }
      if (res.status === 403) {
        Swal.fire({
          icon: "error",
          text: "신청 권한이 없습니다.",
          confirmButtonText: "확인",
          confirmButtonColor: "#1f8954ff",
        });
        return;
      }
      if (res.status === 404) {
        Swal.fire({
          icon: "error",
          text: "게시글을 찾을 수 없습니다.",
          confirmButtonText: "확인",
          confirmButtonColor: "#1f8954ff",
        });
        return;
      }
      if (res.status === 409) {
        // ✅ 서버에서 이미 신청/마감 충돌
        setHasApplied(true); // 버튼 비활성화를 위해 이미 신청으로 처리
        Swal.fire({
          icon: "info",
          text: "이미 신청한 글입니다.",
          confirmButtonText: "확인",
          confirmButtonColor: "#1f8954ff",
        });
        return;
      }
      if (!res.ok) {
        Swal.fire({
          icon: "info",
          text: "이미 신청한 글입니다.",
          confirmButtonText: "확인",
          confirmButtonColor: "#1f8954ff",
        });
        return;
      }

      let body = null;
      try {
        body = await res.json();
      } catch {}

      if (body && typeof body.currentMemberCount === "number") {
        setPost((p) => (p ? { ...p, currentMemberCount: body.currentMemberCount } : p));
      } else {
        // count 재조회
        const auth = getAuthHeaders();
        const r = await fetch(`${API_BASE}/posts/${postId}/applications/count`, {
          method: "GET",
          headers: auth,
        });
        let applicantCount = 0;
        if (r.ok) {
          const b = await r.json().catch(() => null);
          applicantCount =
            typeof b === "number"
              ? b
              : typeof b?.count === "number"
              ? b.count
              : Number(b?.count ?? 0) || 0;
        }
        setPost((p) => (p ? { ...p, currentMemberCount: applicantCount } : p));
      }

      if (body && typeof body.currentMemberCount === "number") {
        setPost((p) =>
          p
            ? {
                ...p,
                currentMemberCount: body.currentMemberCount,
                desiredMemberCount: body.desiredMemberCount ?? p.desiredMemberCount,
              }
            : p
        );

        if (body.currentMemberCount === body.desiredMemberCount) {
          try {
            const chatRes = await fetch(`${API_BASE}/posts/${postId}/chatroom`, {
              method: "POST",
              headers: getAuthHeaders(),
              credentials: "include",
            });

            if (chatRes.status === 201) {
              console.log("채팅방 생성 완료");
            } else if (chatRes.status === 200) {
              console.log("이미 채팅방이 존재하여 입장 완료");
            } else {
              console.log("채팅방 생성 오류");
            }
          } catch (e) {
            console.log("채팅방 생성 오류");
          }
        }
      }

      Swal.fire({
        icon: "success",
        text: "신청이 완료되었습니다.",
        confirmButtonText: "확인",
        confirmButtonColor: "#1f8954ff",
      });
      navigate("/main");
    } catch (e) {
      setApplyErr(e);
      Swal.fire({
        icon: "error",
        text: e.message || "신청 중 오류가 발생했습니다.",
        confirmButtonText: "확인",
        confirmButtonColor: "#1f8954ff",
      });
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <main className={styles.wrap}>
        <article className={styles.loading}>불러오는 중…</article>
      </main>
    );
  }
  if (err) {
    return (
      <main className={styles.wrap}>
        <article className={styles.loading}>
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
        <article className={styles.loading}>불러오는 중...</article>
      </main>
    );
  }

  const isClosed =
    post?.desiredMemberCount && post?.currentMemberCount >= post.desiredMemberCount;

  const primaryDisabled = applying || isClosed || isAuthor || hasApplied;
  const primaryTitle = isClosed
    ? "모집 마감"
    : isAuthor
    ? "내 게시글"
    : hasApplied
    ? "이미 신청함"
    : applying
    ? "신청 처리 중…"
    : "신청하기";
  const primaryLabel = isClosed
    ? "마감"
    : isAuthor
    ? "내 게시글"
    : hasApplied
    ? "이미 신청함"
    : applying
    ? "신청 중…"
    : "신청하기";

  return (
    <main className={styles.wrap}>
      <InnerTitle />
      {post && (
        <article className={styles.card}>
          <header className={styles.top}>
            
            <div className={styles.topRight}>
              <img
                className={styles.thumb}
                src={getDirectImageUrl(post.mainImageUrl)}
                alt=""
                onError={(e) => {
                  e.currentTarget.src = FALLBACK_IMG;
                  e.currentTarget.onerror = null;
                }}
              />
              <div className={styles.Right}>
                <div className={styles.titleRow}>
                  <h1 className={styles.title}>{post.title}</h1>
                  <span className={styles.pill}>
                    {post.currentMemberCount}/{post.desiredMemberCount}명
                  </span>
                </div>
                <div className={styles.metaRow}>
                  <div className={styles.author}>
                    <img className={styles.profile} src={profile} alt="" />
                    <span className={styles.nickname}>{post.author?.nickname}</span>
                  </div>
                  <time className={styles.date}>{post.createdAt}</time>
                </div>
              </div>
              
            </div>
            <div className={styles.hr}></div>
              <div className={styles.productRow}>
                <div className={styles.productLeft}>
                  <span className={styles.smallLabel}>제품명</span>
                  <div className={styles.productName}>{post.productName}</div>
                </div>
                <aside className={styles.priceBox}>
                  <div className={styles.price}>
                    {perPersonKRW(post.productDesc, post.desiredMemberCount)}
                  </div>
                  <img className={styles.slash} src={slash} alt="/" />
                  <div className={styles.total}>total {post.productDesc}원</div>
                </aside>
              </div>
          </header>

          <section className={styles.descCard}>
            <h2 className={styles.sectionTitle}>제품 소개</h2>
            <p className={styles.desc}>{post.content}</p>
          </section>

          <footer className={styles.footer}>
            <div className={styles.chips}>
              <div className={styles.category}>#{post.category}</div>
              {post.productUrl && (
                <a
                  href={post.productUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.chipBtn}
                >
                   URL 
                </a>
              )}
              <span className={styles.addressChip}>
                <img className={styles.addrIcon} src={addressIcon} alt="" />
                <span className={styles.addrText}>{post.author?.roadAddress}</span>
              </span>
            </div>
            <div className={styles.cta}>
              <button className={styles.btnGhost} onClick={() => navigate(-1)} disabled={applying}>
                나가기
              </button>
              <button
                className={styles.btnPrimary}
                onClick={handleApply}
                disabled={primaryDisabled}
                aria-busy={applying ? "true" : "false"}
                title={primaryTitle}
              >
                {primaryLabel}
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
