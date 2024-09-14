import React, { useState, useEffect } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import "./QnAContent.css";

function QnAContent({ isLoggedIn }) {
  const [questions, setQuestions] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    fetchQuestions();
  }, []);

  async function fetchQuestions() {
    try {
      let token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:8080/api/board/posts",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const questionPosts = response.data.filter(
        //QNA인것만 저장
        (post) => post.boardType === "QNA"
      );

      setQuestions(questionPosts.reverse()); //QnA게시글들 가져온다
    } catch (error) {
      console.error("Error fetching questions", error);
    }
  }

  function onClickWriteQnABtn() {
    if (isLoggedIn) {
      navigate("/writeqna");
    } else {
      alert("로그인이 필요합니다.");
    }
  }

  function onClickPost(questionId) {
    console.log("navigate detail");
    navigate(`/posts/${questionId}`);
  }

  function onClickPreviousPage() {}

  function onClickNextPage() {}

  return (
    <div className="post-list-container">
      <header>
        <h2>QnA 게시판</h2>
        <button onClick={onClickWriteQnABtn}>글쓰기</button> {/* 글쓰기 버튼 */}
      </header>
      <hr></hr>
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
        <button onClick={onClickPreviousPage}>이전</button>
        <span></span>
        <button onClick={onClickNextPage}>다음</button>
      </div>
    </div>
  );
}

QnAContent.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired, // isLoggedIn을 필수 prop으로 설정
};

export default QnAContent;
