import React, { useMemo, useEffect } from "react";
import { useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import InnerTitle from "./InnerTitle";
import styles from "../style/Post.module.css";
import addressIcon from "../img/addressIcon.png";
import slash from "../img/slash.png";
import { perPersonKRW } from "../utils/price";
import profile from "../img/profile.png";
import { API_BASE } from "../config"; // API base url 관리하는 파일이 있다면 import
import { getDirectImageUrl, FALLBACK_IMG } from "../utils/image";


function Post(){
    
    const navigate = useNavigate();

    // const totalPriceNumber = Number(String(tempData.productDesc).replace(/[^\d]/g, ""));


    const { postId } = useParams(); // /posts/:postId 라우트 기준
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState(null);

useEffect(() => {
  const ac = new AbortSignal ? new AbortController() : null;
  setLoading(true);
  setErr(null);

  fetch(`${API_BASE}/posts/${postId}`, {
    signal: ac?.signal,
    credentials: "include",
  })
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then((data) => setPost(data))
    .catch((e) => {
      if (e.name !== "AbortError") setErr(e);
    })
    .finally(() => setLoading(false));

  return () => ac?.abort?.();
}, [postId]);

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

    return (
        <main className={styles.wrap}>
            <InnerTitle/>
            {post && (
            <article className={styles.card}>
                <header className={styles.top}>
                    <img className={styles.thumb} src={getDirectImageUrl(post.mainImageUrl)} alt=""
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
                                <img className={styles.profile} src={profile} alt=""></img>
                                <span className={styles.nickname}>{post.author?.nickname}</span>
                            </div>
                            <time className={styles.date}>{post.createdAt}</time>
                        </div>
                        <div className={styles.hr}/>
                        <div className={styles.productRow}>
                            <div className={styles.productLeft}>
                                <span className={styles.smallLabel}>제품명</span>
                                <div className={styles.productName}>{post.productName}</div>
                                <div className={styles.tag}>#{post.category}</div>
                            </div>
                            <aside className={styles.priceBox}>
                                <div className={styles.price}>{perPersonKRW(post.productDesc, post.desiredMemberCount)}</div>
                                <img className={styles.slash} src={slash} alt="/"/>
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
                            <span className={styles.addrText}>{post.author?.roadAddress}</span>
                        </span>
                        <button type="button" className={styles.chipBtn}>URL {post.productUrl}</button>
                    </div>
                    <div className={styles.cta}>
                        <button className={styles.btnGhost} onClick={() => navigate(-1)}>나가기</button>
                    <button className={styles.btnPrimary} onClick={() => {alert("신청이 접수되었습니다!"); navigate('/main')}}>신청하기</button>
                    </div>
                </footer>
            </article>
            )}
        </main>
    );
}

export default Post;