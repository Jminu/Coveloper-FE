import React, { useState, useEffect } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import "./FindPeopleContent.css";

function FindPeopleContent({ isLoggedIn }) {
  const [questions, setQuestions] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    fetchQuestions();
  }, []);

  async function fetchQuestions(page) {
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
      setQuestions(response.data.reverse());
    } catch (error) {
      console.error("Error fetching questions", error);
    }
  }

  function handleWriteButtonClick() {
    if (isLoggedIn) {
      navigate("/writefindpeople");
    } else {
      alert("로그인이 필요합니다.");
    }
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
        {questions.length > 0 ? (
          questions.map((question) => (
            <article
              key={question.id}
              onClick={() => onClickPost(question.id)}
              className="post-item"
            >
              <h3>{question.title}</h3>
              <footer>
                <span>작성자: {question.authorName}</span>
                <br></br>
                <span>작성일: {question.createdAt}</span>
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
