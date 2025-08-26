// src/utils/image.js
export const FALLBACK_IMG = "../img/placeholder.png";

export function getDirectImageUrl(url) {
  if (!url) return FALLBACK_IMG;
  if (url.startsWith("data:image/")) return url;
  if (url.startsWith("blob:")) return url;
  if (/^https?:\/\//i.test(url)) {
    const drive = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
    if (drive) return `https://drive.google.com/uc?export=view&id=${drive[1]}`;

    if (url.includes("dropbox.com")) return url.replace("dl=0", "dl=1");

    const gh = url.match(/github\.com\/([^/]+)\/([^/]+)\/blob\/(.+)/);
    if (gh) return `https://raw.githubusercontent.com/${gh[1]}/${gh[2]}/${gh[3]}`;

    return url;
  }
  const base = (import.meta?.env?.VITE_CDN_BASE || import.meta?.env?.VITE_API_BASE_URL) || "";
  if (base.endsWith("/") && url.startsWith("/")) return base + url.slice(1);
  if (!base.endsWith("/") && !url.startsWith("/")) return `${base}/${url}`;
  return base + url;
}
