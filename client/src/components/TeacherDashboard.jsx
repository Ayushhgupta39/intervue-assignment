import { useEffect } from "react";
import { useState } from "react";
import CreatePollModal from "./CreatePollModal";
import {
  PiSparkleFill,
  PiUsers,
  PiChartBar,
  PiClock,
  PiPlus,
} from "react-icons/pi";

const TeacherDashboard = ({ socket }) => {
  const [currentPoll, setCurrentPoll] = useState(null);
  const [pollResults, setPollResults] = useState(null);
  const [students, setStudents] = useState([]);
  const [pollHistory, setPollHistory] = useState([]);
  const [showCreatePoll, setShowCreatePoll] = useState(false);

  useEffect(() => {
    socket.emit("get_students");
    fetch("http://localhost:3001/api/poll/history")
      .then((res) => res.json())
      .then((data) => setPollHistory(data.history));

    socket.on("new_poll", (poll) => {
      setCurrentPoll(poll);
      setPollResults(null);
    });

    socket.on("poll_results", (results) => {
      setPollResults(results);
    });

    socket.on("poll_ended", (results) => {
      setPollResults(results);
      setCurrentPoll(null);
      // Refresh history
      fetch("http://localhost:3001/api/poll/history")
        .then((res) => res.json())
        .then((data) => setPollHistory(data.history));
    });

    socket.on("student_list", (studentList) => {
      setStudents(studentList);
    });

    socket.on("student_list_updated", (studentList) => {
      setStudents(studentList);
    });

    socket.on("poll_creation_error", (error) => {
      alert(error.message);
    });

    return () => {
      socket.off("new_poll");
      socket.off("poll_results");
      socket.off("poll_ended");
      socket.off("student_list");
      socket.off("student_list_updated");
      socket.off("poll_creation_error");
    };
  }, [socket]);

  const createPoll = (question, options, timeLimit) => {
    socket.emit("create_poll", { question, options, timeLimit });
    setShowCreatePoll(false);
  };

  const kickStudent = (studentId) => {
    socket.emit("kick_student", { studentId });
  };

  return (
    <div className="min-h-screen bg-white font-sora">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-8 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="gradient-background text-white p-2 font-medium rounded-full text-center justify-center flex items-center gap-2">
              <PiSparkleFill />
              Intervue Poll
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-gray-800">
                Teacher Dashboard
              </h1>
              <p className="text-custom-gray font-light">
                Manage your live polling sessions
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCreatePoll(true)}
            disabled={currentPoll && currentPoll.status === "active"}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition duration-200 ${
              currentPoll && currentPoll.status === "active"
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "gradient-button text-white hover:opacity-90"
            }`}
          >
            <PiPlus className="text-lg" />
            Create New Poll
          </button>
        </div>
      </div>

      <div className="px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition duration-200">
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-3 rounded-full">
                <PiUsers className="text-blue-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Students</p>
                <p className="text-2xl font-semibold text-gray-800">
                  {students.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition duration-200">
            <div className="flex items-center gap-3">
              <div className="bg-green-50 p-3 rounded-full">
                <PiChartBar className="text-green-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Polls</p>
                <p className="text-2xl font-semibold text-gray-800">
                  {pollHistory.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition duration-200">
            <div className="flex items-center gap-3">
              <div className="bg-purple-50 p-3 rounded-full">
                <PiClock className="text-purple-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Poll Status</p>
                <p className="text-2xl font-semibold text-gray-800">
                  {currentPoll ? "Active" : "Idle"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Poll Section */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition duration-200">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-blue-50 p-2 rounded-lg">
                <PiChartBar className="text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">
                Current Poll
              </h2>
            </div>

            {currentPoll ? (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-800 mb-3">
                    {currentPoll.question}
                  </h3>
                  <div className="space-y-2">
                    {currentPoll.options.map((option, index) => (
                      <div
                        key={index}
                        className="bg-white border border-gray-200 p-3 rounded-lg text-gray-700"
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <PiClock />
                  <span>Time Limit: {currentPoll.timeLimit} seconds</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <PiChartBar className="text-gray-400 text-2xl" />
                </div>
                <p className="text-gray-500 font-light">No active poll</p>
                <p className="text-sm text-gray-400">
                  Create a new poll to get started
                </p>
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition duration-200">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-green-50 p-2 rounded-lg">
                <PiSparkleFill className="text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">
                Live Results
              </h2>
            </div>

            {pollResults ? (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Responses:{" "}
                    <span className="font-semibold">
                      {pollResults.totalAnswers}
                    </span>{" "}
                    / {pollResults.totalStudents}
                  </p>
                  <div className="space-y-3">
                    {Object.entries(pollResults.results).map(
                      ([option, count]) => (
                        <div key={option} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">
                              {option}
                            </span>
                            <span className="text-sm font-semibold text-gray-800">
                              {count}
                            </span>
                          </div>
                          <div className="bg-gray-200 rounded-full h-2">
                            <div
                              className="gradient-background h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${
                                  pollResults.totalAnswers > 0
                                    ? (count / pollResults.totalAnswers) * 100
                                    : 0
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <PiSparkleFill className="text-gray-400 text-2xl" />
                </div>
                <p className="text-gray-500 font-light">No results yet</p>
                <p className="text-sm text-gray-400">
                  Results will appear when students vote
                </p>
              </div>
            )}
          </div>

          {/* Students Section */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition duration-200">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-purple-50 p-2 rounded-lg">
                <PiUsers className="text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">
                Students ({students.length})
              </h2>
            </div>

            {students.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition duration-200"
                  >
                    <span className="font-medium text-gray-700">
                      {student.name}
                    </span>
                    <button
                      onClick={() => kickStudent(student.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium transition duration-200"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <PiUsers className="text-gray-400 text-2xl" />
                </div>
                <p className="text-gray-500 font-light">
                  No students connected
                </p>
                <p className="text-sm text-gray-400">
                  Students will appear here when they join
                </p>
              </div>
            )}
          </div>

          {/* Poll History */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition duration-200">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-orange-50 p-2 rounded-lg">
                <PiClock className="text-orange-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">
                Poll History
              </h2>
            </div>

            {pollHistory.length > 0 ? (
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {pollHistory.map((poll) => (
                  <div
                    key={poll.id}
                    className="border-l-4 border-gradient pl-4 bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition duration-200"
                    style={{
                      borderLeftColor: "#7765da",
                    }}
                  >
                    <h4 className="font-medium text-gray-800 mb-1">
                      {poll.question}
                    </h4>
                    <p className="text-sm text-gray-500 mb-2">
                      {new Date(poll.createdAt).toLocaleString()}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(poll.results).map(([option, count]) => (
                        <span
                          key={option}
                          className="text-xs bg-white px-2 py-1 rounded-full text-gray-600 border border-gray-200"
                        >
                          {option}: {count}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <PiClock className="text-gray-400 text-2xl" />
                </div>
                <p className="text-gray-500 font-light">No previous polls</p>
                <p className="text-sm text-gray-400">
                  Your poll history will appear here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Poll Modal */}
      {showCreatePoll && (
        <CreatePollModal
          onSubmit={createPoll}
          onClose={() => setShowCreatePoll(false)}
        />
      )}

      <style jsx>{`
        .gradient-background {
          background: linear-gradient(92.24deg, #7765da -8.5%, #1d68bd 101.3%);
        }

        .gradient-button {
          background: linear-gradient(92.24deg, #7765da -8.5%, #1d68bd 101.3%);
        }

        .text-custom-gray {
          color: #6b7280;
        }

        .font-sora {
          font-family: "Sora", sans-serif;
        }
      `}</style>
    </div>
  );
};

export default TeacherDashboard;