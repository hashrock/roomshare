const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

const users = [];

io.on("connection", function (socket) {
  users.push(socket.id);
  socket.on("tile", function (msg) {
    io.emit("tile", msg);
  });
  socket.on("draw", function (msg) {
    io.emit("draw", msg);
  });
  socket.on("login", function (obj) {
    io.emit("users", users);
  });
  socket.on("disconnect", () => {
    const index = users.indexOf(socket.id);
    if (index !== -1) users.splice(index, 1);
  });
});

http.listen(process.env.PORT | 3000, function () {});
