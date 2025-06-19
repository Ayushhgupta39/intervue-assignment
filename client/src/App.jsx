import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import TeacherDashboard from "./components/TeacherDashboard";
import StudentInterface from "./components/StudentInterface";
import ChatPopup from "./components/ChatPopup";
import { PiSparkleFill } from "react-icons/pi";

const socket = io("https://intervue-assignment-pk8r.onrender.com");

function App() {
  const [userType, setUserType] = useState(null);
  const [selectedUserType, setSelectedUserType] = useState(null); // New state for selection
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

  const handleContinue = () => {
    if (selectedUserType) {
      handleUserTypeSelection(selectedUserType);
    }
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
              setSelectedUserType("student"); // Only set selected state
            }}
            className={`p-4 py-8 w-1/4 flex flex-col gap-2 rounded-xl cursor-pointer hover:border-gray-400 ${
              selectedUserType === "student" ? "" : "border border-[#D9D9D9]"
            }`}
            style={
              selectedUserType === "student"
                ? {
                    background:
                      "linear-gradient(white, white) padding-box, linear-gradient(92.24deg, #7765da -8.5%, #1d68bd 101.3%) border-box",
                    border: "3px solid transparent",
                    borderRadius: "12px",
                  }
                : {}
            }
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
              setSelectedUserType("teacher"); // Only set selected state
            }}
            className={`p-4 py-8 w-1/4 flex flex-col gap-2 rounded-xl cursor-pointer hover:border-gray-400 ${
              selectedUserType === "teacher" ? "" : "border border-[#D9D9D9]"
            }`}
            style={
              selectedUserType === "teacher"
                ? {
                    background:
                      "linear-gradient(white, white) padding-box, linear-gradient(92.24deg, #7765da -8.5%, #1d68bd 101.3%) border-box",
                    border: "3px solid transparent",
                    borderRadius: "12px",
                  }
                : {}
            }
          >
            <p className="font-semibold text-xl">I'm a Teacher</p>
            <p className="text-sm text-gray-500">
              Submit answers and view live poll results in real-time.
            </p>
          </div>
        </div>

        <button
          onClick={handleContinue}
          disabled={!selectedUserType} // Disable if no selection
          className={`my-8 w-1/6 p-4 px-4 rounded-full transition duration-200 ${
            selectedUserType
              ? "gradient-button text-white cursor-pointer hover:opacity-90"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Continue
        </button>
      </div>
    );
  }

  if (userType === "student" && !isRegistered) {
    return (
      <div className="min-h-screen font-sora bg-white flex flex-col items-center justify-center px-4">
        {/* Header Badge */}
        <div className="flex justify-center mb-12">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
            <PiSparkleFill />
            Intervue Poll
          </div>
        </div>

        {/* Main Content */}
        <div className="text-center max-w-2xl mb-12">
          <h1 className="text-4xl font-sora font-bold text-black mb-6">
            Let's Get Started
          </h1>
          <p className="text-gray-600 font-sora text-lg leading-relaxed">
            If you're a student, you'll be able to{" "}
            <span className="font-semibold text-black">
              submit your answers
            </span>
            , participate in live polls, and see how your responses compare with
            your classmates
          </p>
        </div>

        {/* Form Section */}
        <div className="w-full max-w-md">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const name = e.target.name.value.trim();
              if (name) {
                handleStudentRegistration(name);
              }
            }}
            className="space-y-6"
          >
            <div>
              <label className="block text-gray-700 font-medium mb-3 text-left">
                Enter your Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="Rahul Bajaj"
                className="w-full px-4 py-4 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-purple-500 focus:bg-white focus:outline-none transition-all duration-200 text-gray-900 placeholder-gray-500"
                required
              />
            </div>
            <div className="flex justify-center font-sora">
              <button
                type="submit"
                className="w-1/2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-full transition duration-200 transform hover:scale-[1.02]"
              >
                Continue
              </button>
            </div>
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
