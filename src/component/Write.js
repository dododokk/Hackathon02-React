import React, { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import InnerTitle from "./InnerTitle";
import styles from "../style/Write.module.css";

const CATEGORIES = ["식품", "생활용품", "사무용품", "반려용품", "기타"];

export default function Write() {
  const navigate = useNavigate();

  // form state
  const [title, setTitle] = useState("");
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [people, setPeople] = useState(2);
  const [url, setUrl] = useState("");
  const [categories, setCategories] = useState([]);
  const [desc, setDesc] = useState("");
  const [image, setImage] = useState(null);
  const fileRef = useRef(null);

  const titleLimit = 30;
  const titleCount = useMemo(() => `${title.length}/${titleLimit}`, [title]);

  const toggleCategory = (name) => {
    setCategories((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  };

  const onSelectImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // 간단 검증
    if (!file.type.startsWith("image/")) {
      alert("이미지 파일을 선택해주세요.");
      return;
    }
    const objectUrl = URL.createObjectURL(file);

    setImage({
      file,
      preview: URL.createObjectURL(file),
    });
    e.target.value = "";
  };

  const validate = () => {
    if (!title.trim()) return { ok: false, msg: "제목을 입력해주세요." };
    if (title.trim().length > titleLimit)
      return { ok: false, msg: `제목은 ${titleLimit}자 이내로 입력해주세요.` };
    if (!productName.trim()) return { ok: false, msg: "제품명을 입력해주세요." };
    if (!price.trim()) return { ok: false, msg: "가격을 입력해주세요." };
    if (isNaN(Number(price.replaceAll(",", ""))))
      return { ok: false, msg: "가격은 숫자만 입력해주세요." };
    return { ok: true };
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (!v.ok) {
      alert(v.msg);
      return;
    }
    // // 서버로 전송.
    // try{
    //   const form = new FormData();
    //   form.append("title", title.trim());
    //   form.append("productName", productName.trim());
    //   form.append("price", String(Number(price.replaceAll(",", ""))));
    //   form.append("people", String(people));
    //   form.append("url", url.trim());
    //   form.append("categories", JSON.stringify(categories));
    //   form.append("desc", desc.trim());

    //   if (image?.file) form.append("image", image.file, image.file.name);

    //   // const res = await fetch("/api/posts", {
    //   //   method: "POST",
    //   //   body: form, // Content-Type 지정하지 마세요(브라우저가 자동 설정)
    //   // });
    //   if (!res.ok) throw new Error("업로드 실패");
    //   const saved = await res.json(); // { id, imageUrl, ... } 형태라고 가정
    //   alert("작성 완료!");
    //   navigate(-1);
    // } catch(err){
    //   console.error(err);
    //   alert("저장 중 오류 발생");
    // }

    navigate(-1);
    
  };

  return (
    <>
      <InnerTitle />
      <main className={styles.container}>
        <section className={styles.card}>
          <form className={styles.form} onSubmit={onSubmit}>
            {/* 제목 */}
            <div className={styles.row}>
              <label className={styles.label}>제목</label>
              <div className={styles.flexGrow}>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="30자 이내로 입력하세요..."
                  value={title}
                  maxLength={titleLimit}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <span className={styles.counter}>{titleCount}</span>
              </div>
            </div>

            {/* 제품명 / 가격 */}
            <div className={styles.rowFour}>
              <label className={styles.label}>제품명</label>
              
              <input
                className={`${styles.input} ${styles.inputSmall}`}
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
              <label className={styles.label}>
                가격
              </label>
              <input
                className={`${styles.input} ${styles.inputPrice}`}
                type="text"
                inputMode="numeric"
                placeholder=""
                value={price}
                onChange={(e) => setPrice(e.target.value.replace(/[^\d,]/g, ""))}
              />
              
            </div>

            {/* 모집 인원 / URL */}
            <div className={styles.rowFour}>
              <label className={styles.label}>모집 인원</label>
              <select
                className={`${styles.input} ${styles.inputPeople}`}
                value={people}
                onChange={(e) => setPeople(Number(e.target.value))}
              >
                {Array.from({ length: 29 }, (_, i) => i + 2).map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <label className={styles.label}>
                URL
              </label>
              <input
                className={`${styles.input} ${styles.url} ${styles.flexGrow}`}
                type="url"
                placeholder=""
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>

            {/* 카테고리 */}
            <div className={styles.row}>
              <label className={styles.label}>카테고리</label>
              <div className={styles.categoryWrap}>
                {CATEGORIES.map((name) => {
                  const active = categories.includes(name);
                  return (
                    <button
                      key={name}
                      type="button"
                      className={`${styles.chip} ${active ? styles.chipOn : ""}`}
                      onClick={() => toggleCategory(name)}
                      aria-pressed={active}
                    >
                      #{name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 소개글 */}
            <div className={styles.row}>
              <label className={styles.label}>소개글</label>
              <textarea
                className={`${styles.textarea} ${styles.flexGrow}`}
                rows={6}
                placeholder="소개글을 입력하세요..."
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
            </div>

            {/* 사진 */}
            <div className={styles.row}>
              <label className={styles.label}>사진</label>
              <div className={styles.uploadWrap}>
                {image ? (
                  <div className={styles.previewWrap}>
                    <img
                      src={image.preview}
                      alt="미리보기"
                      className={styles.preview}
                    />
                    <button
                      type="button"
                      className={styles.deleteBtn}
                      onClick={() => setImage(null)}
                    >✕</button>
                    </div>
                ):(
                  <button
                    type="button"
                    className={styles.uploadBox}
                    onClick={() => fileRef.current?.click()}
                    >
                      <span className={styles.plus}>＋</span>
                    </button>
                )}
                
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={onSelectImage}
                  style={{ display: "none" }}
                />
              </div>
            </div>

            {/* 버튼들 */}
            <div className={styles.footer}>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnGhost}`}
                onClick={() => navigate(-1)}
              >
                나가기
              </button>
              <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
                작성하기
              </button>
            </div>
          </form>
        </section>
      </main>
    </>
  );
}
