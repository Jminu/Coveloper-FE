import React, { useEffect, useState } from "react";
import axios from "axios";

const MyPosts = () => {
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
        setMyPosts(response.data);
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

  return (
    <div>
      <h2>내가 쓴 글</h2>
      {myPosts.length > 0 ? (
        <ul>
          {myPosts.map((post) => (
            <li key={post.id}>
              <h3>{post.title}</h3>
              <p>{post.content}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>작성한 글이 없습니다.</p>
      )}
    </div>
  );
};

export default MyPosts;
