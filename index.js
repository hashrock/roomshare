const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

const serialize = require("./lib/serialize");
app.use(express.static("public"));

const users = {};
let tile = null;

let fs = require("fs");
const tileStr = fs.readFileSync("./public/tile.csv", "utf-8");
let map = tileStr.split("\n").map((i) => i.split(","));

io.on("connection", function (socket) {
  users[socket.id] = {
    x: 10,
    y: 10,
    d: 1,
    g: "",
  };

  socket.on("tile", function (msg) {
    io.emit("tile", msg);
    tile = msg;
  });
  socket.on("draw", function (msg) {
    io.emit("draw", msg);
    map[+msg.y][+msg.x] = msg.index;
  });
  socket.on("login", function (obj) {
    users[socket.id].g = obj.g;
    console.log(users);
    io.emit("users", users);
  });
  socket.on("move", function (obj) {
    users[socket.id] = obj;
    io.emit("move", {
      id: socket.id,
      ...obj,
    });
  });

  socket.on("disconnect", () => {
    console.log("delete: " + users[socket.id]);
    delete users[socket.id];
  });
});

setInterval(() => {
  if (tile) {
    serialize.saveImage(tile);
  }
}, 1000);
setInterval(() => {
  serialize.saveTile(map);
}, 1000);

http.listen(process.env.PORT | 3000, function () {});
