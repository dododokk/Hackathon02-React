import React, { useState } from "react";
import styles from "../style/Nav.module.css";
import { useLocation, useNavigate } from "react-router-dom";

function Nav() {
    const navigate = useNavigate();
    const location = useLocation();
    const menus = [
        { name: "HOME", path: "/main" },
        { name: "NOTIFICATION", path: "/notification" },
        { name: "MESSAGE", path: "/message" },
        { name: "MY PAGE", path: "/mypage" }
    ];

    return (
        <nav>
            <div className={styles.menuBar}>
                {menus.map((menu) => (
                    <span
                        key={menu.name}
                        className={`${styles.menu} ${location.pathname === menu.path ? styles.active : ""}`}
                        onClick={() => navigate(menu.path)}
                    >
                        {menu.name}
                    </span>
                ))}

            </div>
            <hr />
        </nav>
    );
}

export default Nav;