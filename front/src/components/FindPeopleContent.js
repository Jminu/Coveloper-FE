import React, { useState, useEffect } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import "./FindPeopleContent.css";

function FindPeopleContent({ isLoggedIn }) {
  const [recruitMents, setRecruitMents] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    fetchRecruitments();
  }, []);

  async function fetchRecruitments() {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        "http://localhost:8080/api/board/posts",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const recruitmentPosts = response.data.filter(
        //RECRUITMENT인것만 저장
        (post) => post.boardType === "RECRUITMENT"
      );

      setRecruitMents(recruitmentPosts.reverse());
    } catch (error) {
      console.error("Error fetching questions", error);
    }
  }

  // 날짜 포맷 함수
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }

  function handleWriteButtonClick() {
    if (isLoggedIn) {
      navigate("/writefindpeople");
    } else {
      alert("로그인이 필요합니다.");
    }
  }

  function onClickPost(recruitMentId) {
    console.log("navigate detail");
    navigate(`/posts/${recruitMentId}`);
  }

  function handleNextPage() {}

  function handlePreviousPage() {}

  return (
    <div className="post-list-container">
      <header>
        <h2>구인 게시판</h2>
        <button onClick={handleWriteButtonClick}>글쓰기</button>{" "}
        {/* 글쓰기 버튼 */}
      </header>
      <section className="post-list-section">
        {recruitMents.length > 0 ? (
          recruitMents.map((recruitMent) => (
            <article
              key={recruitMent.id}
              onClick={() => onClickPost(recruitMent.id)}
              className="post-item"
            >
              <h3>{recruitMent.title}</h3>
              <footer>
                <span>작성자: {recruitMent.authorName}</span>
                <br></br>
                <span>작성일: {formatDate(recruitMent.createdAt)}</span>
                <br></br>
                <span>
                  {recruitMent.currentMembers} / {recruitMent.teamSize}
                </span>
                {/* 팀 인원이 다 찼을 때와 아닐 때 다른 아이콘 표시 */}
                {recruitMent.currentMembers >= recruitMent.teamSize ? (
                  <img
                    src="/full-team-icon.svg"
                    alt="팀 다 참"
                    className="team-status-icon"
                  />
                ) : (
                  <img
                    src="/not-full-team-icon.svg"
                    alt="팀 덜 참"
                    className="team-status-icon"
                  />
                )}
                <span style={{ float: "right" }}>
                  <img src="/up.svg" alt="따봉" />
                  {recruitMent.upvoteCount}
                </span>
              </footer>
            </article>
          ))
        ) : (
          <p>게시글이 없습니다.</p>
        )}
      </section>
      <div className="pagination">
        <button onClick={handlePreviousPage}>이전</button>
        <span></span>
        <button onClick={handleNextPage}>다음</button>
      </div>
    </div>
  );
}

FindPeopleContent.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired, // isLoggedIn을 필수 prop으로 설정
};

export default FindPeopleContent;
