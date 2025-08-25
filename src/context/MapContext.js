import React, { createContext, useCallback, useMemo, useRef, useState, useContext } from "react";

/**
 * 전역 지도 컨텍스트 (Naver Maps v3)
 * - map: 네이버 지도 인스턴스
 * - markers: 현재 표시 중인 마커 배열
 * - place: 마지막 지오코딩 결과 { lat, lng, roadAddress, jibunAddress, englishAddress, region, raw }
 * - initMap(containerEl, options): 지도 생성
 * - geocode(query): 주소 → 네이버 지오코딩, place 갱신하여 반환
 * - setCenter(lat, lng, zoom?): 중심 이동
 * - addMarker({lat, lng, ...opts}): 마커 추가 후 반환
 * - clearMarkers(): 모든 마커 제거
 * - fitBounds([{lat,lng}, ...]): 좌표들 보기 좋게 맞추기
 * - reset(): place/markers 초기화
 */

const MapContext = createContext(null);

export function MapProvider({ children }) {
  const [map, setMap] = useState(null);
  const markersRef = useRef([]);     // 마커 목록
  const [place, setPlace] = useState(null); // 마지막 검색 결과

  const hasNaver = typeof window !== "undefined" && window.naver && window.naver.maps;

  const initMap = useCallback((containerEl, options = {}) => {
    if (!hasNaver || !containerEl) return null;
    const defaults = {
      center: new window.naver.maps.LatLng(37.5408, 127.0790), // 건대
      zoom: 13,
      scaleControl: false,
      mapDataControl: false,
      logoControl: true,
      ...options,
    };
    const m = new window.naver.maps.Map(containerEl, defaults);
    setMap(m);
    return m;
  }, [hasNaver]);

  const setCenter = useCallback((lat, lng, zoom) => {
    if (!map || !hasNaver) return;
    const coord = new window.naver.maps.LatLng(lat, lng);
    map.setCenter(coord);
    if (typeof zoom === "number") map.setZoom(zoom, true);
  }, [map, hasNaver]);

  const addMarker = useCallback(({ lat, lng, ...opts }) => {
    if (!map || !hasNaver) return null;
    const marker = new window.naver.maps.Marker({
      position: new window.naver.maps.LatLng(lat, lng),
      map,
      ...opts,
    });
    markersRef.current.push(marker);
    return marker;
  }, [map, hasNaver]);

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
  }, []);

  const fitBounds = useCallback((points) => {
    if (!map || !hasNaver || !Array.isArray(points) || points.length === 0) return;
    const bounds = new window.naver.maps.LatLngBounds();
    points.forEach(({ lat, lng }) => bounds.extend(new window.naver.maps.LatLng(lat, lng)));
    map.fitBounds(bounds);
  }, [map, hasNaver]);

  const geocode = useCallback((query) => {
    return new Promise((resolve, reject) => {
      if (!hasNaver) return reject(new Error("NAVER_NOT_AVAILABLE"));
      if (!query) return reject(new Error("EMPTY_QUERY"));
      window.naver.maps.Service.geocode({ query }, (status, response) => {
        if (status !== window.naver.maps.Service.Status.OK) {
          return reject(new Error("GEOCODE_FAIL"));
        }
        const r = response?.v2?.addresses?.[0];
        if (!r) return reject(new Error("NO_RESULT"));

        const { x, y, roadAddress, jibunAddress, englishAddress, addressElements = [] } = r;
        const pick = (types) =>
          addressElements.find(el => types.some(t => el.types?.includes(t)))?.longName || "";

        const data = {
          lat: Number(y),
          lng: Number(x),
          roadAddress,
          jibunAddress,
          englishAddress,
          region: {
            sido:    pick(["SIDO"]),
            sigungu: pick(["SIGUGUN", "SIGUNGU"]),
            dong:    pick(["DONGMYUN", "DONG"]),
            ri:      pick(["RI"]),
          },
          raw: r,
        };
        setPlace(data);
        resolve(data);
      });
    });
  }, [hasNaver]);

  const reset = useCallback(() => {
    clearMarkers();
    setPlace(null);
  }, [clearMarkers]);

  const value = useMemo(() => ({
    map,
    place,
    initMap,
    geocode,
    setCenter,
    addMarker,
    clearMarkers,
    fitBounds,
    reset,
  }), [map, place, initMap, geocode, setCenter, addMarker, clearMarkers, fitBounds, reset]);

  return (
    <MapContext.Provider value={value}>
      {children}
    </MapContext.Provider>
  );
}

export function useMap() {
  const ctx = useContext(MapContext);
  if (!ctx) throw new Error("useMap must be used within <MapProvider>");
  return ctx;
}
