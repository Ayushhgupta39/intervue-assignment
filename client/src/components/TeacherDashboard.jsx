import { useEffect } from "react";
import { useState } from "react";
import CreatePollModal from "./CreatePollModal";

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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Teacher Dashboard</h1>
        <button
          onClick={() => setShowCreatePoll(true)}
          disabled={currentPoll && currentPoll.status === "active"}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
        >
          Create New Poll
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Current Poll Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Current Poll</h2>
          {currentPoll ? (
            <div>
              <h3 className="text-lg font-medium mb-3">
                {currentPoll.question}
              </h3>
              <div className="space-y-2">
                {currentPoll.options.map((option, index) => (
                  <div key={index} className="bg-gray-100 p-2 rounded">
                    {option}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-3">
                Time Limit: {currentPoll.timeLimit} seconds
              </p>
            </div>
          ) : (
            <p className="text-gray-500">No active poll</p>
          )}
        </div>

        {/* Results Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Live Results</h2>
          {pollResults ? (
            <div>
              <p className="mb-3">
                Responses: {pollResults.totalAnswers} /{" "}
                {pollResults.totalStudents}
              </p>
              {Object.entries(pollResults.results).map(([option, count]) => (
                <div key={option} className="mb-2">
                  <div className="flex justify-between mb-1">
                    <span>{option}</span>
                    <span>{count}</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
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
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No results yet</p>
          )}
        </div>

        {/* Students Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">
            Students ({students.length})
          </h2>
          {students.length > 0 ? (
            <div className="space-y-2">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="flex justify-between items-center p-2 bg-gray-50 rounded"
                >
                  <span>{student.name}</span>
                  <button
                    onClick={() => kickStudent(student.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Kick
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No students connected</p>
          )}
        </div>

        {/* Poll History */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Poll History</h2>
          {pollHistory.length > 0 ? (
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {pollHistory.map((poll) => (
                <div
                  key={poll.id}
                  className="border-l-4 border-indigo-500 pl-4"
                >
                  <h4 className="font-medium">{poll.question}</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(poll.createdAt).toLocaleString()}
                  </p>
                  <div className="text-xs text-gray-500 mt-1">
                    {Object.entries(poll.results).map(([option, count]) => (
                      <span key={option} className="mr-3">
                        {option}: {count}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No previous polls</p>
          )}
        </div>
      </div>

      {/* Create Poll Modal */}
      {showCreatePoll && (
        <CreatePollModal
          onSubmit={createPoll}
          onClose={() => setShowCreatePoll(false)}
        />
      )}
    </div>
  );
};

export default TeacherDashboard;
