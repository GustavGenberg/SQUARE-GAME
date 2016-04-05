/*

************************
***** Square-Game ******
********** by **********
**** Gustav Genberg ****
************************
************************
******** Github ********
** https://github.com **
**** /GustavGenberg ****
***** /SQUARE-GAME *****
************************

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
var players = [];
var map = {};

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

io.on('connection', function(socket){

  playerCount++;

  players[playerCount] = new Player(socket);

});



var Player = function (socket) {

  this.nickname = 'Unnamed';
  this.id = playerCount;
  this.interval = 0;
  this.size = Math.floor(Math.random() * 100) + 50;
  this.x = 0;
  this.y = 0;
  this.socket = socket;
  this.isPlaying = false;

  this.log('Connected');
  this.sockets();

};

Player.prototype = {
  log: function (data) {
    console.log('Player ' + this.id + ': ' + data);
  },

  reset: function () {
    var player = this;
    var socket = this.socket;

    clearInterval(player.interval);
    setTimeout(function () {
      delete map[socket.id];

      player.size = Math.floor(Math.random() * 100) + 50;
      player.x = 0;
      player.y = 0;

    }, 100);
    player.isPlaying = false;

    player.log('Got eaten!');

  },


  sockets: function () {
    var player = this;
    var socket = this.socket;
    socket.on('new-position', function (data) {
      if(player.isPlaying == true) {
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
      }
    });
    socket.on('new-nickname', function (data) {
      player.nickname = data.nickname.substring(0,10).replaceAll(' ', '');
    });
    socket.on('disconnect', function(){
      console.log('Disconnected');
      delete map[socket.id];
      playerCount--;
    });
    socket.on('play', function () {
      player.play();
    });

    this.log('Sockets bound');
  },

  play: function () {
    var player = this;
    var socket = this.socket;

    if(player.isPlaying == true) {
      player.log('Failed to set interval (player is already playing)');
    } else {
      player.isPlaying = true;

      player.interval = setInterval(function () {

        if(player.x >= config.map_width - player.size) { player.x = config.map_width - player.size}
        if(player.x <= 0) { player.x = 0 }

        if(player.y >= config.map_height - player.size) { player.y = config.map_height - player.size}
        if(player.y <= 0) { player.y = 0 }

        for(checkPlayer in map) {

          if(checkPlayer == socket.id) {
            continue;
          }

          if(player.x <= (map[checkPlayer].x + map[checkPlayer].size)
          		&& map[checkPlayer].x <= (player.x + player.size)
          		&& player.y <= (map[checkPlayer].y + map[checkPlayer].size)
          		&& map[checkPlayer].y <= (player.y + player.size)) {
            if(player.size < map[checkPlayer].size) {
              socket.emit('reset', {player: [map[checkPlayer].nickname, player.size, map[checkPlayer].size]});
              players[map[checkPlayer].id].size = players[map[checkPlayer].id].size + (player.size / 5);
              player.reset();
            }
          }

        }

        map[socket.id] = {id: player.id, nickname: player.nickname, size: player.size, x: player.x, y: player.y, data: '<div data-nickname="' + socket.id + '" class="player" style="width: ' + player.size + 'px;height: ' + player.size + 'px;top: ' + player.y + 'px;left: ' + player.x + 'px"><span>' + player.nickname + '</span></div>'};
      });

      this.log('Interval set successfully');
    }
  }
};

setInterval(function () {

  var data = '';
  for (player in map) {
    data = data + map[player].data;
  }

  io.emit('map', {data: data});
});
