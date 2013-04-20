io = require('socket.io').listen(4000)
io.sockets.on 'connection', (socket) ->
	sockets.on 'drawClick', (data) ->
		socket.broadcast.emit 'draw', {x : data.x, y : data.y, type: data.type}
		return
	return
