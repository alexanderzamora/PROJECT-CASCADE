var readline = require('readline');
var pixel = require("node-pixel");
var five = require("johnny-five");

var rl = readline.createInterface(process.stdin, process.stdout);
var board = new five.Board();
var strip;

var userIn = [];

var index = 0;

board.on("ready", function() {

    strip = new pixel.Strip({
        board: this,
        controller: "FIRMATA",
        strips: [
            {
                pin: 6, 
                length: 150
            }
        ],
        gamma: 2.8
    });

    strip.on("ready", function() {
        strip.color("#440044");
        strip.show();
    });

    rl.question("Input: ", (answer) =>  {
        
        rl.setPrompt("Input (q to quit): ");
        rl.prompt();

        rl.on("line", (res) => {

            if(res == 'q') {
                rl.close();
            } else {
                userIn.push(res.trim());
                strip.pixel(index).color("#ffffff");
                strip.show();
                index++;
                rl.setPrompt("Input (q to quit): ");
                rl.prompt();
            }

        });
        
    });

});

rl.on('close', () => {
    console.log("%j", userIn.following);
    process.exit();
});

process.on('exit', function(code) {  
    strip.color("#000000");
    strip.show();
    console.log("Exiting Program");
});