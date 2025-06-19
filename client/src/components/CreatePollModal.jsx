import { useState } from "react";
import {
  PiSparkleFill,
  PiPlus,
  PiX,
  PiClock,
  PiQuestionMark,
} from "react-icons/pi";

const CreatePollModal = ({ onSubmit, onClose }) => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [timeLimit, setTimeLimit] = useState(60);

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validOptions = options.filter((opt) => opt.trim());
    if (validOptions.length >= 2) {
      onSubmit(question, validOptions, timeLimit);
    }
  };

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50 font-sora">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4  overflow-y-auto">
        {/* Header */}
        <div className="gradient-background text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white bg-opacity-20 p-2 rounded-full">
                <PiSparkleFill className="text-white text-lg" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Create New Poll</h3>
                <p className="text-white text-opacity-80 text-sm font-light">
                  Engage your students with interactive questions
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-gray-200 hover:text-gray-500 cursor-pointer hover:bg-opacity-20 p-2 rounded-full transition duration-200"
            >
              <PiX className="text-xl" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Question Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="bg-blue-50 p-2 rounded-lg">
                  <PiQuestionMark className="text-blue-600" />
                </div>
                <label className="text-sm font-semibold text-gray-700">
                  Poll Question
                </label>
              </div>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-700"
                placeholder="What would you like to ask your students?"
                required
              />
            </div>

            {/* Options Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="bg-green-50 p-2 rounded-lg">
                  <PiPlus className="text-green-600" />
                </div>
                <label className="text-sm font-semibold text-gray-700">
                  Answer Options
                </label>
              </div>

              <div className="space-y-3">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-700"
                        placeholder={`Option ${index + 1}`}
                        required
                      />
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gray-300 rounded-full"></div>
                      <div className="pl-6"></div>
                    </div>
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition duration-200"
                      >
                        <PiX className="text-lg" />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addOption}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-2 rounded-lg transition duration-200 text-sm font-medium"
                >
                  <PiPlus className="text-sm" />
                  Add Another Option
                </button>
              </div>
            </div>

            {/* Time Limit Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="bg-purple-50 p-2 rounded-lg">
                  <PiClock className="text-purple-600" />
                </div>
                <label className="text-sm font-semibold text-gray-700">
                  Time Limit
                </label>
              </div>

              <div className="flex items-center gap-4">
                <input
                  type="range"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                  min="10"
                  max="300"
                  step="10"
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 min-w-[80px] text-center">
                  <span className="text-sm font-semibold text-gray-700">
                    {timeLimit}s
                  </span>
                </div>
              </div>

              <div className="flex justify-between text-xs text-gray-500">
                <span>10s</span>
                <span>5 minutes</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg font-medium transition duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 gradient-button text-white rounded-lg font-medium hover:opacity-90 transition duration-200 flex items-center gap-2"
              >
                <PiSparkleFill className="text-sm" />
                Create Poll
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .gradient-background {
          background: linear-gradient(92.24deg, #7765da -8.5%, #1d68bd 101.3%);
        }

        .gradient-button {
          background: linear-gradient(92.24deg, #7765da -8.5%, #1d68bd 101.3%);
        }

        .font-sora {
          font-family: "Sora", sans-serif;
        }

        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(92.24deg, #7765da -8.5%, #1d68bd 101.3%);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }

        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(92.24deg, #7765da -8.5%, #1d68bd 101.3%);
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }

        .slider::-webkit-slider-track {
          background: #e5e7eb;
          border-radius: 8px;
        }

        .slider::-moz-range-track {
          background: #e5e7eb;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
};

export default CreatePollModal;
