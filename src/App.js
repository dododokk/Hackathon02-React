import React from "react";
import styles from "./App.css";
import Title from "./component/Title";
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

  return (
    <div className="App" style={backgroundStyle}>
      <Title></Title>
      <img src={introImg} className="introImg"/>
      <div className="loginBtn">
        <button className="login">로그인</button>
        <span>|</span>
        <button className="register">회원가입</button>
      </div>
    </div>
  );
}

export default App;
