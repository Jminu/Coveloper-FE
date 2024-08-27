import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getUserInfo } from "../utils/auth";

function WriteQnAPost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUser() {
      const userInfo = await getUserInfo();
      if (userInfo) {
        setAuthor(userInfo.nickname);
      }
    }
    fetchUser();
  });

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      const response = await axios.post("http://localhost:8080/api/posts", {
        title,
        content,
        author,
      });

      if (response.status === 201) {
        //백엔드는 성공적으로 저장하면 201 created를 반환함
        alert("글이 성공적으로 작성되었습니다.");
        navigate("/"); // 메인 페이지로 이동
      } else {
        alert("글 작성에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (error) {
      console.error("Error submitting post", error);
      alert("오류가 발생했습니다. 나중에 다시 시도해주세요.");
    }
  }

  return (
    <div>
      <h2>QnA글쓰기</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">제목:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="content">내용:</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>
        <button type="submit">제출</button>
      </form>
    </div>
  );
}

export default WriteQnAPost;
