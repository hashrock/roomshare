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

function saveTile(map) {
  const o = map.map((i) => i.join(",")).join("\n");
  var fs = require("fs");
  fs.writeFile("public/tile.csv", o, function (err) {
    if (err) {
      console.log(err);
    }
  });
}

module.exports = {
  saveImage,
  saveTile,
};
