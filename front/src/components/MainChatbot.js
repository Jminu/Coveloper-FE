import React, { useState } from "react";
import axios from "axios";
import styles from "./MainChatbot.module.css"; // Import the CSS module

const MainChatbot = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]); // Save chat history

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
      setMessages([...messages, userMessage, botMessage]); // Save user and bot messages
    } catch (error) {
      console.error("Error during chatbot communication", error);
      const botMessage = { type: "bot", text: "An error occurred." };
      setMessages([...messages, userMessage, botMessage]);
    }
    setMessage(""); // Reset message input
  };

  return (
    <div className={styles.mainChatbotContainer}>
      <div className={styles.mainChatbotMessages}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`${styles.mainChatbotMessage} ${
              msg.type === "user" ? styles.userMessage : styles.botMessage
            }`}
          >
            <div className={styles.mainMessageBubble}>{msg.text}</div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className={styles.mainChatbotForm}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={styles.mainChatbotInput}
          placeholder="Enter a message"
          required
        />
        <button type="submit" className={styles.mainChatbotSubmit}>
          Send
        </button>
      </form>
    </div>
  );
};

export default MainChatbot;
