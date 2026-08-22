# Mini Slack Clone

A full-stack real-time chat application inspired by Slack.

## Tech Stack
*   **Frontend**: React.js (Vite), Tailwind CSS, Socket.io-client
*   **Backend**: Node.js, Express.js, Socket.io
*   **Database**: MongoDB (Mongoose)

## Features
*   Real-time messaging via WebSockets (Socket.io)
*   Channel switching (e.g., `#general`, `#engineering`, `#random`, `#design`)
*   Search messages within a channel
*   Emoji reactions on messages
*   Delete your own messages
*   Unread message indicators

## Setup Instructions

### 1. Database Setup
Ensure you have a MongoDB instance running locally or a MongoDB Atlas URI. 
Add your connection string to the backend environment variables.

Create a `.env` file in the `backend/` directory:
```env
MONGODB_URI=your_mongodb_connection_string
PORT=5000
```

### 2. Backend Setup
Open a terminal and navigate to the backend directory:
```bash
cd backend
npm install
npm run dev
```
*(The server will run on http://localhost:5000)*

**Note:** To initialize the default channels (`#general`, `#engineering`, `#random`, `#design`), send a POST request to:
`http://localhost:5000/api/channels/init` (e.g., using Postman or cURL).

### 3. Frontend Setup
Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
npm install
npm run dev
```
*(The React app will run on http://localhost:5173)*

Open the frontend URL in multiple browser windows to test the real-time chat functionality!
