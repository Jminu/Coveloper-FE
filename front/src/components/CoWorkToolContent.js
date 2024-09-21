//전체 글 게시판(쓰는기능은 없고 읽기 전용)
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AllPostsContent.css";

function CoWorkToolContent({ isLoggedIn }) {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetchMyTeams();
  }, []);

  async function fetchMyTeams() {
    try {
      const token = localStorage.getItem("token");
      // 모든 게시판의 글들을 가져오는 API를 호출
      const response = await axios.get(
        "http://localhost:8080/api/members/teams",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data);
      setPosts(response.data.reverse());
    } catch (error) {
      console.error("Error fetching all posts", error);
    }
  }

  function onClickPreviousPage() {}

  function onClickNextPage() {}

  function onClickPost(teamId) {
    console.log("navigate to team board");
    navigate(`/teams/${teamId}`);
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
      <header>
        <h2>협업 도구</h2>
      </header>
      <hr></hr>
      <section className="post-list-section">
        {posts.map((post) => (
          <article
            key={post.id}
            onClick={() => onClickPost(post.id)}
            className="post-item"
          >
            <h3>{post.title}</h3>
            <footer>
              <span>프로젝트 인원: {post.teamSize}</span>
              <br></br>
              <span>작성일: {formatDate(post.createdAt)}</span>
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

export default CoWorkToolContent;
