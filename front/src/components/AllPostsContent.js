//전체 글 게시판(쓰는기능은 없고 읽기 전용)
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AllPostsContent.css";

function AllPostsContent() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetchAllPosts();
  }, []);

  async function fetchAllPosts() {
    try {
      let token = localStorage.getItem("token");
      // 모든 게시판의 글들을 가져오는 API를 호출
      const response = await axios.get(
        "http://localhost:8080/api/board/posts",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setPosts(response.data.reverse()); // 전체 게시글을 가져온다
    } catch (error) {
      console.error("Error fetching all posts", error);
    }
  }

  function onClickPreviousPage() {}

  function onClickNextPage() {}

  function onClickPost(postId) {
    console.log("navigate detail");
    navigate(`/posts/${postId}`);
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

  return (
    <div className="post-list-container">
      {/*
      <header>
        <h2>전체 글 게시판</h2>
      </header>
      <hr></hr>
      */}
      <section className="post-list-section">
        {posts.map((post) => (
          <article
            key={post.id}
            onClick={() => onClickPost(post.id)}
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
              <span style={{ float: "right" }}>
                <img src="/up.svg" alt="따봉" />
                {post.upvoteCount}
              </span>
            </footer>
          </article>
        ))}
      </section>
      <div className="pagination">
        <button onClick={onClickPreviousPage}>이전</button>
        <span></span>
        <button onClick={onClickNextPage}>다음</button>
      </div>
    </div>
  );
}

export default AllPostsContent;
