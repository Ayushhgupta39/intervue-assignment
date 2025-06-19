import { useEffect, useState } from "react";

const StudentInterface = ({ socket, studentName }) => {
  const [currentPoll, setCurrentPoll] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [hasAnswered, setHasAnswered] = useState(false);
  const [pollResults, setPollResults] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    socket.on("new_poll", (poll) => {
      setCurrentPoll(poll);
      setHasAnswered(false);
      setSelectedAnswer("");
      setPollResults(null);
      setTimeLeft(poll.timeLimit);
    });

    socket.on("poll_results", (results) => {
      setPollResults(results);
    });

    socket.on("poll_ended", (results) => {
      setPollResults(results);
      setCurrentPoll(null);
      setTimeLeft(0);
    });

    socket.on("error", (error) => {
      alert(error.message);
    });

    // Fetch current poll on load
    fetch("http://localhost:3001/api/poll/current")
      .then((res) => res.json())
      .then((data) => {
        if (data.poll && data.poll.status === "active") {
          setCurrentPoll(data.poll);
        }
      })
      .catch((error) => {
        console.error("Error fetching current poll:", error);
      });

    return () => {
      socket.off("new_poll");
      socket.off("poll_results");
      socket.off("poll_ended");
      socket.off("error");
    };
  }, [socket]);

  useEffect(() => {
    let timer;
    if (timeLeft > 0 && !hasAnswered) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setHasAnswered(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [timeLeft, hasAnswered]);

  const handleAnswerSelect = (option) => {
    if (!hasAnswered && timeLeft > 0) {
      setSelectedAnswer(option);
    }
  };

  const submitAnswer = () => {
    if (selectedAnswer && currentPoll) {
      socket.emit("submit_answer", {
        pollId: currentPoll.id,
        answer: selectedAnswer,
      });
      setHasAnswered(true);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen font-sora bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-purple-500 to-blue-600 text-white px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium">
                <span>✨</span>
                Intervue Poll
              </div>
            </div>
            <div className="text-gray-600">
              Welcome,{" "}
              <span className="font-semibold text-gray-900">{studentName}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Active Poll */}
        {currentPoll && !hasAnswered && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Poll Header */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 px-8 py-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Live Question
                  </h2>
                  <p className="text-gray-600">Select your answer below</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-500 font-medium">
                    Time Remaining
                  </div>
                  <div
                    className={`text-2xl font-bold px-4 py-2 rounded-full ${
                      timeLeft <= 10
                        ? "bg-red-100 text-red-600"
                        : timeLeft <= 30
                        ? "bg-yellow-100 text-yellow-600"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {formatTime(timeLeft)}
                  </div>
                </div>
              </div>
            </div>

            {/* Question and Options */}
            <div className="p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-8 leading-relaxed">
                {currentPoll.question}
              </h3>

              <div className="space-y-4 mb-8">
                {currentPoll.options.map((option, index) => (
                  <div
                    key={index}
                    onClick={() => handleAnswerSelect(option)}
                    className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                      selectedAnswer === option
                        ? "border-purple-500 bg-purple-50 ring-2 ring-purple-200"
                        : "border-gray-200 hover:border-gray-300"
                    } ${
                      hasAnswered || timeLeft === 0
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center transition-all duration-200 ${
                        selectedAnswer === option
                          ? "border-purple-500 bg-purple-500"
                          : "border-gray-300"
                      }`}
                    >
                      {selectedAnswer === option && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span className="text-lg text-gray-800 select-none">
                      {option}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={submitAnswer}
                disabled={!selectedAnswer || timeLeft === 0}
                className={`w-full py-4 px-6 rounded-full text-lg font-semibold transition-all duration-200 ${
                  selectedAnswer && timeLeft > 0
                    ? "bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white transform hover:scale-105 shadow-lg hover:shadow-xl"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                {timeLeft === 0 ? "Time Up!" : "Submit Answer"}
              </button>
            </div>
          </div>
        )}

        {/* Poll Results */}
        {pollResults && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-8 py-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Poll Results
              </h2>
              <p className="text-gray-600">
                <span className="font-semibold">
                  {pollResults.totalAnswers}
                </span>{" "}
                out of{" "}
                <span className="font-semibold">
                  {pollResults.totalStudents}
                </span>{" "}
                students responded
              </p>
            </div>

            <div className="p-8">
              <div className="space-y-6">
                {Object.entries(pollResults.results).map(([option, count]) => {
                  const percentage =
                    pollResults.totalAnswers > 0
                      ? (count / pollResults.totalAnswers) * 100
                      : 0;

                  return (
                    <div key={option} className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-medium text-gray-800">
                          {option}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-500">
                            {count} votes
                          </span>
                          <span className="text-lg font-bold text-purple-600">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="bg-gray-100 rounded-full h-4 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-blue-600 h-full rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Waiting State */}
        {!currentPoll && !pollResults && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 text-center py-16 px-8">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">⏳</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Waiting for Questions
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Your teacher will start a poll soon. Stay tuned for live
                questions and participate with your classmates!
              </p>
            </div>
          </div>
        )}

        {/* Answered State */}
        {currentPoll && hasAnswered && !pollResults && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 text-center py-16 px-8">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">✅</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Answer Submitted!
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Your response has been recorded. Waiting for other students to
                complete their answers.
              </p>
              {selectedAnswer && (
                <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Your answer:</p>
                  <p className="font-semibold text-purple-700">
                    {selectedAnswer}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentInterface;
