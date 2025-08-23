// src/utils/price.ts (또는 .js)
export function perPersonKRW(productDesc, desiredMemberCount) {
  const price = Number(String(productDesc).replace(/[^\d]/g, ""));
  const count = Math.max(1, Number(desiredMemberCount) || 0);
  const isExact = price % count === 0;
  const per = isExact ? price / count : Math.floor(price / count);
  return `${isExact ? "" : "약 "}${per.toLocaleString("ko-KR")}원`;
}
