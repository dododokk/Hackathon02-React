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
import thumb1 from "../img/thumb1.png";
import thumb2 from "../img/thumb2.png";
import thumb3 from "../img/thumb3.png";

const CATEGORY_LABEL = {
    FOOD: "식품",
    LIVING: "생활용품",
    OFFICE: "사무용품",
    PET: "반려용품",
    ETC: "기타",
};
const CATEGORY_CODE = {
  식품: "FOOD",
  생활용품: "LIVING",
  사무용품: "OFFICE",
  반려용품: "PET",
  기타: "ETC",
};

const tempData = [
  {
    id: 1,
    author: {
        id: 101,
        nickname: "정화진",
        roadAddress: "서울 광진구 능동로 120"
    },
    title: "소금빵 같이 구매하실 분 구합니다!",
    category: "식품",
    productName: "소금버터롤",
    productUrl: "https://www.coupang.com/vp/products/8034477620?itemId=22475283013&vendorItemId=89517954732&sourceType=srp_product_ads&clickEventId=af761420-81aa-11f0-97a0-7ad606fb9dde&korePlacement=15&koreSubPlacement=1&clickEventId=af761420-81aa-11f0-97a0-7ad606fb9dde&korePlacement=15&koreSubPlacement=1",
    productDesc: "21,000",
    desiredMemberCount: 4,
    currentMembercount: 2,
    content: "10개 다 먹기에는 너무 많아서 같이 사실 분 구합니다..ㅎㅎ 제가 구매할테니 시간 조율 해보아요",
    mainImageUrl: thumb1,//img id쓸건지
    status: "OPEN",
    createdAt: "2025-08-19",
  },
  {
    id: 2,
    author: {
        id: 101,
        nickname: "정화진",
        roadAddress: "서울 광진구 능동로 110"
    },
    title: "키친타올 나눠가져요",
    category: "생활용품",
    productDesc: "15,230",
    desiredMemberCount: 3,
    currentMembercount: 2,
    content: "총 24롤인데 너무 많아서 같이 구매하고 싶어요! 키친타올 필요하신 분 공구해요~",
    mainImageUrl: thumb2,//img id쓸건지
    status: "OPEN",
    createdAt: "2025-08-19",
  },
  {
    id: 3,
    author: {
        id: 101,
        nickname: "정화진",
        roadAddress: "서울 광진구 광나루로 410"
    },
    title: "샤프심 대량구매",
    category: "사무용품",
    productDesc: "21,750",
    desiredMemberCount: 4,
    currentMembercount: 1,
    content: "수량 40개 0.5mm 2B 샤프심이에요 대량구매가 더 저렴해서 공구해요~ 샤프심 10개 필요한 분 계신가요",
    mainImageUrl: thumb3,//img id쓸건지
    status: "OPEN",
    createdAt: "2025-08-19",
  },
//   {
//     id: 4,
//     author: {
//         id: 101,
//         nickname: "정화진",
//         roadAddress: "서울 광진구 능동로 161 "
//     },
//     title: "고양이 츄르 150개 공구해요~",
//     category: "반려용품",
//     productDesc: "33,770",
//     desiredMemberCount: 5,
//     currentMembercount: 2,
//     content: "6가지 맛 혼합 150개 제품이에요 30개씩 나눠요~",
//     mainImageUrl: thumb4,//img id쓸건지
//     status: "OPEN",
//     createdAt: "2025-08-19",
//   }
];

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
            const code = CATEGORY_CODE[category];
            list = list.filter((p) => p.category === code);
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