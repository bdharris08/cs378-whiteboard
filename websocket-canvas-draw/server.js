(function() {
  /*
   * Requirements
  */
  var io = require('socket.io').listen(4000);
  var connect = require('connect');
  var canvas = require('canvas');
  
  /*
   * 
   */

  var canvas = new canvas(900,600);
  var ctx = canvas.getContext('2d');
    
  /* 
   * DRAWING FUNCTIONS 
   */
  var drawLine = function(x0, y0, x1, y1,width,style) {
    ctx.lineWidth = width;
    ctx.strokeStyle = style;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    ctx.closePath();
  };
  
  var putWord= function(word,x,y,width,height) {
    var lastPhrase="";
    var measure=0;
    for (var i=0;i<word.length;i++) {
      measure=ctx.measureText(lastPhrase+word[i]).width;
      if (measure<width) {
        lastPhrase+=word[i];
      } else {
        ctx.fillText(lastPhrase,x,y);
        y+=height;
        lastPhrase=word[i];
      }
    }
    return {y: y, word: lastPhrase};
  };
  var putLine= function(line,x,y,width,height) {
    var wa=line.split(' ');
    var lastPhrase="";
    var measure=0;
    for (var i=0;i<wa.length;i++) {
      var w=wa[i];
      measure=ctx.measureText(lastPhrase+" "+w).width;
      if (measure<width) {
        lastPhrase+=(" "+w);
      } else {
        ctx.fillText(lastPhrase,x,y);
        y+=height;
        lastPhrase=w;
        measure=ctx.measureText(lastPhrase).width;
        if (measure>=width) {
           var data=putWord(lastPhrase,x,y,width,height);
           y = data.y
           lastPhrase=data.word;
        }
      }
      if (i==wa.length-1) {
        ctx.fillText(lastPhrase,x,y);
        y+=height;
        break;
      }
    }
    return y;
  };
  var putText= function(text,x,y,font,size,width,color) {
    ctx.font = size+"px "+font;
    ctx.fillStyle = color;
    var lines=text.split('\n');
    var i;
    var yn = y;
    for(i=0;i<lines.length;i++) {
      yn = putLine(lines[i],x,yn,width,size);
    }
  };
  var clearCanvas = function() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
  };
   
   
   
   var slides = new Array();
   
   
   
   /*
    * FILE SERVER
    */
  connect.createServer(
    connect.static(__dirname)
  ).listen(4001);
  
  
  var getSlideNames=function() {
    var slides_names = new Array();
    for(var i=0;i<slides.length;i++) {
      slides_names.push(slides[i].name);
    }
    return slides_names
  };
  
  /*
   * Socket Connection
   */ 
  io.sockets.on('connection', function(socket) {
    

    socket.emit('slideList',{ slides : getSlideNames()  });
    
    
  
    var img2 = canvas.toDataURL('image/png');
    socket.emit('loadpng',{ url : img2 });
    
    
    socket.on('newSlide', function() {
      console.log('newSlide');
      var sl = slides.length;
      var slide = { id: sl, name : 'Slide_'+ sl};
      slides.push(slide);
      io.sockets.emit('slideList',{ slides : getSlideNames()  });
      clearCanvas();
    });
    

    socket.on('clearClick', function() {
      console.log('clearClick');
      io.sockets.emit('clearCanvas');
      clearCanvas();
    });
    
    socket.on('drawClick', function(data) {
      console.log('drawClick');
      socket.broadcast.emit('draw', {
        x0: data.x0,
        y0: data.y0,
        x1: data.x1,
        y1: data.y1,
        width: data.width,
        style: data.style
      });
      drawLine(data.x0,data.y0,data.x1,data.y1,data.width,data.style);
    });
    
    socket.on('drawText', function(data) {
      console.log('drawText');
      socket.broadcast.emit('text', {
        text: data.text,
        x: data.x,
        y: data.y,
        font: data.font,
        size: data.size,
        width: data.width,
        color: data.color
      });
      putText(data.text,data.x,data.y,data.font,data.size,data.width,data.color);
    });
  });

}).call(this);

