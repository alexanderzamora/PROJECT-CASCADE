var pixel = require("node-pixel");
var five = require("johnny-five");

var board = new five.Board();
var strip;

board.on("ready", function() {

    strip = new pixel.Strip({
        board: this,
        controller: "FIRMATA",
        strips: [
            {
                pin: 6, 
                length: 32
            }
        ],
        gamma: 2.8
    });

    strip.on("ready", function() {
        strip.color("#ffffff");
        strip.show();
    });
});