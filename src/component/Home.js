import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import Title from "./Title";
import background from "../img/background.png";
import styles from "../style/Home.module.css";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/effect-coverflow";
import { Navigation, EffectCoverflow, Autoplay } from "swiper/modules";
// 홈화면 이미지 슬라이드
import introImg from "../img/exampleIMG.png";
import introImg1 from "../img/thumb2.png";
import introImg2 from "../img/thumb.png";
import introImg3 from "../img/thumb3.png";

function Home() {
    const navigate = useNavigate();
    const swiperRef = useRef(null);
    const images = [introImg1, introImg2, introImg3];

    return (
        <div className={styles.Home}>
            <Title />

            {/* 가운데만 또렷, 양옆은 블러 + 살짝 뒤로 */}
            <Swiper
                modules={[Navigation, EffectCoverflow, Autoplay]}
                effect="coverflow"
                centeredSlides={true}
                loop
                autoplay={{
                    delay: 2000,
                    disableOnInteraction: false,
                    reverseDirection: true,
                }}
                // onSwiper={(swiper) => (swiperRef.current = swiper)} // 인스턴스 잡기
                slidesPerView="auto"
                spaceBetween={-500}   // 그대로 유지
                // loopedSlides={3}
                // loopAdditionalSlides={3}
                coverflowEffect={{
                    rotate: 0,
                    stretch: 0,
                    depth: 140,
                    modifier: 1,
                    slideShadows: false,
                }}
                className={styles.introSlider}
            >
                {images.map((img, index) => (
                        <SwiperSlide key={index} className={styles.slide}>
                            <img src={img} alt={`slide ${index + 1}`} className={styles.slideImg}/>
                        </SwiperSlide>
                    ))}
                {/* {[introImg1, introImg2, introImg3].map((src, i) => (
                    <SwiperSlide className={styles.slide} key={i}>
                        <img src={src} alt={`slide-${i}`} className={styles.slideImg} />
                    </SwiperSlide>
                ))} */}
            </Swiper>

            {/* <button
                className={styles.prevBtn}
                onClick={() => swiperRef.current?.slidePrev()}
            >
                ‹
            </button> */}
            {/* <button
                className={styles.nextBtn}
                onClick={() => swiperRef.current?.slidePrev()}
            >
                ›
            </button> */}

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
