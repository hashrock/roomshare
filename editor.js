var editor = document.getElementById("map")
var editorDetail = document.getElementById("detail")
var bufferEl = document.getElementById("buffer")
var emitter = new EventEmitter3()

//https://androidarts.com/palette/16pal.htm
var colors = [
  "#000000",
  "#9D9D9D",
  "#FFFFFF",
  "#BE2633",
  "#E06F8B",
  "#493C2B",
  "#A46422",
  "#EB8931",
  "#F7E26B",
  "#2F484E",
  "#44891A",
  "#A3CE27",
  "#1B2632",
  "#005784",
  "#31A2F2",
  "#B2DCEF",
]

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}


class Detail {

  setPixel(x, y) {
    var pix = this.img.data
    var rgb = hexToRgb(this.selectedColor)

    this.img.data[(y * 32 + x) * 4] = rgb.r
    this.img.data[(y * 32 + x) * 4 + 1] = rgb.g
    this.img.data[(y * 32 + x) * 4 + 2] = rgb.b
    this.img.data[(y * 32 + x) * 4 + 3] = 256
    this.redraw()
  }

  mouseEvent(ev) {
    var x, y;
    x = ev.layerX;
    y = ev.layerY;

    if (y < 256) {
      //draw dot
      this.setPixel(Math.floor(x / 8), Math.floor(y / 8))
      emitter.emit("updateImage", this.img)
    } else {
      //select pallete
      var idx = Math.floor(x / 16)
      this.selectedColor = colors[idx]
    }
  }
  init(el) {
    this.el = el;
    this.context = this.el.getContext('2d');
    this.drawPallete()
    this.selectedColor = colors[0]
    this.el.addEventListener("mousedown", (ev) => {
      this.mousedown = true;
      this.mouseEvent(ev);
    });
    this.el.addEventListener("mouseup", () => {
      this.mousedown = false;
    });
    this.el.addEventListener("mousemove", (ev) => {
      if (this.mousedown) {
        this.mouseEvent(ev);
      }
    })
  }

  drawPallete() {
    for (var i = 0; i < colors.length; i++) {
      var y = 256;
      this.context.fillStyle = colors[i]
      this.context.fillRect(i * 16, y, 16, 10)
    }
  }

  redraw() {
    var pix = this.img.data
    for (var y = 0; y < 32; y++) {
      for (var x = 0; x < 32; x++) {
        var p = y * 32 * 4 + x * 4
        var r = pix[p]
        var g = pix[p + 1]
        var b = pix[p + 2]
        this.context.fillStyle = `rgb(${r}, ${g}, ${b})`
        this.context.fillRect(x * 8, y * 8, 8, 8)
      }
    }
  }

  setData(imgData) {
    this.img = imgData;
    this.redraw();
  }

}

class Editor {
  redraw() {
    this.context.drawImage(this.bufferEl, 0, 0);
    this.context.strokeRect(this.selected % 8 * 32, Math.floor(this.selected / 8) * 32, 32, 32)
  }

  init(el, editorDetail, buffer) {
    this.editorEl = el;
    this.context = this.editorEl.getContext('2d');
    this.selected = 0;
    this.bufferEl = buffer;

    this.img = new Image();
    this.img.src = "./init.png"
    this.img.onload = () => {
      this.bufferEl.getContext("2d").drawImage(this.img, 0, 0);
      this.redraw()
    }
    this.context.fillStyle = "rgb(255,255,255)"
    this.context.fillRect(0, 0, 300, 300)
    this.started = false;
    this.editorEl.addEventListener('mousemove', (ev) => {

    }, false);

    this.editorEl.addEventListener('click', (ev) => {
      var x, y;
      x = ev.layerX;
      y = ev.layerY;
      this.selected = toTile(x, y)
      currentTile = this.selected

      var grid = toGrid(this.selected)
      var imgData = this.bufferEl.getContext("2d").getImageData(grid.x * 32, grid.y * 32, 32, 32);
      this.detail.setData(imgData)

      this.redraw()
    }, false);

    this.detail = new Detail()
    this.detail.init(editorDetail)
    emitter.on("updateImage", (imageData) => {
      console.log("updateImage")
      var grid = toGrid(this.selected)
      this.bufferEl.getContext("2d").putImageData(imageData, grid.x * 32, grid.y * 32)
      this.redraw()
      map.tilesets[0].image.src = bufferEl.toDataURL("image/png");
      map.layer.dirty = true

    });

  }

  constructor() {
  }
}

function toGrid(idx) {
  return {
    x: idx % 8,
    y: Math.floor(idx / 8)
  }
}
function toTile(x, y) {
  return Math.floor(x / 32) + Math.floor(y / 32) * 8
}

var e = new Editor()
e.init(editor, editorDetail, bufferEl)
