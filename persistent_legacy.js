var readline = require('readline');

var rl = readline.createInterface(process.stdin, process.stdout);

var userIn = {
    first: "",
    following: []
};

rl.question("Input: ", (answer) =>  {

    userIn.first = answer;
    
    rl.setPrompt("Input (q to quit): ");
    rl.prompt();

    rl.on("line", (res) => {

        if(res == 'q') {
            rl.close();
        } else {
            userIn.following.push(res.trim());
            rl.setPrompt("Input (q to quit): ");
            rl.prompt();
        }

    });
    
});


rl.on('close', () => {

    console.log("%j", userIn.following);
    process.exit();

});