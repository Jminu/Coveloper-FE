import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  listAll,
  deleteObject,
} from "firebase/storage";
import { storage } from "./firebase"; // Firebase 설정 파일
import WikiBoard from "../components/WikiBoard";
import styles from "./CoWorkToolDetail.module.css"; // CSS Modules 방식으로 불러오기

function TeamBoard() {
  const { teamId } = useParams(); // 팀 ID를 URL에서 가져옴
  const [teamMembers, setTeamMembers] = useState([]); // 팀 멤버 목록
  const [files, setFiles] = useState([]); // 파일 목록
  const [newFiles, setNewFiles] = useState([]); // 업로드할 파일 목록
  const [uploadProgress, setUploadProgress] = useState(0); // 업로드 진행률

  useEffect(() => {
    fetchTeamMembers(); // 팀원 정보 불러오기
    fetchFiles(); // Firebase에서 파일 목록 불러오기
  }, [teamId]);

  // 팀원 정보 가져오기
  async function fetchTeamMembers() {
    const token = localStorage.getItem("token");

    try {
      const response = await axios.get(
        `http://localhost:8080/api/board/post/${teamId}/team-members`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTeamMembers(response.data); //팀원 정보 저장
    } catch (error) {
      console.error("Error fetching team members", error);
    }
  }

  // Firebase Storage에서 파일 목록 가져오기
  async function fetchFiles() {
    const folderRef = ref(storage, `teams/${teamId}/`);
    try {
      const result = await listAll(folderRef);
      const filePromises = result.items.map((itemRef) =>
        getDownloadURL(itemRef).then((url) => ({
          name: itemRef.name,
          url,
          fullPath: itemRef.fullPath,
        }))
      );
      const fileList = await Promise.all(filePromises);
      setFiles(fileList); // 파일 목록 설정
    } catch (error) {
      console.error("Error fetching files", error);
    }
  }

  // Firebase Storage에 파일 업로드
  async function handleFileUpload(event) {
    event.preventDefault();
    newFiles.forEach((file) => {
      const storageRef = ref(storage, `teams/${teamId}/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Error uploading file", error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((url) => {
            setFiles((prevFiles) => [
              ...prevFiles,
              {
                name: file.name,
                url,
                fullPath: uploadTask.snapshot.ref.fullPath,
              },
            ]); // 업로드된 파일 목록 갱신
          });
        }
      );
    });
  }

  // 파일 선택 처리
  function handleFileSelection(event) {
    const files = Array.from(event.target.files);
    setNewFiles(files); // 업로드할 파일 목록 설정
  }

  // 파일 삭제 처리
  async function handleDeleteFile(fullPath) {
    const fileRef = ref(storage, fullPath);
    try {
      await deleteObject(fileRef);
      setFiles((prevFiles) =>
        prevFiles.filter((file) => file.fullPath !== fullPath)
      );
    } catch (error) {
      console.error("Error deleting file", error);
    }
  }

  return (
    <div className={styles["team-board-container"]}>
      {/* 팀원 소개 및 역할 */}
      <section className={styles["team-members"]}>
        <h3>팀원</h3>
        <ul>
          {teamMembers.map((member) => (
            <li key={member.id}>{member.nickname}</li>
          ))}
        </ul>
      </section>

      {/* 파일 관리 및 버전 관리 */}
      <section className={styles["file-management"]}>
        <h3>파일 관리</h3>
        <div>
          <h4>업로드된 파일들:</h4>
          <ul>
            {files.map((file, index) => (
              <li key={index}>
                <a href={file.url} target="_blank" rel="noopener noreferrer">
                  {file.name}
                </a>
                <button onClick={() => handleDeleteFile(file.fullPath)}>
                  삭제
                </button>
              </li>
            ))}
          </ul>
        </div>
        <form onSubmit={handleFileUpload}>
          <input type="file" multiple onChange={handleFileSelection} />
          <button type="submit">파일 업로드</button>
        </form>
        {uploadProgress > 0 && <p>업로드 진행률: {uploadProgress}%</p>}
      </section>

      {/* Wiki 문서 관리 */}
      <section className="wiki-board">
        <WikiBoard teamId={teamId} /> {/* teamId를 WikiBoard에 전달 */}
      </section>
    </div>
  );
}

export default TeamBoard;
