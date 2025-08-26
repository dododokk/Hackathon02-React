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



const tempData = [
  {
    id: 1,
    author: { id: 101, nickname: "문효진", roadAddress: "서울특별시 광진구 능동로 120, 건대부고 후문" },
    title: "카라멜 소금빵 공구해서 반띵하실 분 구합니다!",
    category: "식품",
    productName: "카라멜 소금빵",
    productUrl: "https://example.com/p/1",
    productDesc: "11,200",
    desiredMemberCount: 2,
    currentMemberCount: 1,
    content:
      "10개 다 먹기에는 너무 많아서 같이 사실 분 구합니다..ㅎㅎ제가 구매할테니 시간 조율 해보아요 나눔하자고 이사람들아 나 화나게 하지마라니 덜덜 이걸 강매해버리네 협박하지마 이수호수호",
    mainImageUrl: "https://cdn/1.jpg", // 비어있으면 thumbFallback 사용
    status: "OPEN",
    createdAt: "2025-08-21",
  },
];

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