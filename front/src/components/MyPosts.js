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
              <footer>
                <span>작성자: {post.authorName}</span>
                <br></br>
                <span>작성일: {post.createdAt}</span>
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
