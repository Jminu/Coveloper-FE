import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getUserInfo } from "../utils/auth";
import "./FindPeopleWrite.css";

function WriteFindPeople({ isLoggedIn }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [projectType, setProjectType] = useState("캡스톤"); // 프로젝트 유형 상태
  const [teamSize, setTeamSize] = useState(1); // 팀 인원
  const [currentMembers, setCurrentMembers] = useState(1); // 현재 인원
  const [boardType, setBoardType] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUser() {
      const userInfo = await getUserInfo();
      if (userInfo) {
        setAuthorName(userInfo.nickname);
      }
    }
    fetchUser();
  }, []);

  // 글 작성 제출
  async function handleSubmit(event) {
    event.preventDefault();
    const token = localStorage.getItem("token");

    const postData = {
      title,
      content,
      boardType: "RECRUITMENT",
      projectType,
      teamSize,
      currentMembers,
    };

    try {
      const response = await axios.post(
        "http://localhost:8080/api/board/post",
        postData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
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
    <div className="form-container">
      <h2>구인게시판 글쓰기</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="title">제목:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="projectType">프로젝트 유형:</label>
          <select
            id="projectType"
            value={projectType}
            onChange={(e) => setProjectType(e.target.value)}
          >
            <option value="캡스톤">캡스톤</option>
            <option value="교내 대회">교내 대회</option>
            <option value="외부 대회">외부 대회</option>
            <option value="개인 프로젝트">개인 프로젝트</option>
            <option value="기타">기타</option>
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="teamSize">팀 인원:</label>
          <input
            type="number"
            id="teamSize"
            value={teamSize}
            onChange={(e) => setTeamSize(Number(e.target.value))}
            min="1"
            max="10"
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="currentSize">현재 인원:</label>
          <input
            type="number"
            id="currentMembers"
            value={currentMembers}
            onChange={(e) => setCurrentMembers(Number(e.target.value))}
            min="1"
            max={teamSize} // 팀 인원보다 큰 숫자는 입력하지 못하게 설정
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

export default WriteFindPeople;
