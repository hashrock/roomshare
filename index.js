var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update, render: render });

function preload() {
    game.load.tilemap('map', 'init.csv', null, Phaser.Tilemap.CSV);
    game.load.image('tiles', 'init.png');
}

//mapとlayerはeditorからも書き換える
var map;
var layer;


var marker;
var currentTile;
var cursors;

function create() {
    map = game.add.tilemap('map', 32, 32);
    map.addTilesetImage('tiles');
    layer = map.createLayer(0);
    //currentTile = map.getTile(2, 3);
    currentTile = 0;
    layer.resizeWorld();

    marker = game.add.graphics();
    marker.lineStyle(2, 0x000000, 1);
    marker.drawRect(0, 0, 32, 32);

    cursors = game.input.keyboard.createCursorKeys();

}

function update() {

    marker.x = layer.getTileX(game.input.activePointer.worldX) * 32;
    marker.y = layer.getTileY(game.input.activePointer.worldY) * 32;

    if (game.input.mousePointer.isDown) {
        if (game.input.keyboard.isDown(Phaser.Keyboard.SHIFT)) {
            currentTile = map.getTile(layer.getTileX(marker.x), layer.getTileY(marker.y));
        }
        else {
            if (map.getTile(layer.getTileX(marker.x), layer.getTileY(marker.y)).index != currentTile.index) {
                map.putTile(currentTile, layer.getTileX(marker.x), layer.getTileY(marker.y));
            }
        }
    }

    if (cursors.left.isDown) {
        game.camera.x -= 4;
    }
    else if (cursors.right.isDown) {
        game.camera.x += 4;
    }

    if (cursors.up.isDown) {
        game.camera.y -= 4;
    }
    else if (cursors.down.isDown) {
        game.camera.y += 4;
    }

}

function render() {
    game.debug.text('マップチップかけるよー', 32, 32, '#efefef');
}
