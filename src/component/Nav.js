import React, { useState } from "react";
import styles from "../style/Nav.module.css";
import { useLocation, useNavigate } from "react-router-dom";
import { readAllFromStorage } from "../utils/readAllQuick";

function Nav() {
    const navigate = useNavigate();
    const location = useLocation();
    const menus = [
        { name: "HOME", path: "/main" },
        { name: "NOTIFICATION", path: "/notification" },
        { name: "CHAT", path: ["/message", "/chat"] },
        { name: "MY PAGE", path: "/mypage" }
    ];

    const isActive = (menu, pathname) =>
        Array.isArray(menu.path) ? menu.path.includes(pathname) : pathname === menu.path;

    const go = (menu) => () => {

        readAllFromStorage();

        navigate(Array.isArray(menu.path) ? menu.path[0] : menu.path);
    };

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