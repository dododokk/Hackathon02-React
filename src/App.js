import React from "react";
import { Routes, Route, useNavigate } from 'react-router-dom';
import "./App.css";
import Home from "./component/Home";
import Title from "./component/Title";
import Login from "./component/Login";
import Register from "./component/Register";
import Main from "./component/Main";
import MyPage from "./component/MyPage";
import Message from "./component/Message";
import Notification from "./component/Notification";
import background from "./img/background.png";
import introImg from "./img/exampleIMG.png"; //예시 이미지. 사이트 다 만들고 나면 우리 사이트 화면 사진으로 변경하기!

function App() {
  //배경화면 설정 위한 인라인 css
  const backgroundStyle = {
    // position: "fixed",   // 화면 고정
    top: 0,
    left: 0,
    width: "auto",
    height: "auto",
    margin: 0,
    padding: 0,
    overflowX: 'hidden',
    // overflow: "hidden",  // 스크롤 방지
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",

    backgroundImage: `url(${background})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed'
  };

  const navigate = useNavigate();

  return (
    <div className="App" style={backgroundStyle}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/main" element={<Main />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/message" element={<Message />} />
        <Route path="/notification" element={<Notification />} />
      </Routes>
    </div>
  );
}

export default App;
