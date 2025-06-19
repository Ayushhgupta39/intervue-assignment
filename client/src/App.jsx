import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import TeacherDashboard from "./components/TeacherDashboard";
import StudentInterface from "./components/StudentInterface";
import ChatPopup from "./components/ChatPopup";
import { PiSparkleFill } from "react-icons/pi";

const socket = io("http://localhost:3001");

function App() {
  const [userType, setUserType] = useState(null);
  const [studentName, setStudentName] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    // Check if student name exists in sessionStorage
    const savedName = sessionStorage.getItem("studentName");
    if (savedName) {
      setStudentName(savedName);
      setIsRegistered(true);
      setUserType("student");
      socket.emit("register_student", { name: savedName });
    }

    socket.on("registration_success", () => {
      setIsRegistered(true);
    });

    socket.on("kicked", (data) => {
      alert(data.message);
      sessionStorage.removeItem("studentName");
      setUserType(null);
      setIsRegistered(false);
      setStudentName("");
    });

    return () => {
      socket.off("registration_success");
      socket.off("kicked");
    };
  }, []);

  const handleStudentRegistration = (name) => {
    setStudentName(name);
    sessionStorage.setItem("studentName", name);
    socket.emit("register_student", { name });
    setUserType("student");
  };

  const handleUserTypeSelection = (type) => {
    setUserType(type);
  };

  if (!userType) {
    return (
      <div className="min-h-screen bg-white font-sora flex flex-col items-center justify-center">
        <div className="p-8 mx-4">
          <div className="flex justify-center">
            <div className="gradient-background text-white p-2 mb-4 font-medium rounded-full text-center justify-center flex items-center gap-2 w-1/4">
              <PiSparkleFill />
              Intervue Poll
            </div>
          </div>
          <h1 className="text-4xl text-center text-gray-800 mb-4">
            Welcome to the{" "}
            <span className="font-semibold">Live Polling System</span>
          </h1>
          <p className="text-custom-gray font-light">
            Please select the role that best describes you to begin using the
            live polling system
          </p>
        </div>

        <div className="flex gap-4 w-full items-center justify-center">
          <div
            onClick={(e) => {
              e.preventDefault();
              setUserType("student");
            }}
            className={`p-4 py-8 w-1/4 flex flex-col gap-2 rounded-xl ${
              userType === "student"
                ? "border-2 gradient-border"
                : "border border-[#D9D9D9]"
            } cursor-pointer hover:border-gray-400`}
          >
            <p className="font-semibold text-xl">I'm a Student</p>
            <p className="text-sm text-gray-500">
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry
            </p>
          </div>
          <div
            onClick={(e) => {
              e.preventDefault();
              setUserType("teacher");
            }}
            className={`p-4 py-8 w-1/4 flex flex-col gap-2 rounded-xl ${
              userType === "teacher"
                ? "border-2 gradient-border"
                : "border border-[#D9D9D9]"
            } cursor-pointer hover:border-gray-400`}
          >
            <p className="font-semibold text-xl">I'm a Teacher</p>
            <p className="text-sm text-gray-500">
              Submit answers and view live poll results in real-time.
            </p>
          </div>
        </div>

        <button
          onClick={() => handleUserTypeSelection(userType)}
          className="my-8 w-1/6 gradient-button p-4 cursor-pointer hover:text-gray-400 px-4 rounded-full"
        >
          Continue
        </button>

        {/* <div className="space-y-4">
          <button
            onClick={() => handleUserTypeSelection("teacher")}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 transform hover:scale-105"
          >
            I'm a Teacher
          </button>
          <button
            onClick={() => handleUserTypeSelection("student")}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 transform hover:scale-105"
          >
            I'm a Student
          </button>
        </div> */}
      </div>
    );
  }

  if (userType === "student" && !isRegistered) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Enter Your Name
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const name = e.target.name.value.trim();
              if (name) {
                handleStudentRegistration(name);
              }
            }}
            className="space-y-4"
          >
            <input
              type="text"
              name="name"
              placeholder="Your name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
            >
              Join Session
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {userType === "teacher" ? (
        <TeacherDashboard socket={socket} />
      ) : (
        <StudentInterface socket={socket} studentName={studentName} />
      )}

      {/* Chat Toggle Button */}
      <button
        onClick={() => setShowChat(!showChat)}
        className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition duration-200 z-40"
      >
        💬
      </button>

      {/* Chat Popup */}
      {showChat && (
        <ChatPopup
          socket={socket}
          isTeacher={userType === "teacher"}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
}

export default App;
