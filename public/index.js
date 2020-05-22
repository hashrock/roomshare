const game = new Phaser.Game(400, 300, Phaser.CANVAS, "phaser-example", {
  preload: preload,
  create: create,
  update: update,
  render: render,
});
// game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
// game.scale.setMinMax(400, 300, 800, 600);

function preload() {
  game.load.tilemap("map", "tile.csv", null, Phaser.Tilemap.CSV);
  game.load.image("tiles", "tile.png");
  game.load.spritesheet("chara01", "chara01.png", 20, 28, 24);
}

//mapとlayerはeditorからも書き換える
let map;
let layer;

let marker;
let currentTile;
let cursors;

// var mapRef = firebase.database().ref("map");
// var drawRef = firebase.database().ref("draw");
// var tileRef = firebase.database().ref("tile");

// mapRef.on("value", function(snapshot) {
//   const data = snapshot.val();
//   for (x = 0; x < map.width; x++) {
//     for (y = 0; y < map.height; y++) {
//       putTile(data[y * map.width + x], x, y);
//     }
//   }
// });
// mapRef.once("value", function(snapshot) {
//   const dataStr = snapshot.val();
//   const data = dataStr.split(",");
//   for (y = 0; y < map.height; y++) {
//     for (x = 0; x < map.width; x++) {
//       putTile(data[y * map.width + x], x, y);
//     }
//   }
// });
// drawRef.on("value", function (snapshot) {
//   snapshot.forEach(function (snap) {
//     const op = snap.val();
//     putTile(op.index, op.x, op.y);
//   });
// });
socket.on("draw", (op) => {
  putTile(op.index, op.x * 16, op.y * 16);
});

var player;
let users = {};
let userSprites = {};
socket.on("users", (obj) => {
  users = obj;
  Object.keys(users).forEach(function (key) {
    if (socket.io.engine.id === key) {
      return;
    }
    if (!userSprites[key]) {
      addUser(key);
    }
  });
});

socket.on("move", (obj) => {
  if (socket.io.engine.id === obj.id) {
    return;
  }
  users[obj.id] = {
    x: obj.x,
    y: obj.y,
    d: obj.d,
  };
  moveUser(obj.id, obj.x, obj.y, obj.d);
});

socket.on("connect", () => {
  var id = socket.io.engine.id;
  console.log(id);

  socket.emit("login");
});

function addUser(id) {
  let user = game.add.sprite(300, 200, "chara01");
  user.animations.add("walk-down", [0, 1, 2, 1]);
  user.animations.add("walk-left", [6, 7, 8, 7]);
  user.animations.add("walk-right", [12, 13, 14, 13]);
  user.animations.add("walk-up", [18, 19, 20, 19]);
  userSprites[id] = user;
}

function moveUser(id, x, y, d) {
  if (userSprites[id]) {
    userSprites[id].x = x;
    userSprites[id].y = y;
    userSprites[id].d = d;

    // game.add
    //   .tween(userSprites[id])
    //   .to({ x: x, y: y }, 100, Phaser.Easing.Linear.None, true);
    switch (d) {
      case 0:
        userSprites[id].animations.play("walk-right", 8, true);
        break;
      case 1:
        userSprites[id].animations.play("walk-down", 8, true);
        break;
      case 2:
        userSprites[id].animations.play("walk-left", 8, true);
        break;
      case 3:
        userSprites[id].animations.play("walk-up", 8, true);
        break;
    }
  }
}

function create() {
  map = game.add.tilemap("map", 16, 16);
  map.addTilesetImage("tiles");
  layer = map.createLayer(0);
  currentTile = 0;
  layer.resizeWorld();

  marker = game.add.graphics();
  marker.lineStyle(2, 0x000000, 1);
  marker.drawRect(0, 0, 16, 16);

  cursors = game.input.keyboard.createCursorKeys();

  game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
  game.scale.setMinMax(800, 600, 800, 600);

  player = game.add.sprite(300, 200, "chara01");
  player.animations.add("walk-down", [0, 1, 2, 1]);
  player.animations.add("walk-left", [6, 7, 8, 7]);
  player.animations.add("walk-right", [12, 13, 14, 13]);
  player.animations.add("walk-up", [18, 19, 20, 19]);

  game.camera.follow(player);
}

function putTile(tile, x, y) {
  map.putTile(tile, layer.getTileX(x), layer.getTileY(y));
}

function getTile(x, y) {
  return map.getTile(layer.getTileX(x), layer.getTileY(y));
}

function throttle(func, timeFrame) {
  var lastTime = 0;
  return function () {
    var now = new Date();
    if (now - lastTime >= timeFrame) {
      func();
      lastTime = now;
    }
  };
}
let d = 0;

function sendMove() {
  socket.emit("move", { x: player.x, y: player.y, d: d });
}
let move = throttle(sendMove, 100);

function update() {
  marker.x = layer.getTileX(game.input.activePointer.worldX) * 16;
  marker.y = layer.getTileY(game.input.activePointer.worldY) * 16;

  //マップチップの描画処理
  if (game.input.mousePointer.isDown) {
    //スポイト処理
    if (game.input.keyboard.isDown(Phaser.Keyboard.SHIFT)) {
      currentTile = getTile(marker.x, marker.y);
    } else {
      if (getTile(marker.x, marker.y).index != currentTile) {
        putTile(currentTile, marker.x, marker.y);
        let x = 0;
        let y = 0;
        let result = [];

        for (y = 0; y < map.height; y++) {
          for (x = 0; x < map.width; x++) {
            result.push(getTile(x, y).index);
          }
        }
        socket.emit("draw", {
          index: currentTile,
          x: marker.x / 16,
          y: marker.y / 16,
        });
        // drawRef.push({ index: currentTile, x: marker.x, y: marker.y });
      }
    }
  }

  if (cursors.left.isDown) {
    player.animations.play("walk-left", 8, true);
    player.x -= 3;
    d = 2;
    move();
  } else if (cursors.right.isDown) {
    player.animations.play("walk-right", 8, true);
    player.x += 3;
    d = 0;
    move();
  }

  if (cursors.up.isDown) {
    player.animations.play("walk-up", 8, true);
    player.y -= 3;
    d = 3;
    move();
  } else if (cursors.down.isDown) {
    player.animations.play("walk-down", 8, true);
    player.y += 3;
    d = 1;
    move();
  }
}

function render() {
  // game.debug.text("マップチップかけるよー", 16, 16, "#efefef");
}
