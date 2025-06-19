import { useState } from "react";
import { useEffect } from "react";
import { PiSparkleFill } from "react-icons/pi";

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
    <div className="fixed bottom-20 right-4 w-80 bg-white rounded-2xl shadow-2xl border-0 z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-1 rounded-full">
              <PiSparkleFill className="text-white text-sm" />
            </div>
            <h3 className="font-semibold text-white text-lg">Live Chat</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/20 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="h-72 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <div className="text-2xl mb-2">💬</div>
            <p className="text-sm">No messages yet</p>
            <p className="text-xs text-gray-400">Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.isTeacher ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs p-3 rounded-2xl shadow-sm ${
                  msg.isTeacher
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-br-md"
                    : "bg-white text-gray-800 border border-gray-200 rounded-bl-md"
                }`}
              >
                <div
                  className={`text-xs font-medium mb-1 ${
                    msg.isTeacher ? "text-white/80" : "text-gray-500"
                  }`}
                >
                  {msg.sender}
                  {msg.isTeacher && (
                    <span className="ml-1 text-xs bg-white/20 px-1.5 py-0.5 rounded-full">
                      Teacher
                    </span>
                  )}
                </div>
                <div className="text-sm leading-relaxed">{msg.message}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Form */}
      <div className="p-4 bg-white border-t border-gray-100">
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 bg-gray-100 border-0 rounded-full focus:ring-2 focus:ring-purple-500 focus:bg-white focus:outline-none transition-all duration-200 text-gray-900 placeholder-gray-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className={`px-6 py-3 rounded-full font-medium transition-all duration-200 transform ${
              newMessage.trim()
                ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white hover:scale-105 shadow-lg"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPopup;
