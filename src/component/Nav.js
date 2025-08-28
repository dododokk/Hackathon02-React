import React, { useState } from "react";
import styles from "../style/Nav.module.css";
import { useLocation, useNavigate } from "react-router-dom";
import { readAllFromStorage } from "../utils/readAllQuick"; // ✅ 추가

function Nav() {
    const navigate = useNavigate();
    const location = useLocation();
    const menus = [
        { name: "HOME", path: "/main" },
        { name: "NOTIFICATION", path: "/notification" },
        { name: "MESSAGE", path: ["/message", "/chat"] },
        { name: "MY PAGE", path: "/mypage" }
    ];

    const isActive = (menu, pathname) =>
        Array.isArray(menu.path) ? menu.path.includes(pathname) : pathname === menu.path;

    const go = (menu) => () => {
        // ✅ 야매: 현재 채팅방이 있으면 서버에 read-all 쏘기
        readAllFromStorage();
        // ✅ 이동
        navigate(Array.isArray(menu.path) ? menu.path[0] : menu.path);
    };

    // return (
    //     <nav className={styles.nav}>
    //         <div className={styles.menuBar}>
    //             {menus.map((menu) => (
    //                 <span
    //                     key={menu.name}
    //                     className={`${styles.menu} ${(Array.isArray(menu.path)
    //                         ? menu.path.includes(location.pathname)   // 배열이면 포함 여부 확인
    //                         : location.pathname === menu.path)
    //                         ? styles.active
    //                         : ""}`}
    //                     onClick={() => navigate(Array.isArray(menu.path)
    //                         ? menu.path[0]  // ✅ 첫 번째 경로로 이동
    //                         : menu.path)}>
    //                     {menu.name}
    //                 </span>
    //             ))}

    //         </div>
    //     </nav >
    // );
    return (
        <nav className={styles.nav}>
            <div className={styles.menuBar}>
                {menus.map((menu) => (
                    <span
                        key={menu.name}
                        className={`${styles.menu} ${isActive(menu, location.pathname) ? styles.active : ""}`}
                        onClick={go(menu)}
                    >
                        {menu.name}
                    </span>
                ))}
            </div>
        </nav>
    );
}

export default Nav;