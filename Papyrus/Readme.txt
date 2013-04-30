Papyrus
  Papyrus is a collaborative white board that supports drawing tools and text.
It provides multiple boards that can be worked on independantly. It is power by
Node.js.  Currently requires a modern browsers such as Firefox, Safari or Chrome.


Installation:

  Windows 7 or 8:
    Download and install NodeJS
    http://nodejs.org/
    
    If you don't have a some recent version of Visual Studio download and install
    http://www.microsoft.com/visualstudio/en-us/products/2010-editions/visual-cpp-express
    
    Install Python 2.74 (32bit should work regardlless of operating system)
    http://www.python.org/getit/
    
    Download GTK all in one bundle
    (32bit) http://ftp.gnome.org/pub/gnome/binaries/win32/gtk+/2.24/gtk+-bundle_2.24.10-20120208_win32.zip
    (64bit) http://ftp.gnome.org/pub/gnome/binaries/win64/gtk+/2.22/gtk+-bundle_2.22.1-20101229_win64.zip
    Copy the contents to C:\GTK, then add "C:\GTK\bin" to PATH enviroment varible

    Then from the commandline, navigate to Papyrus folder
    
    Run the following
    
    npm install -g node-gyp
    npm install socket.io
    npm install connect
    npm install canvas
    
    
    Open and edit the following Files:
    
      scripts.js
        change the following to localhost or local ip and perfer socket IP
          App.myHost = 'http://192.168.1.100:4000';
            
      server.js
        change the following to whatever open ports you have
            var socketPort = 4000;
            var webPort = 80;
            
      index.html
        change the following to localhost or local ip and perfer socket IP, Line is near the end
          <script src="http://192.168.1.100:4000/socket.io/socket.io.js"></script>
    
  Linux:
      Install Windows, it's currently a pain to install on linux due to the need
    to build from recent sources
    
Usage:
  
  Run the following from the command line
    node server.js
    
    
    
    
    
    

