import React, { useState, useEffect } from "react";
import axios from "axios";
import Markdown from "markdown-to-jsx";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { prism } from "react-syntax-highlighter/dist/esm/styles/prism"; // 선택한 하이라이트 스타일
import styles from "./WikiBoard.module.css";

function WikiBoard({ teamId }) {
  const [wikiContent, setWikiContent] = useState(""); // 위키 문서 내용
  const [editMode, setEditMode] = useState(false); // 문서 편집 모드
  const [title, setTitle] = useState("프로젝트 위키 문서"); // 문서 제목

  useEffect(() => {
    fetchWikiContent(); // 문서 불러오기
  }, [teamId]);

  // 문서 불러오기
  async function fetchWikiContent() {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `http://localhost:8080/api/board/team/${teamId}/wiki`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setWikiContent(response.data.content);
    } catch (error) {
      console.error("Error fetching wiki content", error);
    }
  }

  // 문서 저장하기 (수정)
  async function handleSavePage() {
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `http://localhost:8080/api/board/team/${teamId}/wiki`,
        { content: wikiContent },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setEditMode(false); // 편집 모드 종료
    } catch (error) {
      console.error("Error saving wiki page", error);
    }
  }

  // Markdown 렌더링에서 코드 블록을 하이라이팅하기 위한 커스텀 컴포넌트
  const CodeBlock = ({ children, className }) => {
    const language = className ? className.replace("lang-", "") : "javascript"; // 언어 추출
    return (
      <SyntaxHighlighter language={language} style={prism}>
        {children}
      </SyntaxHighlighter>
    );
  };

  return (
    <div className={styles["wiki-board-container"]}>
      <h3>{title}</h3>
      {editMode ? (
        <div>
          <div className={styles["editor-and-preview"]}>
            <div className={styles["editor"]}>
              <textarea
                value={wikiContent}
                onChange={(e) => setWikiContent(e.target.value)} // 실시간 업데이트
                placeholder="문서 내용을 입력하세요..."
              ></textarea>
            </div>
            <div className={styles["preview"]}>
              <Markdown
                options={{
                  overrides: {
                    code: {
                      component: CodeBlock, // 커스텀 코드 블록 렌더러
                    },
                  },
                }}
              >
                {wikiContent}
              </Markdown>
            </div>
          </div>
          <button onClick={handleSavePage}>저장</button>
        </div>
      ) : (
        <div>
          <Markdown
            options={{
              overrides: {
                code: {
                  component: CodeBlock, // 커스텀 코드 블록 렌더러
                },
              },
            }}
          >
            {wikiContent}
          </Markdown>
          <button onClick={() => setEditMode(true)}>문서 수정</button>
        </div>
      )}
    </div>
  );
}

export default WikiBoard;
