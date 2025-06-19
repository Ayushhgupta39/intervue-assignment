# Intervue Poll – Live Polling System

A real-time classroom polling application for teachers and students, built with React, Vite, Express, and Socket.IO.

## Features

### For Teachers
- **Dashboard:** View active students, poll history, and poll status.
- **Create Polls:** Launch new polls with custom questions, multiple options, and a configurable time limit.
- **Live Results:** See poll results update in real-time as students respond.
- **Student Management:** View the list of students and remove (kick) students from the session.
- **Chat:** Communicate with students via a live chat popup.

### For Students
- **Join Polls:** Register with your name and participate in live polls.
- **Answer Questions:** Select and submit answers within the time limit.
- **View Results:** Instantly see poll results after submission or when the poll ends.
- **Chat:** Send and receive messages in the live chat popup.

## Tech Stack

- **Frontend:** React 19, Vite, TailwindCSS, React Icons, Socket.IO Client
- **Backend:** Node.js, Express, Socket.IO, CORS

## Project Structure

```
intervue-assignment/
  client/      # React frontend (Vite)
    src/
      components/
        TeacherDashboard.jsx
        StudentInterface.jsx
        CreatePollModal.jsx
        ChatPopup.jsx
      App.jsx
      main.jsx
      index.css
    index.html
    package.json
  server/      # Express backend
    server.js
    package.json
```

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm

### Setup

#### 1. Clone the repository

```bash
git clone https://github.com/Ayushhgupta39/intervue-assignment.git
cd intervue-assignment
```

#### 2. Install dependencies

```bash
# In the root directory, install server dependencies
cd server
npm install

# In a new terminal, install client dependencies
cd ../client
npm install
```

#### 3. Run the development servers

- **Start the backend:**

  ```bash
  cd server
  npm run dev
  # Server runs on http://localhost:3001
  ```

- **Start the frontend:**

  ```bash
  cd client
  npm run dev
  # App runs on http://localhost:5173
  ```

#### 4. Open the app

Visit [http://localhost:5173](http://localhost:5173) in your browser.

## Usage

- On the landing page, select your role (Teacher or Student).
- Teachers can create polls, monitor responses, and chat.
- Students can join polls, submit answers, and chat.

## Customization

- **Poll Storage:** Currently, poll data is stored in-memory on the server. For production, integrate a database (e.g., MongoDB).
- **CORS:** The backend is configured for local development. Update CORS settings in `server/server.js` for deployment.

## Scripts

### Client

- `npm run dev` – Start Vite dev server
- `npm run build` – Build for production
- `npm run preview` – Preview production build
- `npm run lint` – Lint code

### Server

- `npm run dev` – Start server with nodemon (auto-restart)
- `npm start` – Start server

## License

MIT 