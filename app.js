/*

***** Square-Game ******
********** by **********
**** Gustav Genberg ****

*/

var config = require('./config.js');

var express = require('express');
var app = express();

var io = require('socket.io')(config.socket_port);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/http/index.html');
});
app.get('/game.js', function (req, res) {
  res.sendFile(__dirname + '/http/game.js');
});
app.get('/game.css', function (req, res) {
  res.sendFile(__dirname + '/http/game.css');
});
app.listen(config.http_port, function () {
  console.log('Express App listening on port ' + config.http_port);
});

var playerCount = 0;
var map = [];

io.on('connection', function(socket){

  var player = [];

  console.log('a user connected');

  playerCount++;

  socket.on('disconnect', function(){
    console.log('user disconnected');

    map[socket.id] = null;
    playerCount--;
  });

  player.nickname = 'TEST';
  player.y = 0;
  player.x = 0;
  player.size = 20;


  socket.on('new-position', function (data) {
    if(data.pos == 1) {
      player.y--;
    }
    if(data.pos == 2) {
      player.y++;
    }
    if(data.pos == 3) {
      player.x--;
    }
    if(data.pos == 4) {
      player.x++;
    }
    if(player.x >= config.map_width - player.size) { player.x = config.map_width - player.size}
    if(player.x <= 0) { player.x = 0 }

    if(player.y >= config.map_height - player.size) { player.y = config.map_height - player.size}
    if(player.y <= 0) { player.y = 0 }
    console.log(player.nickname.length);
    map[socket.id] = {data: '<div data-nickname="' + socket.id + '" class="player" style="top: ' + player.y + 'px;left: ' + player.x + 'px"><span style="margin-left: ' + -50 + 'px">' + player.nickname + '</span></div>'};
  });

  socket.on('new-nickname', function (data) {
    player.nickname = data.nickname.substring(0,10);;
  });


});

setInterval(function () {

  var data = '';

  for (var key in map) {
    if (map.hasOwnProperty(key)) {
      var obj = map[key];
      for (var prop in obj) {
         if (obj.hasOwnProperty(prop)) {
            data = data + obj[prop];
         }
      }
    }
  }

  io.emit('map', {data: data});
});
