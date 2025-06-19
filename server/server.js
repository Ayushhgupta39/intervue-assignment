const express = require("express");
const http = require("http")
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

let currentPoll = null;
let pollHistory = [];
let students = new Map(); 
let answers = new Map();

// Routes
app.get("/api/poll/current", (req, res) => {
  res.json({ poll: currentPoll });
});

app.get("/api/poll/history", (req, res) => {
  res.json({ history: pollHistory });
});

// Socket connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("create_poll", (data) => {
    const { question, options, timeLimit = 60 } = data;

    if (currentPoll && currentPoll.status === "active") {
      const studentsAnswered = answers.get(currentPoll.id)?.size || 0;
      const totalStudents = students.size;

      if (studentsAnswered < totalStudents && totalStudents > 0) {
        socket.emit("poll_creation_error", {
          message:
            "Cannot create new poll. Students are still answering the current question.",
        });
        return;
      }
    }

    currentPoll = {
      id: Date.now().toString(),
      question,
      options,
      timeLimit,
      status: "active",
      createdAt: new Date(),
      results: options.reduce((acc, option) => ({ ...acc, [option]: 0 }), {}),
    };

    answers.set(currentPoll.id, new Map());

    // Broadcast to all clients
    io.emit("new_poll", currentPoll);

    // Set timer for poll expiration
    setTimeout(() => {
      if (currentPoll && currentPoll.id === currentPoll.id) {
        endCurrentPoll();
      }
    }, timeLimit * 1000);
  });

  socket.on("register_student", (data) => {
    const { name } = data;
    students.set(socket.id, {
      id: socket.id,
      name,
      joinedAt: new Date(),
    });

    socket.emit("registration_success", { studentId: socket.id });

    if (currentPoll && currentPoll.status === "active") {
      socket.emit("new_poll", currentPoll);
    }
  });

  socket.on("submit_answer", (data) => {
    const { pollId, answer } = data;
    const student = students.get(socket.id);

    if (!student) {
      socket.emit("error", { message: "Please register first" });
      return;
    }

    if (!currentPoll || currentPoll.id !== pollId) {
      socket.emit("error", { message: "Poll not found or expired" });
      return;
    }

    const pollAnswers = answers.get(pollId);
    if (pollAnswers.has(socket.id)) {
      socket.emit("error", { message: "You have already answered this poll" });
      return;
    }

    pollAnswers.set(socket.id, answer);
    currentPoll.results[answer]++;

    // Check if all students have answered
    const totalStudents = students.size;
    const answeredStudents = pollAnswers.size;

    if (answeredStudents >= totalStudents) {
      endCurrentPoll();
    } else {
      // Broadcast updated results
      io.emit("poll_results", {
        pollId: currentPoll.id,
        results: currentPoll.results,
        totalAnswers: answeredStudents,
        totalStudents: totalStudents,
      });
    }
  });

  socket.on("get_poll_results", () => {
    if (currentPoll) {
      const pollAnswers = answers.get(currentPoll.id);
      const totalAnswers = pollAnswers ? pollAnswers.size : 0;

      socket.emit("poll_results", {
        pollId: currentPoll.id,
        results: currentPoll.results,
        totalAnswers: totalAnswers,
        totalStudents: students.size,
      });
    }
  });

  // Teacher kicks student
  socket.on("kick_student", (data) => {
    const { studentId } = data;
    const targetSocket = io.sockets.sockets.get(studentId);

    if (targetSocket) {
      targetSocket.emit("kicked", {
        message: "You have been removed from the session",
      });
      targetSocket.disconnect();
    }

    students.delete(studentId);
    io.emit("student_list_updated", Array.from(students.values()));
  });

  // Get student list
  socket.on("get_students", () => {
    socket.emit("student_list", Array.from(students.values()));
  });

  // Chat functionality
  socket.on("send_message", (data) => {
    const { message, isTeacher } = data;
    const student = students.get(socket.id);

    const chatMessage = {
      id: Date.now().toString(),
      message,
      sender: isTeacher ? "Teacher" : student?.name || "Anonymous",
      isTeacher,
      timestamp: new Date(),
    };

    io.emit("new_message", chatMessage);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    students.delete(socket.id);
    io.emit("student_list_updated", Array.from(students.values()));
  });
});

function endCurrentPoll() {
  if (currentPoll) {
    currentPoll.status = "completed";
    currentPoll.endedAt = new Date();

    // Save to history
    pollHistory.push({ ...currentPoll });

    // Broadcast final results
    io.emit("poll_ended", {
      pollId: currentPoll.id,
      results: currentPoll.results,
      totalAnswers: answers.get(currentPoll.id)?.size || 0,
      totalStudents: students.size,
    });

    currentPoll = null;
  }
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
