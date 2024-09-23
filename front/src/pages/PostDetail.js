/**
 * 게시물을 클릭하면 게시물로 이동
 */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { prism } from "react-syntax-highlighter/dist/esm/styles/prism"; // 스택오버플로우 유사 스타일
import Markdown from "markdown-to-jsx";
import "./PostDetail.css";
import { getUserInfo } from "../utils/auth";

function PostDetail() {
  const { id } = useParams(); // URL에서 게시물 ID를 가져옴
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [upvoteCount, setUpVoteCount] = useState(0);
  const [selectedCommentId, setSelectedCommentId] = useState(null); //채택된 댓글 ID
  const [authorName, setAuthorName] = useState(""); //글 작성자 ID
  const [currentUserName, setCurrentUserName] = useState(""); //로그인한 사용자 이름
  const [boardType, setBoardType] = useState(""); //게시판 타입

  useEffect(() => {
    fetchPostDetails();
    fetchComments();
    fetchCurrentUser();
  }, []);

  //현재 로그인한 유저의 정보 가져오기
  async function fetchCurrentUser() {
    try {
      const userInfo = await getUserInfo();
      if (userInfo) {
        setCurrentUserName(userInfo.nickname);
      }
    } catch (error) {
      console.error("Error fetching user info", error);
    }
  }

  //게시물 상세 정보 가져오기
  async function fetchPostDetails() {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:8080/api/board/post/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setPost(response.data);
      setUpVoteCount(response.data.upvoteCount);
      setAuthorName(response.data.authorName); //작성자 ID설정
      setBoardType(response.data.boardType); //게시판 타입 설정
    } catch (error) {
      console.error(
        "Error fetching post details",
        error.response?.data || error
      );
    }
  }

  //추천버튼 눌렀을 때
  async function handleUpvote() {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:8080/api/board/post/${id}/vote`,
        {}, // 서버로 요청할 때 필요한 데이터가 없으면 빈 객체 전달
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setPost((prevPost) => ({
        ...prevPost,
        upvoteCount: response.data.upvoteCount, // 서버에서 반환된 추천수로 상태 업데이트
      }));
    } catch (error) {
      console.error("Error upvoting post", error);
    }
  }

  // 댓글 목록 가져오기
  async function fetchComments() {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:8080/api/board/post/${id}/comments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      //.selected가 1인 댓글을 찾아 상단으로 이동
      const allComments = response.data;
      const selectedComment = allComments.find(
        (comment) => comment.selected === true
      );
      const otherComments = allComments.filter(
        (comment) => comment.selected !== true
      );

      // 채택된 댓글을 상단에 배치, 나머지 댓글들을 그 밑에 표시
      setComments(
        selectedComment ? [selectedComment, ...otherComments] : allComments
      );
    } catch (error) {
      console.error("Error fetching comments", error);
    }
  }

  // 댓글 채택하기
  async function handleSelectComment(commentId) {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        //여기서 commentId에 해당하는 댓글의 selected를 1로 바꿈
        `http://localhost:8080/api/board/post/${id}/select-answer/${commentId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.message);
      console.log(response.commentId);
      alert("채택 완료");
      // 댓글 목록을 다시 불러와 채택된 댓글을 상단에 표시
      fetchComments();
    } catch (error) {
      console.error("Error selecting comment", error);
    }
  }

  // 댓글 등록하기
  async function handleCommentSubmit() {
    if (newComment.trim() === "") {
      alert("댓글을 입력하세요.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:8080/api/board/post/${id}/comment`,
        {
          content: newComment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNewComment(""); // 댓글 입력 필드 초기화
      fetchComments(); // 댓글 목록 새로고침
    } catch (error) {
      console.error("Error submitting comment", error);
    }
  }

  //인원추가하기 버튼 클릭 => 유저가 속한 팀DB에 게시물 id를 추가하면됨
  async function onClickAddPeople(commentId) {
    try {
      const token = localStorage.getItem("token");

      // 게시물 id는 useParams에서 가져온 id 사용
      const postId = id;

      // 서버로 요청을 보내 팀DB에 게시물 id와 유저(commentAuthorName)를 추가
      const response = await axios.post(
        `http://localhost:8080/api/board/post/${postId}/add-member/${commentId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        alert("팀에 추가되었습니다.");
      } else {
        alert("인원 추가에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (error) {
      console.error("Error adding people", error);
      alert("오류가 발생했습니다. 나중에 다시 시도해주세요.");
    }
  }

  // 커스텀 코드 블록 렌더링
  const CodeBlock = ({ children, className }) => {
    const language = className?.replace("lang-", "") || "javascript"; // 기본적으로 JavaScript로 설정
    return (
      <SyntaxHighlighter language={language} style={prism}>
        {children}
      </SyntaxHighlighter>
    );
  };

  // 팀원 아이콘 렌더링
  function renderTeamIcons(currentMembers, teamSize) {
    const icons = [];

    // 현재 모인 인원 아이콘1 추가
    for (let i = 0; i < currentMembers; i++) {
      icons.push(
        <img
          key={`filled-${i}`}
          src="/full-team-icon.svg" // 모인 인원 아이콘
          alt="모인 인원"
          className="team-icon"
        />
      );
    }

    // 남은 인원 아이콘2 추가
    for (let i = 0; i < teamSize - currentMembers; i++) {
      icons.push(
        <img
          key={`empty-${i}`}
          src="/not-full-team-icon.svg" // 남은 인원 아이콘
          alt="남은 인원"
          className="team-icon"
        />
      );
    }

    return icons;
  }

  // 날짜 포맷 함수
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }

  if (!post) return <div>Loading...</div>;

  return (
    <div className="post-detail-container">
      <div className="post-content">
        <h2>{post.title}</h2>
        {/* 게시물 내용을 마크다운으로 렌더링 */}
        <Markdown
          options={{
            overrides: {
              code: {
                component: CodeBlock, // 코드 블록 처리
              },
            },
          }}
        >
          {post.content}
        </Markdown>
        <footer>
          <span>작성자: {post.authorName}</span>
          <br />
          <span>작성일: {formatDate(post.createdAt)}</span>
        </footer>
        <div className="upvote-and-team-container">
          <div className="upvote-container">
            <img
              src="/upButtonBlur.svg"
              alt="추천버튼"
              className="upvote-icon"
              onClick={handleUpvote}
            />
            <div>{post.upvoteCount}</div>
          </div>
          {/* boardType이 RECRUITMENT일 경우에만 필요인원과 현재인원 표시 */}
          {post.boardType === "RECRUITMENT" && (
            <div className="recruitment-info">
              <div className="team-icon">
                {renderTeamIcons(post.currentMembers, post.teamSize)}
              </div>
            </div>
          )}
        </div>
      </div>
      <section className="comments-section">
        <div className="new-comment">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="댓글을 입력하세요"
          ></textarea>
          <button onClick={handleCommentSubmit}>댓글 달기</button>
        </div>

        <h3>댓글</h3>
        {/* 댓글 목록 */}
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div
              key={comment.id}
              className={`comment ${
                comment.selected === true ? "selected-comment" : ""
              }`}
            >
              <Markdown
                options={{ overrides: { code: { component: CodeBlock } } }}
              >
                {comment.content}
              </Markdown>
              <footer>
                <span>작성자: {comment.authorName}</span>
                <br />
                <span>작성일: {formatDate(comment.createdAt)}</span>
              </footer>
              {/* 채택된 댓글은 일반 사용자도 확인할 수 있도록 아이콘 표시 */}
              {comment.selected && (
                <div className="check-container">
                  <img
                    src="/check-fill.svg" // 채택된 댓글용 아이콘
                    alt="채택된 댓글"
                    className="check-button"
                  />
                </div>
              )}
              {/* 글 작성자일 경우에만 채택 버튼 표시 */}
              {/* boardType에 따라 버튼을 조건부로 표시 */}
              {boardType === "QNA" &&
                currentUserName === post.authorName &&
                !comment.selected && (
                  <div className="check-container">
                    <img
                      src="/check.svg"
                      alt="채택"
                      className="check-button"
                      onClick={() => handleSelectComment(comment.id)}
                    />
                  </div>
                )}
              {boardType === "RECRUITMENT" &&
                currentUserName === post.authorName && (
                  <div className="people-plus-container">
                    <img
                      src="/people-plus.svg"
                      alt="인원추가"
                      className="people-plus-icon"
                      onClick={() => onClickAddPeople(comment.id)}
                    />
                  </div>
                )}
            </div>
          ))
        ) : (
          <p>댓글이 없습니다.</p>
        )}
      </section>
    </div>
  );
}

export default PostDetail;
