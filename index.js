const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

const users = [];
let tile = null;
io.on("connection", function (socket) {
  users.push(socket.id);
  socket.on("tile", function (msg) {
    io.emit("tile", msg);
    tile = msg;
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

function saveImage(data) {
  // Base64のデータのみが入っている。
  var b64img = data.split(",")[1];
  var base64 = require("urlsafe-base64");
  var img = base64.decode(b64img);

  var fs = require("fs");
  fs.writeFile("public/tile.png", img, function (err) {
    if (err) {
      console.log(err);
    }
  });
}

setInterval(() => {
  if (tile) {
    saveImage(tile);
  }
}, 1000);

http.listen(process.env.PORT | 3000, function () {});
