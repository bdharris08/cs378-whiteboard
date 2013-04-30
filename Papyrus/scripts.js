// Generated by CoffeeScript 1.6.1
(function() {

  /*
  	Init
  */
  App.init = function() {
    
    //App.myHost = 'http://james20.dyndns.org:4000';
    App.myHost = 'http://192.168.1.100:4000';
    
    App.canvas = document.createElement('canvas');
    App.canvas.height = 600;
    App.canvas.width = 900;
    document.getElementsByTagName('article')[0].appendChild(App.canvas);
    
    App.Yellow = 'rgba(208,208,024,1)';
    App.White = 'rgba(208,208,208,1)';
    App.Erase = 'rgba(0,0,0,1)';
    App.MyColor = App.Yellow;
    App.MyWidth = 3;
    
    App.dotext = 0;
    App.t_x   = 0;
    App.t_y   = 0;
    App.t_w   = 100;
    App.t_h   = 50;
    App.t_size = 20;
    
    App.curSlide = 0;
    
    App.ctx = App.canvas.getContext("2d");
    App.ctx.fillStyle = "solid";
    App.ctx.strokeStyle = App.MyColor;
    App.ctx.lineWidth = App.MyWidth;
    var s = ((App.ctx.lineWidth<10)?'0':'')+App.ctx.lineWidth;
    document.getElementById('tickness-value').innerHTML = s;
    App.ctx.lineCap = "round";
    App.ctx.clearRect(0,0,App.canvas.width,App.canvas.height);

    App.oldX = 0;
    App.oldY = 0;
    App.dragged = 0;

    
    App.socket = io.connect(App.myHost);

    App.socket.on('draw', function(data) {

      if (data.slide != App.curSlide) return;
      //alert(data.slide+' '+App.curSlide);
      return App.drawLine(data.x0, data.y0, data.x1, data.y1,data.width,data.style);
    });
    App.socket.on('text', function(data) {
      if (data.slide != App.curSlide) return;
      return App.putText(data.text,data.x,data.y,data.font,data.size,data.width,data.color);
    });
    App.socket.on('clearCanvas', function(slide) {
      if (slide != App.curSlide) return;
      App.ctx.clearRect(0,0,App.canvas.width,App.canvas.height);
    });
    
    App.setSlide = function(slide) {
      if (App.curSlide==slide) return;
      var oldSlide = App.curSlide;
      App.curSlide = slide;
      App.socket.emit('setSlide',{oldSlide: oldSlide, newSlide: slide});
    };
    
    App.socket.on('slideList', function(slides) {
      var table = '<table id="clean-table">';
      for(var i = 0;i<slides.length; i++) {
      table += '<tr><td><button id="'+slides[i]+'-button" onclick="App.setSlide('+i+')">'+slides[i]+'</button></td></tr>';
      }
      table += '</table>';
      document.getElementById('slide-list-container').innerHTML = table;
    });
    
    
    App.socket.on('loadpng',function(data) {
      if (data.slide != App.curSlide) return;
      var drawing = new Image(); 
      drawing.onload = function() {
        App.ctx.drawImage(drawing,0,0);
      }
      drawing.src = data.url;
    });

    App.drawLine = function(x0, y0, x1, y1,width,style) {
      App.ctx.lineWidth = width;
      App.ctx.strokeStyle = style;
      App.ctx.beginPath();
      App.ctx.moveTo(x0, y0);
      App.ctx.lineTo(x1, y1);
      App.ctx.stroke();
      App.ctx.closePath();
    };
    
    App.getStyle = function(el,styleProp) {
      var camelize = function (str) {
        return str.replace(/\-(\w)/g, function(str, letter){
          return letter.toUpperCase();
        });
      };

      if (el.currentStyle) {
        return el.currentStyle[camelize(styleProp)];
      } else if (document.defaultView && document.defaultView.getComputedStyle) {
        return document.defaultView.getComputedStyle(el,null)
                                   .getPropertyValue(styleProp);
      } else {
        return el.style[camelize(styleProp)]; 
      }
    };

    App.putWord= function(word,x,y,width,height) {
      var lastPhrase="";
      var measure=0;
      for (var i=0;i<word.length;i++) {
        measure=App.ctx.measureText(lastPhrase+word[i]).width;
        if (measure<width) {
          lastPhrase+=word[i];
        } else {
          App.ctx.fillText(lastPhrase,x,y);
          y+=height;
          lastPhrase=word[i];
        }
      }
      return {y: y, word: lastPhrase};
    };
    App.putLine= function(line,x,y,width,height) {
      var wa=line.split(' ');
      var lastPhrase="";
      var measure=0;
      for (var i=0;i<wa.length;i++) {
        var w=wa[i];
        measure=App.ctx.measureText(lastPhrase+" "+w).width;
        if (measure<width) {
          lastPhrase+=(" "+w);
        } else {
          App.ctx.fillText(lastPhrase,x,y);
          y+=height;
          lastPhrase=w;
          measure=App.ctx.measureText(lastPhrase).width;
          if (measure>=width) {
             var data=App.putWord(lastPhrase,x,y,width,height);
             y = data.y
             lastPhrase=data.word;
          }
        }
        if (i==wa.length-1) {
          App.ctx.fillText(lastPhrase,x,y);
          y+=height;
          break;
        }
      }
      return y;
    };
    
    App.putText= function(text,x,y,font,size,width,color) {
      App.ctx.font = size+"px "+font;
      App.ctx.fillStyle = color;
      var lines=text.split('\n');
      var i;
      var yn = y;
      for(i=0;i<lines.length;i++) {
        yn = App.putLine(lines[i],x,yn,width,size);
      }
    };
    
  };

  /*
  	Draw Events
  */
  $('canvas').live('click touchenter', function(e) {
    var type = e.handleObj.type;
    if (type == 'live')  e.preventDefault();
    var x,y;
    var offset = $(this).offset();
    e.offsetX = e.layerX - offset.left;
    e.offsetY = e.layerY - offset.top;
    x = e.offsetX;
    y = e.offsetY;
    if (App.dotext) {
      
    } else {
      if (App.dragged==0) {
        App.drawLine(x, y, x+1, y+1,App.MyWidth,App.MyColor);
        App.socket.emit('drawClick', {
          slide: App.curSlide,
          x0: x,
          y0: y,
          x1: x+1,
          y1: y+1,
          width: App.MyWidth,
          style: App.MyColor
        });
      }
      App.dragged = 0;
    }
  });

  $('canvas').live('dragstart touchstart', function(e) {
    var type = e.handleObj.type;
    if (type == 'live')  e.preventDefault();
    var offset = $(this).offset();
    e.offsetX = e.layerX - offset.left;
    e.offsetY = e.layerY - offset.top;
    if (App.dotext) {
      App.t_x = e.offsetX;
      App.t_y = e.offsetY;
    } else {
      App.oldX = e.offsetX;
      App.oldY = e.offsetY;
      App.dragged = 1;
    }
  });
  
  $('canvas').live('drag touchmove', function(e) {
    var type = e.handleObj.type;
    if (type == 'live')  {
      e.preventDefault();
    }
    var offset, x, y;
    offset = $(this).offset();
    e.offsetX = e.layerX - offset.left;
    e.offsetY = e.layerY - offset.top;
    x = e.offsetX;
    y = e.offsetY;
    
    if (App.dotext) {
      App.t_w = e.offsetX - App.t_x;
      App.t_h = e.offsetY - App.t_y;
      if (App.t_w<50) App.t_w = 50;
      if (App.t_h<50) App.t_h = 50;
      if (App.t_w>900) App.t_w = 900;
      if (App.t_h>600) App.t_h = 600;
    } else {
      App.drawLine(App.oldX, App.oldY, x, y,App.MyWidth,App.MyColor);
      App.socket.emit('drawClick', {
        slide: App.curSlide,
        x0: App.oldX,
        y0: App.oldY,
        x1: x,
        y1: y,
        width: App.MyWidth,
        style: App.MyColor
      });
      App.oldX = x;
      App.oldY = y;
      App.dragged = 1;
    }
  });

  $('canvas').live('dragend touchend', function(e) {
    var type = e.handleObj.type;
    
    var offset, type, x, y;
    offset = $(this).offset();
    e.offsetX = e.layerX - offset.left;
    e.offsetY = e.layerY - offset.top;
    x = e.offsetX;
    y = e.offsetY;
    if (App.dotext) {
      if ($('#textAreaPopUp').length != 0) {
        document.getElementById('textAreaPopUp').style.top = App.t_y +"px";
        document.getElementById('textAreaPopUp').style.left = App.t_x +"px";
        document.getElementById('textareaTest').style.height = App.t_h +"px";
        document.getElementById('textareaTest').style.width = App.t_w +"px";
      } else {
        var textArea = "<div id='textAreaPopUp' style='position:absolute;top:"+App.t_y+"px;left:"+App.t_x+"px;z-index:30;'><textarea id='textareaTest' style='font-size:"+ App.t_size+"px;font-family:Arial;width:"+App.t_w+"px;height:"+App.t_h+"px;'></textarea></div>";
        document.getElementById('myOverlay').innerHTML = textArea;
      }
    } else {
    if (App.oldX!=x && App.oldY!=y) {
        if (type == 'live')  {
          
          e.preventDefault();
          return;
        }
      }
      App.drawLine(App.oldX, App.oldY, x, y,App.MyWidth,App.MyColor);
      App.socket.emit('drawClick', {
        slide: App.curSlide,
        x0: App.oldX,
        y0: App.oldY,
        x1: x,
        y1: y,
        width: App.MyWidth,
        style: App.MyColor
      });
      App.oldX = x;
      App.oldY = y;
      App.dragged = 1;
    }
  });


  $(function() {
    return App.init();
  });

  document.getElementById('thinner-button').onclick = function() {
    App.MyWidth--;
    if (App.MyWidth<1) App.MyWidth=1;
    var s = ((App.MyWidth<10)?'0':'')+App.MyWidth;
    document.getElementById('tickness-value').innerHTML = s;
  };
  document.getElementById('thicker-button').onclick = function() {
    App.MyWidth++;
    if (App.MyWidth>40) App.MyWidth=40;
    var s = ((App.MyWidth<10)?'0':'')+App.MyWidth;
    document.getElementById('tickness-value').innerHTML = s;
  };
  document.getElementById('yellow-button').onclick = function() {
    App.MyColor = App.Yellow;
  };
  document.getElementById('white-button').onclick = function() {
    App.MyColor = App.White;
  };
  document.getElementById('erase-button').onclick = function() {
    App.MyColor = App.Erase;
  };
  document.getElementById('line-button').onclick = function() {
    App.dotext = 0;
  };
  document.getElementById('new-text-button').onclick = function() {
    App.dotext = 1;
  };
  document.getElementById('save-text-button').onclick = function() {
      var txtArea = document.getElementById('textareaTest');
      var size = App.t_size;
      var face = App.getStyle(txtArea,'font-family');
      App.putText(txtArea.value,App.t_x,App.t_y,face,size,App.t_w,App.MyColor);
      App.socket.emit('drawText', {
          slide: App.curSlide,
          text: txtArea.value,
          x: App.t_x,
          y: App.t_y,
          font: face,
          size: size,
          width: App.t_w,
          color: App.MyColor
      });
      $('#textareaTest').remove();
      $('#textAreaPopUp').remove();
      
  };
  document.getElementById('cancel-text-button').onclick = function() {
      $('#textareaTest').remove();
      $('#textAreaPopUp').remove();
  };
  
  
  document.getElementById('clear-button').onclick = function() {
    App.socket.emit('clearClick',App.curSlide);
  };
  document.getElementById('New-button').onclick = function() {
    App.socket.emit('newSlide');
  };
  
  
}).call(this);