import React from "react";
import { useNavigate } from "react-router-dom";
import Title from "./Title";
import styles from "../style/Home.module.css";

// Swiper.js 관련 컴포넌트 및 CSS import
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

// 사용할 이미지들을 import 합니다.
import thumb1 from "../img/thumb1.png";
import thumb2 from "../img/thumb2.png";
import thumb3 from "../img/thumb3.png";

function Home() {
    const navigate = useNavigate();
    // 루프 기능의 안정성을 위해 이미지 배열을 2번 반복합니다.
    const images = [thumb1, thumb2, thumb3, thumb1, thumb2, thumb3];

    return (
        <div className={styles.Home}>
            <Title />

            {/* Swiper를 감싸는 새로운 컨테이너. 이 컨테이너가 3개만 보이도록 강제합니다. */}
            <div className={styles.sliderContainer}>
                <Swiper
                    modules={[Autoplay]}
                    loop={true}
                    slidesPerView={'auto'}
                    centeredSlides={true}
                    autoplay={{
                        delay: 3000,
                        disableOnInteraction: false,
                    }}
                    className={styles.mySwiper}
                >
                    {images.map((img, index) => (
                        <SwiperSlide key={index} className={styles.swiperSlide}>
                            <img src={img} alt={`slide ${index + 1}`} />
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>


            <div className={styles.loginBtn}>
                <button className={styles.login} onClick={() => navigate("/login")}>
                    로그인
                </button>
                <span>|</span>
                <button className={styles.register} onClick={() => navigate("/register")}>
                    회원가입
                </button>
            </div>
        </div>
    );
}

export default Home;