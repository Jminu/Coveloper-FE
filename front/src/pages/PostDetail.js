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

function PostDetail() {
  const { id } = useParams(); // URL에서 게시물 ID를 가져옴
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [upvoteCount, setUpVoteCount] = useState(0);

  useEffect(() => {
    fetchPostDetails();
    fetchComments();
  }, []);

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
    } catch (error) {
      console.error(
        "Error fetching post details",
        error.response?.data || error
      );
    }
  }

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
      setComments(response.data);
    } catch (error) {
      console.error("Error fetching comments", error);
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

  // 커스텀 코드 블록 렌더링
  const CodeBlock = ({ children, className }) => {
    const language = className?.replace("lang-", "") || "javascript"; // 기본적으로 JavaScript로 설정
    return (
      <SyntaxHighlighter language={language} style={prism}>
        {children}
      </SyntaxHighlighter>
    );
  };

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
          <span>작성일: {post.createdAt}</span>
        </footer>
        <button className="upvote-button" onClick={handleUpvote}>
          추천
        </button>
        <div>추천수 : {post.upvoteCount}</div>
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
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="comment">
              <Markdown
                options={{
                  overrides: {
                    code: {
                      component: CodeBlock, // 코드 블록 처리
                    },
                  },
                }}
              >
                {comment.content}
              </Markdown>
              <footer>
                <span>작성자: {comment.authorName}</span>
                <br />
                <span>작성일: {comment.createdAt}</span>
              </footer>
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
