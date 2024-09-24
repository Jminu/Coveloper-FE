import { useState, useEffect } from "react";
import SockJS from "sockjs-client";
import Stomp from "stompjs";

const ChatComponent = () => {
  const [messages, setMessages] = useState([]);
  const [stompClient, setStompClient] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // SockJS 및 Stomp를 사용하여 WebSocket 연결
    const socket = new SockJS("http://localhost:8080/ws");
    const stompClient = Stomp.over(socket);

    stompClient.connect({}, () => {
      stompClient.subscribe("/topic/team", (message) => {
        setMessages((prevMessages) => [
          ...prevMessages,
          JSON.parse(message.body),
        ]);
      });
    });

    setStompClient(stompClient);

    return () => {
      if (stompClient) {
        stompClient.disconnect();
      }
    };
  }, []);

  const sendMessage = () => {
    if (stompClient && message.trim()) {
      stompClient.send(
        "/app/chat",
        {},
        JSON.stringify({
          sender: "YourName",
          content: message,
          teamId: "team1",
        })
      );
      setMessage("");
    }
  };

  return (
    <div>
      <div>
        {messages.map((msg, index) => (
          <p key={index}>
            <strong>{msg.sender}:</strong> {msg.content}
          </p>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter your message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default ChatComponent;
