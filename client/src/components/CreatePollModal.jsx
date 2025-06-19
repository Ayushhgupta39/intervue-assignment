import { useState } from "react";

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-xl font-semibold mb-4">Create New Poll</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Question</label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Options</label>
            {options.map((option, index) => (
              <div key={index} className="flex mb-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder={`Option ${index + 1}`}
                  required
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="ml-2 text-red-600 hover:text-red-800"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addOption}
              className="text-indigo-600 hover:text-indigo-800 text-sm"
            >
              + Add Option
            </button>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Time Limit (seconds)
            </label>
            <input
              type="number"
              value={timeLimit}
              onChange={(e) => setTimeLimit(parseInt(e.target.value))}
              min="10"
              max="300"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
            >
              Create Poll
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


export default CreatePollModal;