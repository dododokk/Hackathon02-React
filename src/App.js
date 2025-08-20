import React from "react";
import { Routes, Route, useNavigate } from 'react-router-dom';
import styles from "./App.css";
import Home from "./component/Home";
import Title from "./component/Title";
import Login from "./component/Login";
import background from "./img/background.png";
import introImg from "./img/exampleIMG.png"; //예시 이미지. 사이트 다 만들고 나면 우리 사이트 화면 사진으로 변경하기!

function App() {
  //배경화면 설정 위한 인라인 css
  const backgroundStyle = {
    backgroundImage: `url(${background})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    width: '100vw',
    height: '100vh',
  };

  const navigate = useNavigate();

  return (
    <div className="App" style={backgroundStyle}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </div>
  );
}

export default App;
