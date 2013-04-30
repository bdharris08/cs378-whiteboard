(function() {
  /*
   * Requirements
  */
  var socketPort = 4000;
  var webPort = 80;
  
  
  
  
  var io = require('socket.io').listen(socketPort);//, { log: false });
  var connect = require('connect');
  var Canvas = require('canvas');
   /*
     * FILE SERVER
    */
  connect.createServer(
    connect.static(__dirname)
  ).listen(webPort);
  
  var slides = new Array();
  var scanvas = new Canvas(900,600);
  var sctx = scanvas.getContext('2d');
  var sslide = { id: 0, name : 'slide_0', canvas: scanvas, ctx: sctx};
  slides.push(sslide);
  console.log(slides.length);
  console.log(slides[0].canvas);
  
   

  /* 
   * DRAWING FUNCTIONS 
   */
  var drawLine = function(slide,x0, y0, x1, y1,width,style) {
    var canvas = slides[slide].canvas;
    var ctx = slides[slide].ctx;
    ctx.lineWidth = width;
    ctx.strokeStyle = style;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    ctx.closePath();
  };
  
  var putWord= function(slide,word,x,y,width,height) {
    var canvas = slides[slide].canvas;
    var ctx = slides[slide].ctx;
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
  var putLine= function(slide,line,x,y,width,height) {
    var canvas = slides[slide].canvas;
    var ctx = slides[slide].ctx;
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
           var data=putWord(slide,lastPhrase,x,y,width,height);
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
  var putText= function(slide,text,x,y,font,size,width,color) {
    var canvas = slides[slide].canvas;
    var ctx = slides[slide].ctx;
    ctx.font = size+"px "+font;
    ctx.fillStyle = color;
    var lines=text.split('\n');
    var i;
    var yn = y;
    for(i=0;i<lines.length;i++) {
      yn = putLine(slide,lines[i],x,yn,width,size);
    }
  };
  var clearCanvas = function(slide) {
    var canvas = slides[slide].canvas;
    var ctx = slides[slide].ctx;
    ctx.clearRect(0,0,canvas.width,canvas.height);
  };
   

  
  var getSlideNames=function() {
    var slides_names = new Array();
    for(var i=0;i<slides.length;i++) {
      slides_names.push(slides[i].name);
    }
    return slides_names;
  };
  
  
  

  
  
  /*
   * Socket Connection
   */ 
  io.sockets.on('connection', function(socket) {
    


    
    
    socket.join(slides[0].name);
    var img2 = slides[0].canvas.toDataURL('image/png');
    socket.emit('loadpng',{ slide: 0, url : img2 });
    var myslideNames =  getSlideNames();
    console.log(myslideNames);
    io.sockets.in(slides[0].name).emit('slideList',myslideNames);
    
    socket.on('newSlide', function() {
      console.log('newSlide');
      var sl = slides.length;
      var slcanvas = new Canvas(900,600);
      var slctx = slcanvas.getContext('2d');
      var slslide = { id: sl, name : 'slide_'+ sl, canvas: slcanvas, ctx: slctx};
      console.log(slslide);
      slides.push(slslide);
      var slideNames =  getSlideNames();
      io.sockets.emit('slideList', slideNames );
    });
    
    socket.on('setSlide', function(data) {
      var oldSlide = data.oldSlide;
      var slide = data.newSlide;
      console.log('setSlide');
      var img1 = slides[slide].canvas.toDataURL('image/png');
      socket.leave(slides[oldSlide].name);
      socket.join(slides[slide].name);
      socket.emit('clearCanvas',slide);
      socket.emit('loadpng',{ slide: slide, url : img1 });
    });
    

    socket.on('clearClick', function(slide) {
      console.log('clearClick');
      io.sockets.in(slides[slide].name).emit('clearCanvas',slide);
      clearCanvas(slide);
    });
    
    socket.on('drawClick', function(data) {
      console.log('drawClick: '+data.slide);
      console.log('  '+slides[data.slide].name);
          socket.broadcast.to(slides[data.slide].name).emit('draw', {
            slide: data.slide,
            x0: data.x0,
            y0: data.y0,
            x1: data.x1,
            y1: data.y1,
            width: data.width,
            style: data.style
          });
      drawLine(data.slide,data.x0,data.y0,data.x1,data.y1,data.width,data.style);
    });
    
    socket.on('drawText', function(data) {
      console.log('drawText');
        socket.broadcast.to(slides[data.slide].name).emit('text', {
          slide: data.slide,
          text: data.text,
          x: data.x,
          y: data.y,
          font: data.font,
          size: data.size,
          width: data.width,
          color: data.color
        });
      putText(data.slide,data.text,data.x,data.y,data.font,data.size,data.width,data.color);
    });
  });

}).call(this);
