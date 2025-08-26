import React from "react";
import InnerTitle from "./InnerTitle";
import styles from "../style/Main.module.css";
import { useState, useEffect, useMemo } from "react";
import searchIcon from "../img/search.png";
import addressIcon from "../img/addressIcon.png";
import slash from "../img/slash.png";
import { perPersonKRW } from "../utils/price";
import { useNavigate } from "react-router-dom";
import { getDirectImageUrl, FALLBACK_IMG } from "../utils/image";
import { API_BASE } from "../config";

const CATEGORY_LABEL = {
    FOOD: "식품",
    LIVING: "생활용품",
    OFFICE: "사무용품",
    PET: "반려용품",
    ETC: "기타",
};


function Main() {
    const navigate = useNavigate();
    
    const [keyword, setKeyword] = useState("");//검색어
    const [category, setCategory] = useState("");
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    //서버연동
    useEffect(() => {
        const ac = new AbortController();
        (async () => {
            try{
                setLoading(true);
                setError("");
                const res = await fetch(`${API_BASE}/posts`, { signal: ac.signal });
                if(!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                setPosts(Array.isArray(data?.content) ? data.content : []);
            } catch(e) {
                if(e.name !== "AbortError") setError(e.message || "불러오기 실패");
            } finally {
                setLoading(false);
            }
        })();
        return () => ac.abort();
    }, []);

    //필터링(카테고리/검색어)
    const filtered = useMemo(() => {
        let list = posts.slice();
        if(category !== "") {
            list = list.filter((p) => p.category === category);
        }
        const q = keyword.trim().toLowerCase();
        if(q){
            list = list.filter((p)=>
            [p.title, p.content, p.productName]
            .filter(Boolean)
            .some((v) => String(v).toLowerCase().includes(q))
            )
        }
        return list;
    }, [posts, category, keyword]);

    return (
        <div className={styles.mainWrapper}>
            <InnerTitle/>
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
                        />
                        <button className={styles.searchIcon} aria-label="검색">
                            <img className={styles.searchimg} src={searchIcon}></img>
                        </button>
                    </div>
                </section>

                {loading && <div className={styles.loading}>불러오는 중...</div>}
                {error && !loading && <div className={styles.error}>목록을 불러오지 못했어요: {error}</div>}

                {!loading && !error && (

                
                <section className={styles.list}>
       
                    {filtered.map((item) => (
                        <article key={item.id} className={styles.card}>
                            <img className={styles.thumb} src={getDirectImageUrl(item.mainImageUrl)} alt={item.title || "thumbnail"} loading="lazy"
                                onError={(e) => {
                                    e.currentTarget.src = FALLBACK_IMG;
                                    e.currentTarget.onerror = null;
                                }}
                            />
                            <div className={styles.right}>
                                    <header className={styles.cardHead}>
                                        <div className={styles.title} onClick={()=>navigate('/post')}>{item.title}</div>
                                        <span className={styles.pill}>{item.currentMemberCount}/{item.desiredMemberCount}명</span>
                                    </header>
                                <div className={styles.under}>
                                    <div className={styles.cardBody}>
                                        <div className={styles.icon}>
                                            <p className={styles.category}>#{CATEGORY_LABEL[item.category] || item.category}</p>
                                            <div className={styles.address}>
                                                <img className={styles.addressIcon} src={addressIcon} alt="주소"/>
                                                <div className={styles.roadaddress}>{item.author?.roadAddress}</div>
                                            </div>
                                        </div>
                                        <div className={styles.content}>{item.content}</div>
                                    </div>
                            
                                    <aside className={styles.priceBox}>
                                        <div className={styles.price}>
                                            {perPersonKRW(item.productDesc, item.desiredMemberCount)}
                                        </div>
                                        <img className={styles.slash} src={slash} alt="/" />
                                        <div className={styles.totalPrice}>total {item.productDesc}</div>
                                    </aside>
                                </div>
                            </div>
                        </article>
                    ))}
                </section>
                )}
                <button onClick={()=>{navigate('/write')}} className={styles.sideBtn} aria-label="글쓰기">＋</button>
            </div>
        </div>
    );
}

export default Main;