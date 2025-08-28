import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import InnerTitle from "./InnerTitle";
import styles from "../style/Write.module.css";
import { API_BASE } from "../config";
import Swal from "sweetalert2";

const CATEGORIES = ["식품", "생활용품", "사무용품", "반려용품", "기타"];
const URL_MAX = 2000;
const PRODUCT_URL_DB_MAX = 255;
function sanitizeProductUrl(input) {
  const trimmed = (input || "")
    .trim()
    // 붙여넣기 시 들어올 수 있는 제로폭 문자 제거
    .replace(/[\u200B-\u200D\uFEFF]/g, "");

  if (!trimmed) return { ok: true, value: undefined }; // 빈 값이면 필드 자체 제거

  // 스킴이 없으면 https 붙이기
  const withScheme = /^(https?:)?\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  let u;
  try {
    u = new URL(withScheme);
  } catch {
    return { ok: false, msg: "URL 형식이 올바르지 않습니다." };
  }

  // http/https만 허용
  if (!/^https?:$/.test(u.protocol)) {
    return { ok: false, msg: "URL은 http 또는 https만 허용됩니다." };
  }

  // 흔한 트래킹 파라미터 제거 (길이 단축 + 서버 부하 감소)
  const dropKeys = new Set([
    "utm_source","utm_medium","utm_campaign","utm_term","utm_content",
    "fbclid","gclid","igshid","mc_eid","mc_cid"
  ]);
  [...u.searchParams.keys()].forEach(k => { if (dropKeys.has(k)) u.searchParams.delete(k); });

  // #fragment 제거
  u.hash = "";
  
  let s = u.toString();
  if(s.length > URL_MAX) {
    return{ok:false, msg: `URL이 너무 깁니다. 최대 ${URL_MAX}자까지 허용됩니다.`}
  }
  if (s.length > PRODUCT_URL_DB_MAX) {
    // 2) 모든 쿼리스트링 제거 후 한 번 더 시도
    u.search = "";
    s = u.toString();
    if (s.length > PRODUCT_URL_DB_MAX) {
      return { ok: false, msg: `URL이 너무 깁니다. 최대 ${PRODUCT_URL_DB_MAX}자까지 허용됩니다.` };
    }
  }
  return { ok: true, value: s };
}


export default function Write() {
  const navigate = useNavigate();

  // form state
  const [title, setTitle] = useState("");
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [people, setPeople] = useState(2);
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("");
  const [desc, setDesc] = useState("");
  const [image, setImage] = useState(null); // { file, preview }
  const fileRef = useRef(null);

  const titleLimit = 20;
  const titleCount = useMemo(() => `${title.length}/${titleLimit}`, [title]);

  const selectCategory = (name) => {
    setCategory((prev) => (prev === name ? "" : name));
  };

  const onSelectImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      Swal.fire({
        icon: "warning",
        text: "이미지 파일을 선택해주세요.",
        confirmButtonText: "확인",
        confirmButtonColor: "#1f8954ff"
      });
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setImage({ file, preview: objectUrl });
    e.target.value = "";
  };

  // 미리보기 URL 정리
  useEffect(() => {
    return () => {
      if (image?.preview) URL.revokeObjectURL(image.preview);
    };
  }, [image]);

  const validate = () => {
    if (!title.trim()) return { ok: false, msg: "제목을 입력해주세요." };
    if (title.trim().length > titleLimit) return { ok: false, msg: `제목은 ${titleLimit}자 이내로 입력해주세요.` };
    if (!productName.trim()) return { ok: false, msg: "제품명을 입력해주세요." };
    if (!price.trim()) return { ok: false, msg: "가격을 입력해주세요." };
    if (isNaN(Number(price.replaceAll(",", "")))) return { ok: false, msg: "가격은 숫자만 입력해주세요." };
    if (!category) return { ok: false, msg: "카테고리를 선택해주세요." };

    if (url) {
      const sv = sanitizeProductUrl(url);
      if (!sv.ok) return { ok: false, msg: sv.msg };
    }
    return { ok: true };
  };



  // 1) 이미지 먼저 업로드 → 2) 응답 URL을 mainImageUrl로 사용
  async function uploadImage(file, token) {
    const form = new FormData();
    form.append("file", file, file.name);

    const res = await fetch(`${API_BASE}/files`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`, // 서버가 인증 요구한다면 유지
        // Content-Type 지정 금지: FormData가 자동 설정(boundary 포함)
      },
      body: form,
    });
    if (!res.ok) throw new Error(`이미지 업로드 실패 (HTTP ${res.status})`);
    const data = await res.json(); // { url: "https://..." } 기대
    if (!data?.url) throw new Error("업로드 응답에 url 없음");
    return data.url;
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (!v.ok) {
      Swal.fire({
        icon: "warning",
        text: v.msg,
        confirmButtonText: "확인",
        confirmButtonColor: "#1f8954ff"
      });
      return;
    }

    try {
      const token = localStorage.getItem("jwt");
      if (!token) {
        alert("인증 토큰이 없습니다. 먼저 로그인해주세요.");
        return;
      }

      // 1) 파일이 있으면 서버에 업로드해 공개 URL 받기
      let mainImageUrl = null;
      if (image?.file) {
        mainImageUrl = await uploadImage(image.file, token);
      }

      // 2) 게시글 생성(JSON)
      const safeUrl = sanitizeProductUrl(url);
      if (!safeUrl.ok) {
        return Swal.fire({
          icon: "warning",
          text: safeUrl.msg,
          confirmButtonText: "확인",
          confirmButtonColor: "#1f8954ff",
        });
      }

      const body = {
        title: title.trim(),
        category,
        productName: productName.trim(),
        ...(safeUrl.value ? { productUrl: safeUrl.value } : {}), // 값이 있을 때만 key 포함
        productDesc: price.trim(),
        desiredMemberCount: Number(people),
        content: desc.trim(),
        ...(mainImageUrl ? { mainImageUrl } : {}),
      };


      const res = await fetch(`${API_BASE}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const saved = await res.json();
      Swal.fire({
        icon: "success",
        text: "게시글 작성이 완료되었습니다.",
        confirmButtonText: "확인",
        confirmButtonColor: "#1f8954ff",
      });
      navigate(-1);
    } catch (err) {
      console.error(err);
      alert(`저장 중 오류 발생: ${err.message || err}`);
    }
  };

  return (
    <div className={styles.writewrapper}>
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
                  placeholder="20자 이내로 입력하세요..."
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
              <label className={styles.label}>가격</label>
              <input
                className={`${styles.input} ${styles.inputPrice}`}
                type="text"
                inputMode="numeric"
                placeholder="가격 입력"
                value={price}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, "");
                  if (raw === "") {
                    setPrice("");
                    return;
                  }
                  const formatted = Number(raw).toLocaleString("ko-KR");
                  setPrice(formatted);
                }}
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
              <label className={styles.label}>URL</label>
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
                  const active = category === name;
                  return (
                    <button
                      key={name}
                      type="button"
                      className={`${styles.chip} ${active ? styles.chipOn : ""}`}
                      onClick={() => selectCategory(name)}
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
                    >
                      ✕
                    </button>
                  </div>
                ) : (
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
    </div>
  );
}
