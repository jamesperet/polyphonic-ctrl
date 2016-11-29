var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use('/public', express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.sendFile('index.html', { root : __dirname});
});

app.get('/roteiro.json', function(req, res){
  res.sendFile('roteiro.json', { root : __dirname});
});

io.on('connection', function(socket){
  if(socket.request._query['type'] == "controller"){
    console.log('a controller connected');
  } else {
    console.log('a player connected');
  }

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

  socket.on('play', function(file){
    io.emit('play', file);
    console.log('playing: ' + file.url.split("public/audio/").pop() + " (" + file.channels[0].volume + "/" + file.channels[1].volume + " | " + file.channels[0].pan + "/" + file.channels[1].pan + ")" );
  });

  socket.on('stop', function(file){
    io.emit('stop', file);
    console.log('stop file: ' + file.url);
  });

  socket.on('play ended', function(file){
    io.emit('play ended', file);
    console.log('play ended: ' + file.url);
  });

  socket.on('update playback', function(file){
    io.emit('update playback', file);
    console.log('update playback: ' + file.url);
  });

});

http.listen(process.env.PORT, function(){
  console.log('listening on *:3000');
});
