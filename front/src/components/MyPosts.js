import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./MyPosts.css"; // 스타일을 동일하게 적용하려면 CSS 파일을 추가

const MyPosts = () => {
  const navigate = useNavigate(); // navigate 함수 추가
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMyPosts() {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:8080/api/members/posts`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setMyPosts(response.data.reverse());
        setLoading(false);
      } catch (error) {
        console.error("Error fetching posts", error);
        setLoading(false);
      }
    }

    fetchMyPosts();
  }, []);

  if (loading) {
    return <div>로딩 중...</div>;
  }

  // 글을 클릭하면 상세 페이지로 이동
  function onClickPost(postId) {
    navigate(`/posts/${postId}`);
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

  // 게시판 타입에 따른 아이콘 선택 함수
  function getBoardTypeIcon(boardType) {
    switch (boardType) {
      case "QNA":
        return "/question.svg"; // QnA 게시판 아이콘
      case "RECRUITMENT":
        return "/find-people.svg"; // 구인 게시판 아이콘
      // 다른 게시판 타입이 있는 경우 추가
      default:
        return "/icons/default-icon.svg"; // 기본 아이콘 (없을 경우)
    }
  }

  return (
    <div className="post-list-container">
      <header>
        <h2>내가 쓴 글</h2>
      </header>
      <hr></hr>
      <section className="post-list-section">
        {myPosts.length > 0 ? (
          myPosts.map((post) => (
            <article
              key={post.id}
              onClick={() => onClickPost(post.id)} // 클릭 시 상세 페이지로 이동
              className="post-item"
            >
              <h3>{post.title}</h3>
              <img
                src={getBoardTypeIcon(post.boardType)} // 게시판 타입에 따른 아이콘 삽입
                alt={`${post.boardType} 아이콘`}
                className="board-type-icon" // CSS 클래스 추가
              />
              <footer>
                <span>작성자: {post.authorName}</span>
                <br></br>
                <span>작성일: {formatDate(post.createdAt)}</span>
              </footer>
            </article>
          ))
        ) : (
          <p>작성한 글이 없습니다.</p>
        )}
      </section>
      <div className="pagination">
        <button onClick={() => {}}>이전</button>
        <span></span>
        <button onClick={() => {}}>다음</button>
      </div>
    </div>
  );
};

export default MyPosts;
