import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function TeamBoard() {
  const { teamId } = useParams(); // 팀 ID를 URL에서 가져옴
  const [teamMembers, setTeamMembers] = useState([]); // 팀 멤버 목록
  const [files, setFiles] = useState([]); // 파일 목록
  const [wikiPages, setWikiPages] = useState([]); // 위키 페이지 목록
  const [newFile, setNewFile] = useState(null); // 업로드할 파일

  useEffect(() => {
    fetchTeamMembers();
    fetchFiles();
    fetchWikiPages();
  }, [teamId]);

  // 팀원 정보 가져오기
  async function fetchTeamMembers() {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/teams/${teamId}/members`
      );
      setTeamMembers(response.data);
    } catch (error) {
      console.error("Error fetching team members", error);
    }
  }

  // 파일 목록 가져오기
  async function fetchFiles() {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/teams/${teamId}/files`
      );
      setFiles(response.data);
    } catch (error) {
      console.error("Error fetching files", error);
    }
  }

  // 위키 페이지 목록 가져오기
  async function fetchWikiPages() {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/teams/${teamId}/wiki`
      );
      setWikiPages(response.data);
    } catch (error) {
      console.error("Error fetching wiki pages", error);
    }
  }

  // 파일 업로드
  async function handleFileUpload(event) {
    event.preventDefault();
    const formData = new FormData();
    formData.append("file", newFile);

    try {
      await axios.post(
        `http://localhost:8080/api/teams/${teamId}/files`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      fetchFiles(); // 파일 목록 갱신
    } catch (error) {
      console.error("Error uploading file", error);
    }
  }

  return (
    <div className="team-board-container">
      {/* 팀원 소개 및 역할 */}
      <section className="team-members">
        <h3>팀원 소개 및 역할</h3>
        <ul>
          {teamMembers.map((member) => (
            <li key={member.id}>
              <p>
                {member.nickname} - {member.role}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* 파일 관리 및 버전 관리 */}
      <section className="file-management">
        <h3>파일 관리 및 버전 관리</h3>
        <ul>
          {files.map((file) => (
            <li key={file.id}>
              <a href={file.url} download>
                {file.name}
              </a>{" "}
              (버전: {file.version})
            </li>
          ))}
        </ul>
        <form onSubmit={handleFileUpload}>
          <input type="file" onChange={(e) => setNewFile(e.target.files[0])} />
          <button type="submit">파일 업로드</button>
        </form>
      </section>

      {/* 팀 문서 및 위키 기능 */}
      <section className="team-wiki">
        <h3>팀 문서 및 위키</h3>
        <ul>
          {wikiPages.map((page) => (
            <li key={page.id}>
              <h4>{page.title}</h4>
              <p>{page.content}</p>
            </li>
          ))}
        </ul>
        <button>새 문서 만들기</button>
      </section>
    </div>
  );
}

export default TeamBoard;
