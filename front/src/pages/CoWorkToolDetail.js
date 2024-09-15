import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import SortableTree, {
  addNodeUnderParent,
  removeNodeAtPath,
} from "react-sortable-tree";
import "react-sortable-tree/style.css"; // 트리 스타일을 불러옵니다.
import "./CoWorkToolDetail.css";

function TeamBoard() {
  const { teamId } = useParams(); // 팀 ID를 URL에서 가져옴
  const [teamMembers, setTeamMembers] = useState([]); // 팀 멤버 목록
  const [fileTree, setFileTree] = useState([]); // 파일 및 폴더 트리 구조
  const [newFiles, setNewFiles] = useState([]); // 업로드할 파일 목록

  useEffect(() => {
    fetchTeamMembers();
    fetchFiles();
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
      const treeData = convertFilesToTree(response.data);
      setFileTree(treeData);
    } catch (error) {
      console.error("Error fetching files", error);
    }
  }

  // 파일 경로 기반으로 트리 구조 생성
  function convertFilesToTree(files) {
    const tree = [];

    files.forEach((file) => {
      const pathParts = file.path.split("/"); // 경로를 "/"로 분리하여 계층 구조를 생성
      let currentLevel = tree;

      pathParts.forEach((part, index) => {
        const existingPath = currentLevel.find((node) => node.title === part);

        if (existingPath) {
          currentLevel = existingPath.children;
        } else {
          const newNode = {
            title: part,
            children: [],
            expanded: true,
            ...(index === pathParts.length - 1 && !file.isFolder
              ? { downloadUrl: file.url } // 파일일 경우에만 다운로드 URL을 추가
              : {}),
          };
          currentLevel.push(newNode);
          currentLevel = newNode.children;
        }
      });
    });

    return tree;
  }

  // 파일과 폴더 업로드
  async function handleFileUpload(event) {
    event.preventDefault();
    const formData = new FormData();

    // 선택한 파일과 폴더를 업로드할 폼 데이터에 추가
    newFiles.forEach((file) => {
      formData.append("files", file);
    });

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
      console.error("Error uploading files", error);
    }
  }

  // 폴더 및 파일 선택 처리
  function handleFileSelection(event) {
    const files = Array.from(event.target.files);
    setNewFiles(files); // 업로드할 파일 목록 설정
  }

  return (
    <div className="team-board-container">
      {/* 팀원 소개 및 역할 */}
      <section className="team-members">
        <h3>팀원 소개 및 역할</h3>
        <ul>
          {teamMembers.map((member) => (
            <li key={member.id}>
              {member.nickname} - {member.role}
            </li>
          ))}
        </ul>
      </section>

      {/* 파일 관리 및 버전 관리 */}
      <section className="file-management">
        <h3>파일 관리 및 버전 관리</h3>
        <div style={{ height: 400 }}>
          <SortableTree
            treeData={fileTree}
            onChange={setFileTree} // 트리 데이터 변경 처리
            generateNodeProps={({ node, path }) => ({
              title: (
                <span>
                  {node.downloadUrl ? (
                    <a href={node.downloadUrl} download>
                      {node.title}
                    </a>
                  ) : (
                    node.title
                  )}
                </span>
              ),
            })}
          />
        </div>
        <form onSubmit={handleFileUpload}>
          <input
            type="file"
            webkitdirectory="true"
            multiple
            onChange={handleFileSelection}
          />
          <button type="submit">파일 및 폴더 업로드</button>
        </form>
      </section>
    </div>
  );
}

export default TeamBoard;
