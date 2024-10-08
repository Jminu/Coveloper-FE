/*
메인 페이지
*/

import { useCallback } from "react";
import LoginMessage from "../components/LoginMessage";
import styles from "./Main2.module.css";
import { useNavigate } from "react-router-dom";
import AllPostsContent from "../components/AllPostsContent";
import HomeContent from "../components/HomeContent";
import QnAContent from "../components/QnAContent";
import { useState } from "react";
import FindPeopleContent from "../components/FindPeopleContent";
import CalendarComponent from "../components/Calendar";
import MyPosts from "../components/MyPosts";
import CoWorkToolContent from "../components/CoWorkToolContent";
import ChatBot from "../components/ChatBot";
import CalendarPage from "./CalendarPage";
import MainChatbot from "../components/MainChatbot";

const Main = ({ isLoggedIn, userInfo }) => {
  const [selectedMenu, setSelectedMenu] = useState("홈");
  const [showSidebar, setShowSidebar] = useState(true);
  const navigate = useNavigate();

  function onClickMenu(menuName) {
    console.log(`${menuName} 클릭`);
    setSelectedMenu(menuName);
    if (menuName === "캘린더" || menuName === "코딩 도우미") {
      setShowSidebar(false);
    } else {
      setShowSidebar(true);
    }
  }

  function onClickLogo() {
    navigate("/");
    window.location.reload(); // 페이지 새로고침
  }

  function renderContent(isLoggedIn) {
    switch (selectedMenu) {
      case "전체글":
        return <AllPostsContent />;
      case "홈":
        return <HomeContent />;
      case "QnA":
        return <QnAContent isLoggedIn />;
      case "구인게시판":
        return <FindPeopleContent isLoggedIn />;
      case "내가 쓴 글":
        return <MyPosts />;
      case "협업 도구":
        return <CoWorkToolContent isLoggedIn />;
      case "캘린더":
        return <CalendarPage />;
      case "코딩 도우미":
        return <MainChatbot />;
      default:
        return <HomeContent />;
    }
  }

  return (
    <div className={styles.main}>
      <main className={styles.frameParent}>
        <section className={styles.navbarItemsParent}>
          <div className={styles.navbarItems}>
            <img className={styles.icon} alt="" src="/-1.svg" />
            <div className={styles.navbarItemsInner}>
              <div
                className={styles.communityForDeveloperParent}
                onClick={onClickLogo}
              >
                <i className={styles.communityForDeveloper}>
                  Community For Developer :
                </i>
                <div className={styles.coveloperWrapper}>
                  <h1 className={styles.coveloper}>coveloper</h1>
                </div>
              </div>
            </div>
            <div className={styles.chatMessages}>
              <LoginMessage
                isLoggedIn={isLoggedIn}
                userInfo={userInfo}
                onClickMyPosts={() => onClickMenu("내가 쓴 글")}
              />
              <div
                className={styles.navbarItems1}
                onClick={() => onClickMenu("홈")}
              >
                {/**홈 버튼 */}
                <div className={styles.navbarItemsChild} />
                <img
                  className={styles.f7houseFillIcon1}
                  alt=""
                  src="/f7housefill.svg"
                />
                <div className={styles.container}>
                  <div className={styles.div6}>홈</div>
                </div>
              </div>
              <div className={styles.monthWeeksGroup}>
                <div
                  className={styles.monthWeeks2}
                  onClick={() => onClickMenu("전체글")}
                >
                  {/**전체글 버튼 */}
                  <div className={styles.monthWeeksChild} />
                  <img
                    className={styles.f7houseFillIcon}
                    loading="lazy"
                    alt=""
                    src="/f7housefill1.svg"
                  />
                  <div className={styles.menuItems}>
                    <div className={styles.div5}>전체 글</div>
                  </div>
                </div>
                <div
                  className={styles.calendar}
                  onClick={() => onClickMenu("QnA")}
                >
                  {/*QnA게시판*/}
                  <div className={styles.monthWeeksChild} />
                  <img
                    className={styles.icroundFolderIcon}
                    alt=""
                    src="/question.svg"
                  />
                  <div className={styles.frame}>
                    <div className={styles.coveloperChatbot}>QnA</div>
                  </div>
                </div>
                <div
                  className={styles.calendar}
                  onClick={() => onClickMenu("구인게시판")}
                >
                  {/*구인게시판*/}
                  <div className={styles.monthWeeksChild} />
                  <img
                    className={styles.icroundFolderIcon}
                    alt=""
                    src="/find-people.svg"
                  />
                  <div className={styles.frame}>
                    <div className={styles.coveloperChatbot}>구인게시판</div>
                  </div>
                </div>
                <div
                  className={styles.loginButtonContainer}
                  onClick={() => onClickMenu("코딩 도우미")}
                >
                  {/**챗봇 게시판 버튼 */}
                  <div className={styles.monthWeeksChild} />
                  <img
                    className={styles.humbleiconschat}
                    alt=""
                    src="/humbleiconschat.svg"
                  />
                  <div className={styles.coveloperChatbotWrapper}>
                    <div className={styles.coveloperChatbot}>코딩 도우미</div>
                  </div>
                </div>
                <div
                  className={styles.monthWeeks3}
                  onClick={() => onClickMenu("협업 도구")}
                >
                  <div className={styles.monthWeeksChild} />
                  <img
                    className={styles.ricodeBoxFillIcon}
                    alt=""
                    src="/ricodeboxfill1.svg"
                  />
                  <div className={styles.monthWeeksInner}>
                    <div className={styles.coveloperChatbot}>코딩 라운지</div>
                  </div>
                </div>
                <div
                  className={styles.navbarItems2}
                  onClick={() => onClickMenu("캘린더")}
                >
                  {/**캘린더 버튼 */}
                  <div className={styles.monthWeeksChild} />
                  <img
                    className={styles.carbonloadBalancerGlobalIcon}
                    alt=""
                    src="/calendar.svg"
                  />
                  <div className={styles.frameDiv}>
                    <div className={styles.coveloperChatbot}>캘린더</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.frameWrapper}>{renderContent()}</div>
        </section>
        {/**우측 사이드바는 showSidebar가 true일 때만 표시*/}
        {showSidebar && (
          <div className={styles.frameContainer}>
            {/*여기에 우측 사이드 메뉴 들어갈 부분 */}
            <CalendarComponent />
            <ChatBot />
          </div>
        )}
      </main>
      <div className={styles.div11} />
      <div className={styles.mainInner}></div>
    </div>
  );
};

export default Main;
