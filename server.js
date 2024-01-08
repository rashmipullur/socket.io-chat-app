const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
  console.log("a user connected 👩‍💻");

  // broadcasting to all clients
  io.emit("chat message", "a user has joined the chat");

  // handle username and room assignment
  socket.on("join", ({ username, room }) => {
    if (!username || !room)
      return console.warn("username and room are required.");

    socket.join(room);
    io.to(room).emit(
      "chat message",
      `${username} has joined the chat room - ${room}`
    );
  });

  // handling chat message
  socket.on("chat message", ({ username, room, message }) => {
    io.to(room).emit("chat message", `${username}: ${message}`);
  });

  socket.on("leaveRoom", ({ username, room }) => {
    socket.leave(room);
    io.to(room).emit("chat message", `${username} has left the room`);
  });

  // disconnect event
  socket.on("disconnect", () => {
    console.log("user disconnected");
    io.emit("chat message", "a user has left the chat");
  });
});

server.listen(3000, () => {
  console.log("socket.io server listening on port 3000");
});
