import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  listAll,
  deleteObject,
  getMetadata,
  updateMetadata,
} from "firebase/storage";
import { storage } from "./firebase"; // Firebase 설정 파일
import WikiBoard from "../components/WikiBoard";
import styles from "./CoWorkToolDetail.module.css"; // CSS Modules 방식으로 불러오기
import { getUserInfo } from "../utils/auth";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { prism } from "react-syntax-highlighter/dist/esm/styles/prism"; // 하이라이팅 스타일

function TeamBoard() {
  const { teamId } = useParams(); // 팀 ID를 URL에서 가져옴
  const [teamMembers, setTeamMembers] = useState([]); // 팀 멤버 목록
  const [files, setFiles] = useState([]); // 파일 목록
  const [newFiles, setNewFiles] = useState([]); // 업로드할 파일 목록
  const [uploadProgress, setUploadProgress] = useState(0); // 업로드 진행률
  const [userInfo, setUserInfo] = useState(null); // 사용자 정보 저장
  const [previewContent, setPreviewContent] = useState(""); // 파일 미리보기 내용 저장
  const [previewFileType, setPreviewFileType] = useState(""); // 파일 타입 저장
  const [isEditing, setIsEditing] = useState(false); // 수정 모드 여부
  const [editedContent, setEditedContent] = useState(""); // 수정된 파일 내용 저장
  const [selectedFileRef, setSelectedFileRef] = useState(null); // 선택된 파일의 Firebase 참조 저장
  const [lastModifiedBy, setLastModifiedBy] = useState(""); // 마지막 수정자
  const [lastModifiedAt, setLastModifiedAt] = useState(""); // 마지막 수정 시간

  useEffect(() => {
    fetchTeamMembers(); // 팀원 정보 불러오기
    fetchFiles(); // Firebase에서 파일 목록 불러오기
    fetchUserInfo(); // 사용자 정보 불러오기
  }, [teamId]);

  async function fetchUserInfo() {
    const info = await getUserInfo();
    setUserInfo(info);
  }

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
      setTeamMembers(response.data); // 팀원 정보 저장
    } catch (error) {
      console.error("Error fetching team members", error);
    }
  }

  // Firebase Storage에서 파일 목록 가져오기
  async function fetchFiles() {
    const folderRef = ref(storage, `teams/${teamId}/`);
    try {
      const result = await listAll(folderRef);
      const filePromises = result.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        const metadata = await getMetadata(itemRef); // 메타데이터 가져오기
        return {
          name: itemRef.name,
          url,
          fullPath: itemRef.fullPath,
          ref: itemRef, // Firebase 참조 저장
          uploadedBy: metadata.customMetadata?.uploadedBy || "Unknown",
          uploadedAt: metadata.customMetadata?.uploadedAt || "Unknown",
          lastModifiedBy: metadata.customMetadata?.lastModifiedBy || "Unknown",
          lastModifiedAt: metadata.customMetadata?.lastModifiedAt || "Unknown",
        };
      });
      const fileList = await Promise.all(filePromises);
      setFiles(fileList); // 파일 목록 설정
    } catch (error) {
      console.error("Error fetching files", error);
    }
  }

  // 파일 미리보기 처리 및 수정 모드 설정
  async function handlePreviewFile(file) {
    try {
      const response = await fetch(file.url);
      const text = await response.text();
      setPreviewContent(text); // 미리보기 내용 설정
      setEditedContent(text); // 수정할 파일 내용 초기화
      setSelectedFileRef(file.ref); // Firebase 참조 저장
      setIsEditing(false); // 처음에는 미리보기 상태
      const extension = file.name.split(".").pop().toLowerCase();
      setPreviewFileType(extension); // 파일 타입 설정
      setLastModifiedBy(file.lastModifiedBy); // 마지막 수정자 설정
      setLastModifiedAt(file.lastModifiedAt); // 마지막 수정 시간 설정
    } catch (error) {
      console.error("Error previewing file", error);
    }
  }

  // 수정 모드 전환
  function toggleEditMode() {
    setIsEditing(!isEditing);
  }

  // 수정된 파일 저장
  async function saveEditedFile() {
    if (!selectedFileRef) return;

    try {
      const blob = new Blob([editedContent], { type: "text/plain" });
      const uploadTask = uploadBytesResumable(selectedFileRef, blob);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Error saving file", error);
        },
        async () => {
          // 파일이 성공적으로 저장되면 수정자 정보와 수정 시간을 메타데이터에 업데이트
          const lastModifiedAt = new Date().toLocaleString();
          const lastModifiedBy = userInfo ? userInfo.nickname : "Unknown";
          const metadata = {
            customMetadata: {
              lastModifiedBy,
              lastModifiedAt,
            },
          };
          await updateMetadata(uploadTask.snapshot.ref, metadata);

          console.log("File saved successfully!");
          setPreviewContent(editedContent);
          setIsEditing(false); // 저장 후 수정 모드 종료
          setLastModifiedBy(lastModifiedBy); // UI에 반영
          setLastModifiedAt(lastModifiedAt); // UI에 반영
        }
      );
    } catch (error) {
      console.error("Error saving edited file", error);
    }
  }

  // Firebase Storage에 파일 업로드 처리
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
          // 업로드 완료 후 메타데이터 업데이트
          const uploadedAt = new Date().toLocaleString();
          const uploadedBy = userInfo ? userInfo.nickname : "Unknown";
          const metadata = {
            customMetadata: {
              uploadedBy,
              uploadedAt,
            },
          };
          updateMetadata(uploadTask.snapshot.ref, metadata).then(() => {
            getDownloadURL(uploadTask.snapshot.ref).then((url) => {
              setFiles((prevFiles) => [
                ...prevFiles,
                {
                  name: file.name,
                  url,
                  fullPath: uploadTask.snapshot.ref.fullPath,
                  uploadedBy,
                  uploadedAt,
                },
              ]); // 업로드된 파일 목록 갱신
            });
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

  // 하이라이팅 처리 여부에 따른 렌더링
  function renderPreview() {
    if (isEditing) {
      return (
        <textarea
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          className={styles["file-editor"]}
        ></textarea>
      );
    }

    if (["js", "java", "c", "html", "css"].includes(previewFileType)) {
      return (
        <SyntaxHighlighter language={previewFileType} style={prism}>
          {previewContent}
        </SyntaxHighlighter>
      );
    }
    return <pre>{previewContent}</pre>; // 텍스트 파일의 경우
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
                <span>
                  (업로드한 사람: {file.uploadedBy}, 시간: {file.uploadedAt})
                </span>
                <span>
                  {file.lastModifiedBy &&
                    ` | 마지막 수정: ${file.lastModifiedBy}, 시간: ${file.lastModifiedAt}`}
                </span>
                <button onClick={() => handleDeleteFile(file.fullPath)}>
                  삭제
                </button>
                <button onClick={() => handlePreviewFile(file)}>
                  미리보기
                </button>
              </li>
            ))}
          </ul>
        </div>
        {previewContent && (
          <div className={styles["file-preview"]}>
            <h4>파일 미리보기 및 수정:</h4>
            {renderPreview()} {/* 코드 하이라이팅 및 수정 지원 */}
            {isEditing ? (
              <button onClick={saveEditedFile}>저장</button>
            ) : (
              <button onClick={toggleEditMode}>수정</button>
            )}
          </div>
        )}

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
