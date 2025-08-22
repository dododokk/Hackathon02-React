import React, { useState } from "react";
import styles from "../style/Nav.module.css";
import { useNavigate } from "react-router-dom";

function Nav() {
    const navigate = useNavigate();
    const [activeMenu, setActiveMenu] = useState("HOME"); // 기본 선택 HOME
    const menus = [
        { name: "HOME", path: "/main" },
        { name: "NOTIFICATION", path: "/notification" },
        { name: "MESSAGE", path: "/message" },
        { name: "MY PAGE", path: "/mypage" }
    ];

    const handleClick = (menu) => {
        setActiveMenu(menu.name);
        navigate(menu.path); // 페이지 이동
    };

    return (
        <nav>
            <div className={styles.menuBar}>
                {menus.map((menu) => (
                    <span
                        key={menu.name}
                        className={`${styles.menu} ${activeMenu === menu.name ? styles.active : ""}`}
                        onClick={() => handleClick(menu)}
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