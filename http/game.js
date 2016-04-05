var config = [];
config.socket_host = 'localhost';
config.socket_protocol = 'http';
config.socket_port = 1111;
config.express_host = 'localhost';
config.express_port = 2222;

function loadScript(url, callback) {
	var head = document.getElementsByTagName('head')[0];
	var script = document.createElement('script');
	script.type = 'text/javascript';
	script.src = url;
	script.onload = callback;
	head.appendChild(script);
}

loadScript('http://code.jquery.com/jquery-2.2.2.min.js', function () {
  loadScript(config.socket_protocol + '://' + config.socket_host + ':' + config.socket_port + '/socket.io/socket.io.js', function () {
    init();
  });
});

var x = 0, y = 0;
var keysDown = [];
var currentDirection = 0;

var init = function () {

  console.log('init()');

  var socket = io(config.socket_host + ':' + config.socket_port);


  setInterval(function () {
    socket.emit('new-position', {pos: currentDirection});
  });

  socket.on('map', function (data) {
    $(".container").html(data.data);
  });

  addEventListener("keydown", function (e) {
  	keysDown[e.keyCode] = true;
  }, false);

  addEventListener("keyup", function (e) {
  	delete keysDown[e.keyCode];
  }, false);

  setInterval(function () {
    if (38 in keysDown) { // Player holding up
  		currentDirection = 1;
  	}
  	if (40 in keysDown) { // Player holding down
  		currentDirection = 2;
  	}
  	if (37 in keysDown) { // Player holding left
  		currentDirection = 3;
  	}
  	if (39 in keysDown) { // Player holding right
  		currentDirection = 4;
  	}
  });

	$("#nickname").on('change', function () {
		socket.emit('new-nickname', {nickname: $(this).val()});
	});

};
