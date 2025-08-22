import React from "react";
import InnerTitle from "./InnerTitle";
import styles from "../style/Main.module.css";
import { useState } from "react";
import searchIcon from "../img/search.png";
import addressIcon from "../img/addressIcon.png";
import thumb from "../img/thumb.png";

const tempData = [
  {
    id: 1,
    author: {
        id: 101,
        nickname: "정화진",
        roadAddress: "서울시 강남구"
    },
    title: "카라멜 소금빵 공구해서 반띵하실 분 구합니다!",
    category: "식품",
    productDesc: "11200",
    desiredMemberCount: 2,
    content: "10개 다 먹기에는 너무 많아서 같이 사실 분 구합니다..ㅎㅎ 제가 구매할테니 시간 조율 해보아요sdfld길게써볼게요 말줄여지는지 봐볼게요 졸려요 화지니졸려요 프론트좀열받아요 이거너무귀찮고눈아프고 하깃맇어요",
    mainImageUrl: "../img/thumb.png",//img id쓸건지
    status: "OPEN",
    createdAt: "2025-08-19",
  },
  // 원하면 더 추가
];

function Main() {
    const [keyword, setKeyword] = useState("");//검색어
    const [category, setCategory] = useState("카테고리");
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

                <section className={styles.list}>
                    {tempData.map(item => (
                        <article key={item.id} className={styles.card}>
                            <img className={styles.thumb} src={thumb} alt=""/>
                            <div className={styles.cardBody}>
                                <header className={styles.cardHead}>
                                    <h3 className={styles.title}>{item.title}</h3>
                                    <span className={styles.pill}>/{item.desiredMemberCount}</span>
                                </header>

                                <div className={styles.icon}>
                                <p className={styles.category}>#{item.category}</p>
                                <div className={styles.address}>
                                    <img className={styles.addressIcon} src={addressIcon}></img>
                                    <div className={styles.roadaddress}>{item.author.roadAddress}</div>
                                </div>
                                </div>
                                <div className={styles.content}>{item.content}</div>
                            </div>
                            
                            <aside className={styles.priceBox}>
                                <div className={styles.price}>{Number(item.productDesc)/Number(item.desiredMemberCount)}</div>
                                /
                                <div className={styles.totalPrice}>{item.productDesc}</div>
                            </aside>
                        </article>
                    ))}
                </section>
                <button className={styles.fab} aria-label="글쓰기">＋</button>
            </div>
        </div>
    );
}

export default Main;