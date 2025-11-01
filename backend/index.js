require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http"); // ✅ Required for Socket.io
const { Server } = require("socket.io");

const inboxRoutes = require("./routes/inbox");
const taskRoutes = require("./routes/tasks");

const app = express();
const server = http.createServer(app); // ✅ Create server first

// ✅ Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // your React frontend port
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  },
});

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ API Routes
app.use("/api/inbox", inboxRoutes);
app.use("/api/tasks", taskRoutes);

// ✅ Store `io` in app for use inside routes
app.set("io", io);

// ✅ MongoDB Connection
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");

    // Start the HTTP + WebSocket server
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ WebSocket Logic
io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});
