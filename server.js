var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var serverPort = 1818;
var fs = require('fs');
var util = require('util');
var debounce
var count = 0;
var debounceCount = 0;

var now = new Date();
var dateStr = now.getUTCFullYear().toString() + "/" +
          (now.getUTCMonth() + 1).toString() +
          "/" + now.getUTCDate() + " " + now.getUTCHours() +
          ":" + now.getUTCMinutes() + ":" + now.getUTCSeconds();

var log_file = fs.createWriteStream(__dirname + '/log.txt', {flags : 'w'});
var log_stdout = process.stdout;

console.log = function(d) { //To Write to a console file
  log_file.write(util.format(d) + '\n');
  log_stdout.write(util.format(d) + '\n');
};

server.listen(serverPort);
app.set('port', (process.env.PORT || serverPort));

app.use(express.static(__dirname + '/public'));

console.log('The server is running on ' + serverPort, true);
console.log('Started on ' + dateStr)
console.log('--------------------------------------------');

io.sockets.on('connection', function (socket) {

        socket.on('join room', function(data) {
        socket.join(data.room);
        console.log("User " + data.username + " Joined Room : " + data.room);
        socket.broadcast.to(data.room).emit('joined', data);
        });
		
 	socket.on('Message', function (data) {
	io.sockets.in(data.room).emit('Inbox', data);
			console.log('Message sent in ' + data.room);
    	});

 	    socket.on('PlayVideo', function (data) {
        socket.broadcast.to(data.room).emit('PlayVideo', data);
        count++;
        // Clear any existing debounce event
        clearTimeout(debounce);
        // Update and log the counts after 3 seconds
        setTimeout(function () {
          // Update the debounceCount
          debounceCount++;
          // Log the counts to the console
          console.log('true count', count);
          console.log('debounced count', debounceCount);
        }, 300);
        console.log(
          'Video Played In ' + data.room + ' initiated by ' + data.username
        );
      });

        socket.on('PauseVideo', function (data) {
			console.log('Video Paused In ' + data.room + ' initiated by ' + data.username);
        socket.broadcast.to(data.room).emit('PauseVideo', data)
        });
		
        socket.on('SyncPlayback', function (data) {
			console.log('Syncing Playback in ' + data.room + ' initiated by ' + data.username)
        socket.broadcast.to(data.room).emit('SyncPlayback', data)
        });

});
