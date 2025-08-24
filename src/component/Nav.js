import React, { useState } from "react";
import styles from "../style/Nav.module.css";
import { useLocation, useNavigate } from "react-router-dom";

function Nav() {
    const navigate = useNavigate();
    const location = useLocation();
    const menus = [
        { name: "HOME", path: "/main" },
        { name: "NOTIFICATION", path: "/notification" },
        { name: "MESSAGE", path: ["/message", "/chat"] },
        { name: "MY PAGE", path: "/mypage" }
    ];

    return (
        <nav>
            <div className={styles.menuBar}>
                {menus.map((menu) => (
                    <span
                        key={menu.name}
                        className={`${styles.menu} ${(Array.isArray(menu.path)
                            ? menu.path.includes(location.pathname)   // 배열이면 포함 여부 확인
                            : location.pathname === menu.path)
                            ? styles.active
                            : ""}`}
                        onClick={() => navigate(Array.isArray(menu.path)
                            ? menu.path[0]  // ✅ 첫 번째 경로로 이동
                            : menu.path)}>
                        {menu.name}
                    </span>
                ))}

            </div>
            <hr />
        </nav >
    );
}

export default Nav;