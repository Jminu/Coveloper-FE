import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function TeamBoard() {
  const { teamId } = useParams(); // 팀 ID를 URL에서 가져옴
  const [teamInfo, setTeamInfo] = useState(null); // 팀 정보 저장
  const [teamMembers, setTeamMembers] = useState([]); // 팀 멤버 목록 저장
  const [files, setFiles] = useState([]); // 공유된 파일 목록 저장
  const [newFile, setNewFile] = useState(null); // 업로드할 파일 저장

  useEffect(() => {
    fetchTeamInfo();
    fetchTeamMembers();
    fetchFiles();
  }, [teamId]);

  // 팀 정보 가져오기
  async function fetchTeamInfo() {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/teams/${teamId}`
      );
      setTeamInfo(response.data);
    } catch (error) {
      console.error("Error fetching team info", error);
    }
  }

  // 팀 멤버 목록 가져오기
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

  // 파일 업로드 핸들러
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
      <header>
        <h2>{teamInfo ? teamInfo.projectName : "팀 게시판"}</h2>
        <p>프로젝트 설명: {teamInfo && teamInfo.description}</p>
      </header>

      <section className="team-members">
        <h3>팀원 목록</h3>
        <ul>
          {teamMembers.map((member) => (
            <li key={member.id}>{member.nickname}</li>
          ))}
        </ul>
      </section>

      <section className="file-share">
        <h3>파일 공유</h3>
        <ul>
          {files.map((file) => (
            <li key={file.id}>
              <a href={file.url} download>
                {file.name}
              </a>
            </li>
          ))}
        </ul>

        <form onSubmit={handleFileUpload}>
          <input type="file" onChange={(e) => setNewFile(e.target.files[0])} />
          <button type="submit">파일 업로드</button>
        </form>
      </section>
    </div>
  );
}

export default TeamBoard;
