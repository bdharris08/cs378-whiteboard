(function() {
  var io = require('socket.io').listen(4000);
  var connect = require('connect');
  
  var sqlite3 = require('sqlite3');
  var db = new sqlite3.Database(':memory:');
  
  db.run("CREATE TABLE slide (x REAL, y REAL, type TEXT, clear INT)", function() {
    var clearStmt = db.prepare("INSERT INTO slide VALUES (0, 0, ' ', 1)");
    var drawStmt = db.prepare("INSERT INTO slide VALUES (?, ?, ?, 0)");
 
    connect.createServer(
      connect.static(__dirname)
    ).listen(8080);
    
    io.sockets.on('connection', function(socket) {
      
          db.each("SELECT rowid AS id, x, y, type, clear FROM slide", function(err, row) {
            if (row.clear) {
              socket.emit('clearCanvas');
            } else {
              socket.emit('draw', {
                x: row.x,
                y: row.y,
                type: row.type
              });
            }
            console.log(row.id + ":  x: " + row.x +" y: "+row.y+" type: "+row.type+" clear: "+ row.clear);
          });
          
      socket.on('clearClick', function() {
        console.log('clearClick');
        io.sockets.emit('clearCanvas');
        clearStmt.run();
      });
      
      socket.on('drawClick', function(data) {
        console.log('drawClick');
        socket.broadcast.emit('draw', {
          x: data.x,
          y: data.y,
          type: data.type
        });
        drawStmt.run(data.x,data.y,data.type);
      });
    });
  });
}).call(this);
