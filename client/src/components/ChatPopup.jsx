import { useState } from "react";
import { useEffect } from "react";

const ChatPopup = ({ socket, isTeacher, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    socket.on("new_message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off("new_message");
    };
  }, [socket]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      socket.emit("send_message", {
        message: newMessage,
        isTeacher,
      });
      setNewMessage("");
    }
  };

  return (
    <div className="fixed bottom-20 right-4 w-80 h-96 bg-white rounded-lg shadow-xl border z-50">
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="font-semibold">Chat</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>

      <div className="h-64 overflow-y-auto p-4 space-y-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-2 rounded-lg max-w-xs ${
              msg.isTeacher
                ? "bg-indigo-100 text-indigo-800 ml-auto"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            <div className="text-xs font-semibold mb-1">{msg.sender}</div>
            <div className="text-sm">{msg.message}</div>
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} className="p-4 border-t">
        <div className="flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border rounded-l-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-r-lg"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatPopup;