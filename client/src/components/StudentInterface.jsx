import { useEffect } from "react";
import { useState } from "react";

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

  const submitAnswer = () => {
    if (selectedAnswer && currentPoll) {
      socket.emit("submit_answer", {
        pollId: currentPoll.id,
        answer: selectedAnswer,
      });
      setHasAnswered(true);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome, {studentName}!
          </h1>
          <p className="text-gray-600">
            Waiting for questions from your teacher...
          </p>
        </div>

        {currentPoll && !hasAnswered && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Question</h2>
              <div className="text-lg font-bold text-red-600">{timeLeft}s</div>
            </div>
            <h3 className="text-xl mb-6">{currentPoll.question}</h3>
            <div className="space-y-3">
              {currentPoll.options.map((option, index) => (
                <label
                  key={index}
                  className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="answer"
                    value={option}
                    checked={selectedAnswer === option}
                    onChange={(e) => setSelectedAnswer(e.target.value)}
                    className="mr-3"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
            <button
              onClick={submitAnswer}
              disabled={!selectedAnswer || timeLeft === 0}
              className="w-full mt-6 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
            >
              Submit Answer
            </button>
          </div>
        )}

        {pollResults && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Results</h2>
            <p className="mb-4">
              Total Responses: {pollResults.totalAnswers} /{" "}
              {pollResults.totalStudents}
            </p>
            {Object.entries(pollResults.results).map(([option, count]) => (
              <div key={option} className="mb-3">
                <div className="flex justify-between mb-1">
                  <span>{option}</span>
                  <span>{count} votes</span>
                </div>
                <div className="bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-600 h-3 rounded-full transition-all duration-500"
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
        )}

        {!currentPoll && !pollResults && (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-500 text-lg">No active polls right now</p>
            <p className="text-gray-400">
              Your teacher will start a poll soon!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentInterface;