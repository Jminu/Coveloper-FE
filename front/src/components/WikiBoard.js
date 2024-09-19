import React, { useState, useEffect } from "react";
import axios from "axios";
import Markdown from "markdown-to-jsx";
import "./WikiBoard.css";

function WikiBoard({ teamId }) {
  const [wikiContent, setWikiContent] = useState(""); // 위키 문서 내용
  const [editMode, setEditMode] = useState(false); // 문서 편집 모드
  const [title, setTitle] = useState("프로젝트 위키 문서"); // 문서 제목

  useEffect(() => {
    fetchWikiContent(); // 문서 불러오기
  }, [teamId]);

  // 문서 불러오기
  async function fetchWikiContent() {
    try {
      const response = await axios.get(`http://localhost:8080/wiki/${teamId}`);
      setWikiContent(response.data.content);
    } catch (error) {
      console.error("Error fetching wiki content", error);
    }
  }

  // 문서 저장하기 (수정)
  async function handleSavePage() {
    try {
      const pageData = {
        title,
        content: wikiContent,
      };

      await axios.put(`http://localhost:8080/wiki/${teamId}`, pageData);
      setEditMode(false); // 편집 모드 종료
    } catch (error) {
      console.error("Error saving wiki page", error);
    }
  }

  return (
    <div className="wiki-board-container">
      <h3>{title}</h3>
      {editMode ? (
        <div>
          <textarea
            value={wikiContent}
            onChange={(e) => setWikiContent(e.target.value)}
            placeholder="문서 내용을 입력하세요..."
          ></textarea>
          <button onClick={handleSavePage}>저장</button>
        </div>
      ) : (
        <div>
          <Markdown>{wikiContent}</Markdown>
          <button onClick={() => setEditMode(true)}>문서 수정</button>
        </div>
      )}
    </div>
  );
}

export default WikiBoard;
