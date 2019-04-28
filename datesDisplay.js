const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const moment = require('moment');

const format = 'ddd, hA';
const secInWeek = 604800;

var pixel = require("node-pixel");
var five = require("johnny-five");

var rl = readline.createInterface(process.stdin, process.stdout);
var board = new five.Board();
var strip;

var userIn = [];

var index = 0;


// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

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
        strip.color("#003464");
        strip.show();
    });

    // Load client secrets from a local file.
    fs.readFile('credentials.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        // Authorize a client with credentials, then call the Google Calendar API.
        readline
        authorize(JSON.parse(content), listEvents);
    });

    rl.question("Input: ", (answer) =>  {
        rl.setPrompt("Input (q to quit): ");
        rl.prompt();
        rl.on("line", (res) => {
            if(res == 'q') {
                rl.close();
            } else {
                userIn.push(res.trim());
                // strip.pixel(index).color("#ffffff");
                // strip.show();
                //index++;
                rl.setPrompt("Input (q to quit): ");
                rl.prompt();
            }
        }); 
    });
});


/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Lists the next events on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listEvents(auth, calID) {
	const calendar = google.calendar({version: 'v3', auth});
	var currInstant = new Date();
	var futureInstant = new Date();
	futureInstant.setDate(futureInstant.getDate() + 3);
	
	calendar.events.list({
        //change calendar here
		calendarId: 'ucr.edu_7e0jsjl3j2sj1ieb1c9ae7q470@group.calendar.google.com',
		timeMin: currInstant.toISOString(),
		timeMax: futureInstant.toISOString(),
		singleEvents: true,
		orderBy: 'startTime',
	}, (err, res) => {
		if (err) return console.log('The API returned an error: ' + err);
		const events = res.data.items;
		if (events.length) {
			console.log('You have '+ events.length + ' events over the next 3 days: \n');
			events.map((event, i) => {
                const start = moment(event.start.dateTime).format(format);
				const end = moment(event.end.dateTime).format(format);
                
				var startDateObj = moment(event.start.dateTime).toDate();
				var difftime_millis = Math.abs(startDateObj.getTime() - currInstant);
                var difftime_hours = Math.floor(difftime_millis / 3600000);
                i = (Math.floor(difftime_millis/3600000) - 1);
                // for(i; i < 4; i++) {
                strip.pixel(i).color("#ff5555");
                    // strip.pixel(149-i).color("#ff5555");
                // }
                strip.show();

				console.log(event.summary.substring(0, 30) + ": " + start + " to " + end + "\n" +
                            "T Minus: " + difftime_hours + " hours \n" + 
                            "LED: " + i + " and " + (149 - i));
			});
		} else {
			console.log('No upcoming events found.');
		}
	});
}

//things that ought to happen on close

rl.on('close', () => {
    console.log("%j", userIn.following);
    process.exit();
});

process.on('exit', function(code) {  
    strip.color("#000000");
    strip.show();
    console.log("Exiting Program");
});