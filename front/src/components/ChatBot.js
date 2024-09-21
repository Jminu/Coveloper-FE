import React, { useState } from "react";
import axios from "axios";
import "./ChatBot.css"; // CSS 파일 import

const ChatBot = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]); // 채팅 기록 저장

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userMessage = { type: "user", text: message };

    try {
      const result = await axios.post(
        "http://localhost:8080/api/chatbot/talk",
        {
          message,
        }
      );
      const botMessage = { type: "bot", text: result.data.response };
      setMessages([...messages, userMessage, botMessage]); // 유저와 봇 메시지를 저장
    } catch (error) {
      console.error("Error during chatbot communication", error);
      const botMessage = { type: "bot", text: "오류가 발생했습니다." };
      setMessages([...messages, userMessage, botMessage]);
    }
    setMessage("");
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chatbot-message ${
              msg.type === "user" ? "user-message" : "bot-message"
            }`}
          >
            <div className="message-bubble">{msg.text}</div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="chatbot-form">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="chatbot-input"
          placeholder="메시지를 입력하세요"
          required
        />
        <button type="submit" className="chatbot-submit">
          전송
        </button>
      </form>
    </div>
  );
};

export default ChatBot;
